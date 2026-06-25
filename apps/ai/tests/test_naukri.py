"""Pure-parser tests for the Naukri adapter."""
from __future__ import annotations

from pathlib import Path

import pytest

from services.scrapers.base import ExperienceLevel, JobType
from services.scrapers.naukri import parse_listing_html

FIXTURE = (Path(__file__).parent / "fixtures" / "naukri_listing.html").read_text()


@pytest.fixture
def jobs():
    return parse_listing_html(FIXTURE)


def test_parses_two_jobs(jobs) -> None:
    assert len(jobs) == 2


def test_senior_role_mapped_correctly(jobs) -> None:
    senior = jobs[0]
    assert senior.title == "Senior Backend Engineer"
    assert senior.company == "Bluefox Systems"
    assert senior.experience_level == ExperienceLevel.SENIOR
    assert senior.job_type == JobType.FULL_TIME
    assert senior.location.startswith("Bengaluru")
    assert senior.remote is False


def test_senior_skills_from_tags(jobs) -> None:
    senior = jobs[0]
    # tagsAndSkills explicit list — should appear in required_skills
    for skill in ("python", "fastapi", "postgresql", "redis", "kafka", "docker"):
        assert skill in senior.required_skills


def test_senior_salary_in_rupees(jobs) -> None:
    senior = jobs[0]
    # "₹ 25-40 LPA" → 2,500,000 — 4,000,000 rupees
    assert senior.salary_min == 2_500_000
    assert senior.salary_max == 4_000_000


def test_junior_remote_role(jobs) -> None:
    junior = jobs[1]
    assert junior.title == "Junior React Developer"
    assert junior.company == "Hexpoint Tech"
    # "1-3 years" with "Junior" title → ENTRY (leading-number heuristic)
    assert junior.experience_level == ExperienceLevel.ENTRY
    assert junior.remote is True
    assert junior.location == "Remote"


def test_junior_skills(jobs) -> None:
    junior = jobs[1]
    # tags: React, TypeScript, Next.js, CSS
    assert "react" in junior.required_skills
    assert "typescript" in junior.required_skills
    assert "next.js" in junior.required_skills


def test_description_sanitized(jobs) -> None:
    for j in jobs:
        assert "<script" not in j.description.lower()
        assert "<p>" not in j.description


def test_dates_parsed(jobs) -> None:
    senior = jobs[0]
    assert senior.posted_at.year == 2026
    assert senior.posted_at.month == 6
    assert senior.expires_at.month == 8


def test_logo_extracted(jobs) -> None:
    assert jobs[0].company_logo_url is not None
    assert "bluefox" in str(jobs[0].company_logo_url)


def test_source_url_is_absolute(jobs) -> None:
    for j in jobs:
        assert str(j.source_url).startswith("https://www.naukri.com")


def test_empty_html_returns_empty_list() -> None:
    assert parse_listing_html("<html><body></body></html>") == []
