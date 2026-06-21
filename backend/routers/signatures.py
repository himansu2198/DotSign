from fastapi import APIRouter, Depends, HTTPException, Request
from pydantic import BaseModel
from typing import Optional, List
from middleware.auth_middleware import get_current_user
from supabase import create_client
import os
import fitz
import base64
import secrets
from dotenv import load_dotenv

load_dotenv()

router = APIRouter()

supabase_client = create_client(
    os.getenv("SUPABASE_URL"),
    os.getenv("SUPABASE_SERVICE_KEY")
)


class SaveSignatureRequest(BaseModel):
    document_name: str
    x_percent: float
    y_percent: float
    page_number: int = 1
    signature_img: str


class FinalizeRequest(BaseModel):
    document_name: str


class CreateLinkRequest(BaseModel):
    document_name: str
    signer_email: str


class SignWithTokenRequest(BaseModel):
    token: str
    signatures: list
    signer_name: Optional[str] = "Anonymous"


# ─── Save signature position to DB ───
@router.post("/save")
async def save_signature(
    body: SaveSignatureRequest,
    current_user: dict = Depends(get_current_user)
):
    try:
        user_id = current_user["id"]

        result = supabase_client.table("signatures").insert({
            "document_name": body.document_name,
            "owner_id": user_id,
            "x_percent": body.x_percent,
            "y_percent": body.y_percent,
            "page_number": body.page_number,
            "signature_img": body.signature_img,
            "status": "placed",
        }).execute()

        print(f"✅ Signature saved: owner={user_id} doc={body.document_name} x={body.x_percent} y={body.y_percent}")

        return {
            "success": True,
            "signature": result.data[0],
            "message": "Signature position saved!"
        }
    except Exception as e:
        print(f"❌ Save error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


# ─── Debug endpoint ───
@router.get("/debug/{document_name}")
async def debug_signatures(
    document_name: str,
    current_user: dict = Depends(get_current_user)
):
    try:
        user_id = current_user["id"]

        all_sigs = supabase_client.table("signatures").select("*").execute()
        user_sigs = supabase_client.table("signatures")\
            .select("*")\
            .eq("owner_id", user_id)\
            .execute()
        doc_sigs = supabase_client.table("signatures")\
            .select("*")\
            .eq("document_name", document_name)\
            .execute()

        return {
            "user_id": user_id,
            "total_signatures_in_db": len(all_sigs.data),
            "user_signatures": len(user_sigs.data),
            "doc_signatures": len(doc_sigs.data),
            "document_name_searched": document_name,
            "all_doc_names_in_db": [s["document_name"] for s in all_sigs.data],
            "user_sig_doc_names": [s["document_name"] for s in user_sigs.data],
        }
    except Exception as e:
        return {"error": str(e)}


# ─── Get signatures for a document ───
@router.get("/doc/{document_name}")
async def get_signatures(
    document_name: str,
    current_user: dict = Depends(get_current_user)
):
    try:
        result = supabase_client.table("signatures")\
            .select("*")\
            .eq("document_name", document_name)\
            .eq("owner_id", current_user["id"])\
            .execute()

        return {"success": True, "signatures": result.data}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ─── Finalize — embed all saved signatures into PDF ───
@router.post("/finalize")
async def finalize_document(
    body: FinalizeRequest,
    current_user: dict = Depends(get_current_user)
):
    try:
        user_id = current_user["id"]

        print(f"🔍 Finalize request: doc={body.document_name} user={user_id}")

        # Get all signatures from DB
        result = supabase_client.table("signatures")\
            .select("*")\
            .eq("document_name", body.document_name)\
            .eq("owner_id", user_id)\
            .execute()

        print(f"📋 Found {len(result.data)} signatures in DB")

        signatures = result.data
        if not signatures:
            # Try without owner filter to debug
            all_result = supabase_client.table("signatures")\
                .select("*")\
                .eq("document_name", body.document_name)\
                .execute()
            print(f"📋 Without owner filter: {len(all_result.data)} signatures")
            print(f"📋 All doc names: {[s['document_name'] for s in supabase_client.table('signatures').select('document_name').execute().data]}")
            raise HTTPException(
                status_code=404,
                detail=f"No signatures found for document: {body.document_name}"
            )

        # Download PDF from Supabase Storage
        pdf_bytes = supabase_client.storage.from_("documents").download(
            f"{user_id}/{body.document_name}"
        )

        # Open with PyMuPDF
        doc = fitz.open(stream=pdf_bytes, filetype="pdf")

        for sig in signatures:
            page_num = sig.get("page_number", 1) - 1
            if page_num >= len(doc):
                page_num = 0

            page = doc[page_num]
            page_width = page.rect.width
            page_height = page.rect.height

            # Convert percentage to actual PDF coordinates
            x = (sig["x_percent"] / 100) * page_width
            y = (sig["y_percent"] / 100) * page_height

            print(f"✍️ Embedding at x={x:.1f} y={y:.1f} on page {page_num + 1}")

            # Decode signature image
            img_data = base64.b64decode(sig["signature_img"].split(",")[1])

            # Place signature at exact position
            img_rect = fitz.Rect(x - 60, y - 20, x + 60, y + 20)
            page.insert_image(img_rect, stream=img_data)

        # Save signed PDF
        signed_pdf_bytes = doc.tobytes()
        doc.close()

        signed_file_name = f"signed_{body.document_name}"
        supabase_client.storage.from_("documents").upload(
            f"{user_id}/{signed_file_name}",
            signed_pdf_bytes,
            {"content-type": "application/pdf", "upsert": "true"}
        )

        # Get public URL
        signed_url = supabase_client.storage.from_("documents").get_public_url(
            f"{user_id}/{signed_file_name}"
        )

        # Update signature status
        supabase_client.table("signatures")\
            .update({"status": "signed"})\
            .eq("document_name", body.document_name)\
            .eq("owner_id", user_id)\
            .execute()

        # Log audit
        supabase_client.table("audit_logs").insert({
            "user_id": user_id,
            "user_email": current_user["email"],
            "document_name": body.document_name,
            "action": "document_signed",
            "ip_address": "internal",
        }).execute()

        return {
            "success": True,
            "signed_url": signed_url,
            "message": "Document signed successfully!"
        }

    except HTTPException:
        raise
    except Exception as e:
        print(f"❌ Finalize error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


# ─── Create public signing link ───
@router.post("/create-link")
async def create_signing_link(
    body: CreateLinkRequest,
    current_user: dict = Depends(get_current_user)
):
    try:
        token = secrets.token_urlsafe(32)

        supabase_client.table("signing_links").insert({
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


# ─── Verify public signing token ───
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


# ─── Sign with public token ───
@router.post("/sign-with-token")
async def sign_with_token(body: SignWithTokenRequest):
    try:
        result = supabase_client.table("signing_links")\
            .select("*")\
            .eq("token", body.token)\
            .execute()

        if not result.data:
            raise HTTPException(status_code=404, detail="Invalid token")

        link = result.data[0]
        if link["status"] == "signed":
            raise HTTPException(status_code=400, detail="Already signed")

        pdf_bytes = supabase_client.storage.from_("documents").download(
            f"{link['owner_id']}/{link['document_name']}"
        )

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

        signed_name = f"signed_{link['document_name']}"
        supabase_client.storage.from_("documents").upload(
            f"{link['owner_id']}/{signed_name}",
            signed_pdf_bytes,
            {"content-type": "application/pdf", "upsert": "true"}
        )

        signed_url = supabase_client.storage.from_("documents").get_public_url(
            f"{link['owner_id']}/{signed_name}"
        )

        supabase_client.table("signing_links")\
            .update({"status": "signed"})\
            .eq("token", body.token)\
            .execute()

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