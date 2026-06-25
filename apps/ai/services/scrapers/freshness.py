"""Shared job freshness rules — used by scrapers, runner, and matching."""
from __future__ import annotations

import os
import re
from datetime import datetime, timedelta, timezone
from typing import Optional

from .base import NormalizedJob

_STALE_YEAR_RE = re.compile(r"\b20\d{2}\b")


def max_age_days() -> int:
    try:
        return max(1, int(os.getenv("JOB_MAX_AGE_DAYS", "90")))
    except ValueError:
        return 90


def reject_stale_title() -> bool:
    return os.getenv("JOB_STALE_TITLE_REJECT", "true").lower() != "false"


def _aware(dt: datetime) -> datetime:
    if dt.tzinfo is None:
        return dt.replace(tzinfo=timezone.utc)
    return dt


def title_has_stale_year(
    title: str,
    posted_at: Optional[datetime],
    *,
    now: Optional[datetime] = None,
    cutoff: Optional[datetime] = None,
) -> bool:
    """True when title embeds an old campaign year and posted_at does not prove recency."""
    if not reject_stale_title():
        return False
    now = _aware(now or datetime.now(timezone.utc))
    cutoff = cutoff or (now - timedelta(days=max_age_days()))
    min_allowed_year = now.year - 1
    years = [int(m.group(0)) for m in _STALE_YEAR_RE.finditer(title)]
    if not any(y < min_allowed_year for y in years):
        return False
    if posted_at is not None and _aware(posted_at) >= cutoff:
        return False
    return True


def is_job_active(job: NormalizedJob, *, now: Optional[datetime] = None) -> bool:
    """Return True only for listings that are currently open and recently posted."""
    now = _aware(now or datetime.now(timezone.utc))
    cutoff = now - timedelta(days=max_age_days())

    if job.posted_at is None:
        return False
    posted = _aware(job.posted_at)
    if posted < cutoff:
        return False

    if job.expires_at is not None:
        expires = _aware(job.expires_at)
        if expires <= now:
            return False

    if title_has_stale_year(job.title, posted, now=now, cutoff=cutoff):
        return False

    return True


def is_db_job_active(
    *,
    title: str,
    posted_at: datetime,
    expires_at: Optional[datetime],
    now: Optional[datetime] = None,
) -> bool:
    """Freshness check for DB row dicts (matching layer)."""
    now = _aware(now or datetime.now(timezone.utc))
    cutoff = now - timedelta(days=max_age_days())
    posted = _aware(posted_at)
    if posted < cutoff:
        return False
    if expires_at is not None and _aware(expires_at) <= now:
        return False
    if title_has_stale_year(title, posted, now=now, cutoff=cutoff):
        return False
    return True
