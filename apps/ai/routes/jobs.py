"""Phase 8 — job scraping orchestration endpoint.

Called by the Express API on a schedule (Bull queue). The AI service stays
stateless w.r.t. Postgres — it returns NormalizedJob rows + a summary, and
the API persists them via Prisma. This keeps the AI service horizontally
scalable and avoids cross-service DB coupling.
"""
from __future__ import annotations

import os
from typing import Literal

from fastapi import APIRouter, Header, HTTPException
from pydantic import BaseModel, Field

from services.scrapers import run_scrape
from services.scrapers.base import NormalizedJob, ScrapeRunSummary
from services.scrapers.http import ScraperHttpClient
from services.scrapers.internshala import InternshalaAdapter
from services.scrapers.naukri import NaukriAdapter
from services.scrapers.unstop import UnstopAdapter
from utils.logger import logger

router = APIRouter()

AI_SECRET = os.getenv("AI_SERVICE_SECRET", "internal-secret")

SourceName = Literal["internshala", "unstop", "naukri"]


class ScrapeRunRequest(BaseModel):
    source: SourceName
    query: str = ""
    max_pages: int = Field(default=2, ge=1, le=10)
    max_jobs: int = Field(default=100, ge=1, le=500)


class ScrapeRunResponse(BaseModel):
    summary: ScrapeRunSummary
    jobs: list[NormalizedJob]


def _check_secret(secret: str) -> None:
    if secret != AI_SECRET:
        raise HTTPException(status_code=401, detail="Unauthorized internal call")


@router.get("/")
def jobs_root() -> dict:
    return {"route": "jobs", "status": "ready", "sources": ["internshala", "unstop", "naukri"]}


@router.post("/scrape", response_model=ScrapeRunResponse)
async def scrape_run(
    request: ScrapeRunRequest,
    x_internal_secret: str = Header(...),
) -> ScrapeRunResponse:
    """Trigger a scrape against `request.source` with provided `query`.

    Returns the collected `NormalizedJob` rows + a summary. Persistence is
    the caller's responsibility (the Express API service).
    """
    _check_secret(x_internal_secret)

    async with ScraperHttpClient() as http:
        if request.source == "internshala":
            adapter = InternshalaAdapter(http)
        elif request.source == "unstop":
            adapter = UnstopAdapter(http)
        elif request.source == "naukri":
            adapter = NaukriAdapter(http)
        else:  # pragma: no cover — exhaustive in literal
            raise HTTPException(status_code=400, detail=f"Unknown source: {request.source}")

        try:
            jobs, summary = await run_scrape(
                adapter,
                query=request.query,
                max_pages=request.max_pages,
                max_jobs=request.max_jobs,
            )
        except Exception as e:  # noqa: BLE001
            logger.error(f"scrape failed for {request.source}: {e}")
            raise HTTPException(status_code=500, detail=f"Scrape failed: {type(e).__name__}")

    return ScrapeRunResponse(summary=summary, jobs=jobs)
