import os
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
import base64
import json
from dotenv import load_dotenv

load_dotenv()

security = HTTPBearer()

def decode_jwt_payload(token: str):
    try:
        payload_part = token.split(".")[1]
        # Add padding
        padding = 4 - len(payload_part) % 4
        if padding != 4:
            payload_part += "=" * padding
        decoded = base64.b64decode(payload_part)
        return json.loads(decoded)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Token decode failed: {str(e)}"
        )

def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    token = credentials.credentials
    payload = decode_jwt_payload(token)
    
    user_id = payload.get("sub")
    email = payload.get("email")
    
    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token - no user ID found"
        )
    
    return {"id": user_id, "email": email}