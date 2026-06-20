from fastapi import APIRouter

router = APIRouter()


@router.get("/")
def chat_root():
    return {"route": "chat", "status": "scaffold"}
