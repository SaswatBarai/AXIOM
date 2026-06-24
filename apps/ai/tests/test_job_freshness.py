"""Unit tests for shared job freshness rules."""
from __future__ import annotations

from datetime import datetime, timedelta, timezone

import pytest

from services.scrapers.base import ExperienceLevel, JobType, NormalizedJob
from services.scrapers.freshness import is_job_active, title_has_stale_year


def _job(
    *,
    title: str,
    posted_at: datetime | None,
    expires_at: datetime | None = None,
) -> NormalizedJob:
    return NormalizedJob(
        title=title,
        company="Acme",
        location="India",
        description="Build things with Python.",
        source="test",
        source_url="https://example.com/jobs/1",
        job_type=JobType.INTERNSHIP,
        experience_level=ExperienceLevel.ENTRY,
        posted_at=posted_at,
        expires_at=expires_at,
    )


NOW = datetime(2026, 6, 24, tzinfo=timezone.utc)


def test_stale_title_rejected() -> None:
    job = _job(
        title="Developer Internship 2023",
        posted_at=NOW - timedelta(days=120),
    )
    assert is_job_active(job, now=NOW) is False


def test_stale_title_allowed_when_recently_posted() -> None:
    job = _job(
        title="Developer Internship 2023",
        posted_at=NOW - timedelta(days=7),
    )
    assert is_job_active(job, now=NOW) is True


def test_expired_job_rejected() -> None:
    job = _job(
        title="Backend Engineer Intern",
        posted_at=NOW - timedelta(days=10),
        expires_at=NOW - timedelta(days=1),
    )
    assert is_job_active(job, now=NOW) is False


def test_recent_job_accepted() -> None:
    job = _job(
        title="Backend Engineer Intern",
        posted_at=NOW,
        expires_at=NOW + timedelta(days=30),
    )
    assert is_job_active(job, now=NOW) is True


def test_unknown_posted_at_rejected() -> None:
    job = _job(title="Backend Engineer Intern", posted_at=None)
    assert is_job_active(job, now=NOW) is False


def test_title_has_stale_year_helper() -> None:
    cutoff = NOW - timedelta(days=90)
    assert title_has_stale_year("Program 2023", NOW - timedelta(days=120), now=NOW, cutoff=cutoff)
    assert not title_has_stale_year("Program 2023", NOW - timedelta(days=5), now=NOW, cutoff=cutoff)
