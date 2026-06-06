from fastapi import APIRouter, Depends, HTTPException, Request
from pydantic import BaseModel
from typing import List
from middleware.auth_middleware import get_current_user
from supabase import create_client
import os
import fitz
import base64
from dotenv import load_dotenv

load_dotenv()

router = APIRouter()

supabase_client = create_client(
    os.getenv("SUPABASE_URL"),
    os.getenv("SUPABASE_SERVICE_KEY")
)

def log_action(user_id, user_email, document_name, action, ip="unknown"):
    try:
        supabase_client.table("audit_logs").insert({
            "user_id": user_id,
            "user_email": user_email,
            "document_name": document_name,
            "action": action,
            "ip_address": ip,
        }).execute()
    except:
        pass

class SignatureItem(BaseModel):
    x: float
    y: float
    img: str

class SignRequest(BaseModel):
    file_name: str
    signatures: List[SignatureItem]

@router.post("/sign")
async def sign_document(
    request: Request,
    body: SignRequest,
    current_user: dict = Depends(get_current_user)
):
    try:
        user_id = current_user["id"]
        user_email = current_user["email"]
        ip = request.client.host

        # Log — document viewed
        log_action(user_id, user_email, body.file_name, "document_signed", ip)

        # Download PDF
        pdf_bytes = supabase_client.storage.from_("documents").download(
            f"{user_id}/{body.file_name}"
        )

        # Open with PyMuPDF
        doc = fitz.open(stream=pdf_bytes, filetype="pdf")
        page = doc[0]
        page_width = page.rect.width
        page_height = page.rect.height

        for sig in body.signatures:
            img_data = base64.b64decode(sig.img.split(",")[1])
            x = (sig.x / 100) * page_width
            y = (sig.y / 100) * page_height
            img_rect = fitz.Rect(x - 60, y - 20, x + 60, y + 20)
            page.insert_image(img_rect, stream=img_data)

        signed_pdf_bytes = doc.tobytes()
        doc.close()

        signed_file_name = f"signed_{body.file_name}"
        supabase_client.storage.from_("documents").upload(
            f"{user_id}/{signed_file_name}",
            signed_pdf_bytes,
            {"content-type": "application/pdf", "upsert": "true"}
        )

        signed_url = supabase_client.storage.from_("documents").get_public_url(
            f"{user_id}/{signed_file_name}"
        )

        return {
            "success": True,
            "signed_url": signed_url,
            "message": "Document signed successfully!"
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))