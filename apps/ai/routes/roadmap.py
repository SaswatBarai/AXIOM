from fastapi import APIRouter

router = APIRouter()


@router.get("/")
def roadmap_root():
    return {"route": "roadmap", "status": "scaffold"}
