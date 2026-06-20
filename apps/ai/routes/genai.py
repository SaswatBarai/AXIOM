from fastapi import APIRouter

router = APIRouter()


@router.get("/")
def genai_root():
    return {"route": "genai", "status": "scaffold"}
