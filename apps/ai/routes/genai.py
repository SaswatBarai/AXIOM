"""Phase 13 — Cover Letter Generator routes."""
from __future__ import annotations

import os
from typing import Any, Literal

from fastapi import APIRouter, Header, HTTPException
from fastapi.responses import Response
from pydantic import BaseModel, Field

from services.cover_letter import generate_cover_letter, export_pdf, export_docx
from utils.logger import logger

router = APIRouter()

_SECRET = os.getenv("AI_SERVICE_SECRET", "internal-secret")


def _verify(secret: str) -> None:
    if secret != _SECRET:
        raise HTTPException(status_code=401, detail="Unauthorized")


# ── Schemas ───────────────────────────────────────────────────────────────────

class GenerateRequest(BaseModel):
    parsed_resume:   dict[str, Any]
    job_description: str = Field(..., min_length=10)
    company_name:    str = Field(..., min_length=1)
    job_title:       str = Field(..., min_length=1)
    tone:            Literal["formal", "friendly", "direct"] = "formal"


class ExportRequest(BaseModel):
    letter_body:    str = Field(..., min_length=10)
    candidate_name: str = Field(default="Candidate")
    job_title:      str = Field(default="")
    company_name:   str = Field(default="")


# ── Endpoints ─────────────────────────────────────────────────────────────────

@router.post("/cover-letter/generate")
def generate(
    request: GenerateRequest,
    x_internal_secret: str = Header(...),
):
    _verify(x_internal_secret)
    try:
        letter = generate_cover_letter(
            parsed_resume=request.parsed_resume,
            job_description=request.job_description,
            company_name=request.company_name,
            job_title=request.job_title,
            tone=request.tone,
        )
        return {"letter": letter, "tone": request.tone}
    except Exception as e:
        logger.error(f"Cover letter generation failed: {e}")
        raise HTTPException(status_code=503, detail="LLM service error — please retry")


@router.post("/cover-letter/export/pdf")
def export_to_pdf(
    request: ExportRequest,
    x_internal_secret: str = Header(...),
):
    _verify(x_internal_secret)
    try:
        pdf_bytes = export_pdf(
            letter_body=request.letter_body,
            candidate_name=request.candidate_name,
            job_title=request.job_title,
            company_name=request.company_name,
        )
        return Response(
            content=pdf_bytes,
            media_type="application/pdf",
            headers={"Content-Disposition": 'attachment; filename="cover_letter.pdf"'},
        )
    except Exception as e:
        logger.error(f"PDF export failed: {e}")
        raise HTTPException(status_code=500, detail="PDF export failed")


@router.post("/cover-letter/export/docx")
def export_to_docx(
    request: ExportRequest,
    x_internal_secret: str = Header(...),
):
    _verify(x_internal_secret)
    try:
        docx_bytes = export_docx(
            letter_body=request.letter_body,
            candidate_name=request.candidate_name,
            job_title=request.job_title,
            company_name=request.company_name,
        )
        return Response(
            content=docx_bytes,
            media_type="application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            headers={"Content-Disposition": 'attachment; filename="cover_letter.docx"'},
        )
    except Exception as e:
        logger.error(f"DOCX export failed: {e}")
        raise HTTPException(status_code=500, detail="DOCX export failed")
