from fastapi import APIRouter

router = APIRouter()


@router.get("/")
def skills_root():
    return {"route": "skills", "status": "scaffold"}
