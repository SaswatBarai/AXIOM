from fastapi import APIRouter

router = APIRouter()


@router.get("/")
def interview_root():
    return {"route": "interview", "status": "scaffold"}
