"""Phase 12 — Chat routes: SSE streaming + session management."""
from __future__ import annotations

import json
import os
from datetime import date
from typing import Any

from fastapi import APIRouter, Header, HTTPException
from fastapi.responses import StreamingResponse
from pydantic import BaseModel, Field

from services.chat_service import stream_chat, get_session_title, new_session_id
from utils.logger import logger
from utils.db import get_redis

router = APIRouter()

_SECRET = os.getenv("AI_SERVICE_SECRET")

DAILY_MSG_QUOTA = int(os.getenv("CHAT_DAILY_QUOTA", "200"))


def _verify(secret: str) -> None:
    if secret != _SECRET:
        raise HTTPException(status_code=401, detail="Unauthorized")


# ── Schemas ───────────────────────────────────────────────────────────────────

class ChatRequest(BaseModel):
    session_id: str | None = None
    message: str = Field(..., max_length=4000)
    history: list[dict[str, str]] = Field(default_factory=list, max_length=50)
    resume_parsed: dict[str, Any] | None = None
    saved_jobs: list[dict[str, Any]] = Field(default_factory=list, max_length=20)
    is_new_session: bool = False


class SessionTitleRequest(BaseModel):
    first_message: str = Field(..., max_length=500)


# ── Endpoints ─────────────────────────────────────────────────────────────────

@router.post("/stream")
async def chat_stream(
    request: ChatRequest,
    x_internal_secret: str = Header(...),
):
    """SSE streaming chat endpoint."""
    _verify(x_internal_secret)

    if not request.message.strip():
        raise HTTPException(status_code=422, detail="Message cannot be empty")

    session_id = request.session_id or new_session_id()

    async def event_generator():
        # First event: session_id so client can persist it
        yield f"data: {json.dumps({'type': 'session_id', 'session_id': session_id})}\n\n"
        try:
            async for chunk in stream_chat(
                message=request.message,
                history=request.history,
                resume_parsed=request.resume_parsed,
                saved_jobs=request.saved_jobs,
            ):
                yield f"data: {json.dumps({'type': 'token', 'content': chunk})}\n\n"
            yield f"data: {json.dumps({'type': 'done'})}\n\n"
        except Exception as e:
            logger.error(f"Chat stream error: {e}")
            yield f"data: {json.dumps({'type': 'error', 'message': 'LLM service error — please retry'})}\n\n"

    return StreamingResponse(
        event_generator(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "X-Accel-Buffering": "no",
        },
    )


@router.post("/session-title")
async def session_title(
    request: SessionTitleRequest,
    x_internal_secret: str = Header(...),
):
    """Generate a short title for a new chat session."""
    _verify(x_internal_secret)
    title = await get_session_title(request.first_message)
    return {"title": title}
