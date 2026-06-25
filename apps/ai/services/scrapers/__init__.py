"""Job-board scraping framework (Phase 8).

Each adapter implements `JobSourceAdapter` and yields `NormalizedJob` rows
shaped to the Prisma `Job` model. The runner orchestrates fetching,
deduping, skill extraction, and emits a `ScrapeRunSummary`.

See docs/adr/0002-job-scraping.md for design rationale.
"""

from .base import (
    JobSourceAdapter,
    NormalizedJob,
    JobType,
    ExperienceLevel,
    ScrapeRunSummary,
    sanitize_description,
)
from .runner import run_scrape

__all__ = [
    "JobSourceAdapter",
    "NormalizedJob",
    "JobType",
    "ExperienceLevel",
    "ScrapeRunSummary",
    "sanitize_description",
    "run_scrape",
]
