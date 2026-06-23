import os

from jose import jwt, JWTError
from fastapi import HTTPException, Security
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials

security = HTTPBearer()

_JWT_SECRET = os.getenv("JWT_SECRET_KEY")
if not _JWT_SECRET:
    raise RuntimeError("CRITICAL: JWT_SECRET_KEY environment variable is not set")


def get_current_user(credentials: HTTPAuthorizationCredentials = Security(security)) -> dict:
    try:
        payload = jwt.decode(
            credentials.credentials,
            _JWT_SECRET,
            algorithms=["HS256"],
            options={"verify_exp": True, "require_exp": True},
        )
        return {"userId": payload["userId"], "role": payload.get("role", "USER")}
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid or expired token")
