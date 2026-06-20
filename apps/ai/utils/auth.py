import os
from jose import jwt, JWTError
from fastapi import HTTPException, Security
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials

security = HTTPBearer()
SECRET = os.getenv("JWT_SECRET_KEY", "")


def get_current_user(credentials: HTTPAuthorizationCredentials = Security(security)) -> dict:
    try:
        payload = jwt.decode(credentials.credentials, SECRET, algorithms=["HS256"])
        return {"userId": payload["userId"], "role": payload.get("role", "USER")}
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid or expired token")
