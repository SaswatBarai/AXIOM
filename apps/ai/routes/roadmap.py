"""Phase 15 — Career Roadmap Generator route."""
from __future__ import annotations

import os

from fastapi import APIRouter, Header, HTTPException, status
from pydantic import BaseModel, Field

from services.roadmap_service import (
    compute_progress_stats,
    generate_roadmap,
)

router = APIRouter()

_SECRET = os.getenv("AI_SERVICE_SECRET")


def _verify(secret: str | None) -> None:
    if secret != _SECRET:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Unauthorized")


# ── Request / Response models ─────────────────────────────────────────────────

class GapReport(BaseModel):
    missing: dict = Field(default_factory=dict)
    matched: dict = Field(default_factory=dict)


class GenerateRequest(BaseModel):
    target_role: str       = Field(..., min_length=1, max_length=200)
    gap_report:  GapReport = Field(default_factory=GapReport)
    weeks:       int       = Field(default=12, ge=4, le=52)


class RoadmapStep(BaseModel):
    week:            int
    skill:           str
    tier:            str
    resources:       list[str]
    estimated_hours: int


class GenerateResponse(BaseModel):
    steps: list[RoadmapStep]
    count: int


class ProgressRequest(BaseModel):
    steps:    list[dict] = Field(..., max_length=100)
    progress: dict


# ── Endpoints ─────────────────────────────────────────────────────────────────

@router.post("/generate", response_model=GenerateResponse)
def generate(
    body: GenerateRequest,
    x_internal_secret: str | None = Header(default=None),
):
    _verify(x_internal_secret)
    try:
        steps = generate_roadmap(
            target_role=body.target_role,
            gap_report=body.gap_report.model_dump(),
            weeks=body.weeks,
        )
    except RuntimeError as exc:
        raise HTTPException(status_code=status.HTTP_502_BAD_GATEWAY, detail=str(exc))
    return {"steps": steps, "count": len(steps)}


@router.post("/progress-stats")
def progress_stats(
    body: ProgressRequest,
    x_internal_secret: str | None = Header(default=None),
):
    _verify(x_internal_secret)
    return compute_progress_stats(body.steps, body.progress)
