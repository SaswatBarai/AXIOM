"""Base abstractions for job-board adapters.

Each adapter owns one source (Internshala, Unstop, Naukri) and yields
`NormalizedJob` rows. The runner orchestrates rate-limiting, retries,
and dedupe — adapters should focus on parsing, not transport.
"""
from __future__ import annotations

from abc import ABC, abstractmethod
from datetime import datetime
from enum import Enum
from typing import AsyncIterator, Optional

import bleach
from pydantic import BaseModel, Field, HttpUrl


# Match Prisma enums exactly.
class JobType(str, Enum):
    FULL_TIME = "FULL_TIME"
    PART_TIME = "PART_TIME"
    CONTRACT = "CONTRACT"
    INTERNSHIP = "INTERNSHIP"
    FREELANCE = "FREELANCE"


class ExperienceLevel(str, Enum):
    ENTRY = "ENTRY"
    MID = "MID"
    SENIOR = "SENIOR"
    LEAD = "LEAD"
    EXECUTIVE = "EXECUTIVE"


class NormalizedJob(BaseModel):
    """Adapter output, shaped to the Prisma `Job` model."""

    title: str
    company: str
    company_logo_url: Optional[HttpUrl] = None
    location: str
    remote: bool = False
    job_type: JobType = JobType.FULL_TIME
    experience_level: ExperienceLevel = ExperienceLevel.ENTRY
    salary_min: Optional[int] = None
    salary_max: Optional[int] = None
    currency: str = "INR"

    description: str = Field(..., min_length=1, max_length=16_384)
    required_skills: list[str] = []
    nice_to_have_skills: list[str] = []

    source: str  # "internshala" | "unstop" | "naukri" | "manual"
    source_url: HttpUrl
    posted_at: Optional[datetime] = None
    expires_at: Optional[datetime] = None


class ScrapeRunSummary(BaseModel):
    source: str
    fetched: int = 0
    inserted: int = 0
    updated: int = 0
    skipped: int = 0
    errors: int = 0
    duration_ms: int = 0


class JobSourceAdapter(ABC):
    """Stateless adapter interface; one instance per scrape run."""

    #: Stable lowercase identifier persisted on `Job.source`
    name: str = ""

    @abstractmethod
    async def fetch(self, *, query: str = "", max_pages: int = 3) -> AsyncIterator[NormalizedJob]:
        """Yield normalized jobs from this source.

        Implementations should call into a `ratelimit.AsyncRateLimiter` and
        a shared `httpx.AsyncClient`; both are passed via `__init__`. Detail
        pages are fetched lazily so the runner can bail early on budget overrun.
        """
        ...
        # The `yield` below is unreachable but tells mypy this is a generator.
        if False:  # pragma: no cover
            yield  # type: ignore[unreachable]


# ── Helpers shared across adapters ───────────────────────────────────────────


def sanitize_description(html: str, max_len: int = 16_384) -> str:
    """Strip all HTML + collapse whitespace + cap length.

    Job descriptions on every source are user-generated and may contain
    <script>, on* handlers, and other XSS payloads. v1 renders as plain text
    in the UI, so we strip everything — adapters that need light formatting
    can drop in their own bleach pass before passing to NormalizedJob.
    """
    cleaned = bleach.clean(
        html or "",
        tags=set(),  # no tags allowed — pure text
        attributes={},
        strip=True,
        strip_comments=True,
    )
    # Collapse runs of whitespace
    cleaned = " ".join(cleaned.split())
    if len(cleaned) > max_len:
        cleaned = cleaned[: max_len - 1] + "…"
    return cleaned
