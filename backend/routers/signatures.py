from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from typing import Optional
from middleware.auth_middleware import get_current_user
from supabase import create_client
import os
import secrets
from dotenv import load_dotenv

load_dotenv()

router = APIRouter()

supabase_client = create_client(
    os.getenv("SUPABASE_URL"),
    os.getenv("SUPABASE_SERVICE_KEY")
)

class CreateLinkRequest(BaseModel):
    document_name: str
    signer_email: str

class SignWithTokenRequest(BaseModel):
    token: str
    signatures: list
    signer_name: Optional[str] = "Anonymous"

@router.post("/create-link")
async def create_signing_link(
    body: CreateLinkRequest,
    current_user: dict = Depends(get_current_user)
):
    try:
        token = secrets.token_urlsafe(32)

        result = supabase_client.table("signing_links").insert({
            "token": token,
            "document_name": body.document_name,
            "owner_id": current_user["id"],
            "owner_email": current_user["email"],
            "signer_email": body.signer_email,
            "status": "pending",
        }).execute()

        signing_url = f"http://localhost:3000/sign/{token}"

        return {
            "success": True,
            "token": token,
            "signing_url": signing_url,
            "message": f"Signing link created for {body.signer_email}"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/verify/{token}")
async def verify_token(token: str):
    try:
        result = supabase_client.table("signing_links")\
            .select("*")\
            .eq("token", token)\
            .execute()

        if not result.data:
            raise HTTPException(status_code=404, detail="Invalid or expired link")

        link = result.data[0]

        if link["status"] == "signed":
            return {"success": False, "message": "Document already signed"}

        # Get document public URL
        doc_url = supabase_client.storage.from_("documents").get_public_url(
            f"{link['owner_id']}/{link['document_name']}"
        )

        return {
            "success": True,
            "document_name": link["document_name"],
            "signer_email": link["signer_email"],
            "owner_email": link["owner_email"],
            "doc_url": doc_url,
            "status": link["status"],
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/sign-with-token")
async def sign_with_token(body: SignWithTokenRequest):
    try:
        import fitz
        import base64

        # Verify token
        result = supabase_client.table("signing_links")\
            .select("*")\
            .eq("token", body.token)\
            .execute()

        if not result.data:
            raise HTTPException(status_code=404, detail="Invalid token")

        link = result.data[0]
        if link["status"] == "signed":
            raise HTTPException(status_code=400, detail="Already signed")

        # Download PDF
        pdf_bytes = supabase_client.storage.from_("documents").download(
            f"{link['owner_id']}/{link['document_name']}"
        )

        # Open with PyMuPDF and embed signatures
        doc = fitz.open(stream=pdf_bytes, filetype="pdf")
        page = doc[0]
        page_width = page.rect.width
        page_height = page.rect.height

        for sig in body.signatures:
            img_data = base64.b64decode(sig["img"].split(",")[1])
            x = (sig["x"] / 100) * page_width
            y = (sig["y"] / 100) * page_height
            img_rect = fitz.Rect(x - 60, y - 20, x + 60, y + 20)
            page.insert_image(img_rect, stream=img_data)

        signed_pdf_bytes = doc.tobytes()
        doc.close()

        # Upload signed PDF
        signed_name = f"signed_{link['document_name']}"
        supabase_client.storage.from_("documents").upload(
            f"{link['owner_id']}/{signed_name}",
            signed_pdf_bytes,
            {"content-type": "application/pdf", "upsert": "true"}
        )

        # Get signed URL
        signed_url = supabase_client.storage.from_("documents").get_public_url(
            f"{link['owner_id']}/{signed_name}"
        )

        # Update link status to signed
        supabase_client.table("signing_links")\
            .update({"status": "signed"})\
            .eq("token", body.token)\
            .execute()

        # Log audit
        supabase_client.table("audit_logs").insert({
            "user_id": link["owner_id"],
            "user_email": link["signer_email"],
            "document_name": link["document_name"],
            "action": "signed_via_link",
            "ip_address": "external",
        }).execute()

        return {
            "success": True,
            "signed_url": signed_url,
            "message": "Document signed successfully!"
        }

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))