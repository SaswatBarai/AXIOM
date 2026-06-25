"""Pure-parser tests for the Unstop adapter."""
from __future__ import annotations

import json
from pathlib import Path

import pytest

from services.scrapers.base import ExperienceLevel, JobType
from services.scrapers.unstop import _extract_results, parse_listing_entry

PAYLOAD = json.loads((Path(__file__).parent / "fixtures" / "unstop_search.json").read_text())


@pytest.fixture
def results() -> list[dict]:
    return _extract_results(PAYLOAD)


def test_extract_results_handles_nested_data(results) -> None:
    assert len(results) == 3


def test_parse_internship_entry(results) -> None:
    job = parse_listing_entry(results[0])
    assert job is not None
    assert job.title == "Backend Developer Intern"
    assert job.company == "Codeforge Labs"
    assert job.job_type == JobType.INTERNSHIP
    assert job.experience_level == ExperienceLevel.ENTRY
    assert job.location == "Bengaluru"
    assert job.remote is False
    assert job.salary_min == 15_000
    assert job.salary_max == 25_000
    assert job.currency == "INR"
    assert job.source == "unstop"
    assert "python" in job.required_skills
    assert "fastapi" in job.required_skills
    assert "kafka" in job.nice_to_have_skills
    assert "redis" in job.nice_to_have_skills


def test_parse_senior_remote_job(results) -> None:
    job = parse_listing_entry(results[1])
    assert job is not None
    assert job.title == "Senior Full-stack Engineer"
    assert job.company == "Nimbus AI"
    assert job.job_type == JobType.FULL_TIME
    assert job.experience_level == ExperienceLevel.SENIOR
    assert job.remote is True
    assert "typescript" in job.required_skills
    assert "react" in job.required_skills
    assert "next.js" in job.required_skills
    # "Bonus: Kubernetes, AWS" → nice
    assert "kubernetes" in job.nice_to_have_skills
    assert "aws" in job.nice_to_have_skills


def test_skips_invalid_entries(results) -> None:
    # Third entry has empty title — must be skipped
    assert parse_listing_entry(results[2]) is None


def test_description_is_sanitized(results) -> None:
    job = parse_listing_entry(results[0])
    assert "<p>" not in job.description
    assert "Backend developer intern".lower() in job.description.lower()


def test_dates_parsed(results) -> None:
    job = parse_listing_entry(results[0])
    assert job.posted_at.year == 2026
    assert job.expires_at is not None
    assert job.expires_at.month == 7


def test_logo_url_extracted(results) -> None:
    job = parse_listing_entry(results[0])
    assert job.company_logo_url is not None
    assert "codeforge" in str(job.company_logo_url)
