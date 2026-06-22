"""Phase 14 — Interview Question Generator route."""
from __future__ import annotations

import os

from fastapi import APIRouter, Header, HTTPException, status
from pydantic import BaseModel, Field

from services.interview_service import ALL_CATEGORIES, CATEGORY_TOPICS, generate_questions

router = APIRouter()

_SECRET = os.getenv("AI_SERVICE_SECRET", "internal-secret")


def _verify(secret: str | None) -> None:
    if secret != _SECRET:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Unauthorized")


# ── Request / Response models ─────────────────────────────────────────────────

class GenerateRequest(BaseModel):
    job_title:       str              = Field(..., min_length=1, max_length=200)
    job_description: str              = Field(default="", max_length=8000)
    difficulty:      str              = Field(default="medium", pattern="^(easy|medium|hard)$")
    sections:        list[str] | None = None
    count:           int              = Field(default=10, ge=1, le=30)


class Question(BaseModel):
    category:             str
    question:             str
    expected_answer_hint: str
    difficulty:           str


class GenerateResponse(BaseModel):
    questions: list[Question]
    count:     int
    sections:  list[str]


# ── Endpoints ─────────────────────────────────────────────────────────────────

@router.get("/categories")
def list_categories(x_internal_secret: str | None = Header(default=None)):
    _verify(x_internal_secret)
    return {
        "categories": [
            {"id": cat, "topics": CATEGORY_TOPICS[cat]}
            for cat in ALL_CATEGORIES
        ]
    }


@router.post("/generate", response_model=GenerateResponse)
def generate(
    body: GenerateRequest,
    x_internal_secret: str | None = Header(default=None),
):
    _verify(x_internal_secret)

    if body.sections:
        invalid = [s for s in body.sections if s not in ALL_CATEGORIES]
        if invalid:
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail=f"Unknown categories: {invalid}. Valid: {ALL_CATEGORIES}",
            )

    try:
        questions = generate_questions(
            job_title=body.job_title,
            job_description=body.job_description,
            difficulty=body.difficulty,   # type: ignore[arg-type]
            sections=body.sections,
            count=body.count,
        )
    except RuntimeError as exc:
        raise HTTPException(status_code=status.HTTP_502_BAD_GATEWAY, detail=str(exc))

    used_sections = sorted({q["category"] for q in questions})
    return GenerateResponse(
        questions=[Question(**q) for q in questions],
        count=len(questions),
        sections=used_sections,
    )
