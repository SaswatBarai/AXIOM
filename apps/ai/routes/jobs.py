from fastapi import APIRouter

router = APIRouter()


@router.get("/")
def jobs_root():
    return {"route": "jobs", "status": "scaffold"}
