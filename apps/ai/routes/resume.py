from fastapi import APIRouter

router = APIRouter()


@router.get("/")
def resume_root():
    return {"route": "resume", "status": "scaffold"}
