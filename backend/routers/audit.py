from fastapi import APIRouter, Depends, HTTPException, Request
from pydantic import BaseModel
from typing import Optional
from middleware.auth_middleware import get_current_user
from supabase import create_client
import os
from dotenv import load_dotenv

load_dotenv()

router = APIRouter()

supabase_client = create_client(
    os.getenv("SUPABASE_URL"),
    os.getenv("SUPABASE_SERVICE_KEY")
)

class AuditLogCreate(BaseModel):
    document_name: str
    action: str

@router.post("/log")
async def create_audit_log(
    request: Request,
    body: AuditLogCreate,
    current_user: dict = Depends(get_current_user)
):
    try:
        ip = request.client.host
        data = {
            "user_id": current_user["id"],
            "user_email": current_user["email"],
            "document_name": body.document_name,
            "action": body.action,
            "ip_address": ip,
        }
        result = supabase_client.table("audit_logs").insert(data).execute()
        return {"success": True, "log": result.data}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/{doc_name}")
async def get_audit_logs(
    doc_name: str,
    current_user: dict = Depends(get_current_user)
):
    try:
        result = supabase_client.table("audit_logs")\
            .select("*")\
            .eq("document_name", doc_name)\
            .eq("user_id", current_user["id"])\
            .order("created_at", desc=True)\
            .execute()
        return {"success": True, "logs": result.data}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/all/me")
async def get_all_my_logs(
    current_user: dict = Depends(get_current_user)
):
    try:
        result = supabase_client.table("audit_logs")\
            .select("*")\
            .eq("user_id", current_user["id"])\
            .order("created_at", desc=True)\
            .execute()
        return {"success": True, "logs": result.data}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))