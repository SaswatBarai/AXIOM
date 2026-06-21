import os

from fastapi import APIRouter, HTTPException, Header

from models.schemas import SkillGapRequest
from services.skill_gap import analyze_skill_gap, list_roles
from utils.logger import logger

router = APIRouter()

AI_SECRET = os.getenv("AI_SERVICE_SECRET", "internal-secret")


def _check_secret(secret: str) -> None:
    if secret != AI_SECRET:
        raise HTTPException(status_code=401, detail="Unauthorized internal call")


@router.get("/target-roles")
def get_target_roles(x_internal_secret: str = Header(...)):
    _check_secret(x_internal_secret)
    return {"roles": list_roles()}


@router.post("/gap")
def compute_skill_gap(
    request: SkillGapRequest,
    x_internal_secret: str = Header(...),
):
    _check_secret(x_internal_secret)
    try:
        result = analyze_skill_gap(request.parsed_data, request.role_id)
        return {"success": True, "data": result}
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error(f"Skill gap analysis failed: {e}")
        raise HTTPException(status_code=500, detail="Skill gap analysis failed")
