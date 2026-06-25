"""Pure-parser tests for the Internshala adapter.

These hit no network; they validate that `parse_detail` correctly extracts a
NormalizedJob from a frozen HTML/JSON-LD fixture. The fixture is intentionally
realistic — copied (and sanitized) from a real Internshala detail page shape.
"""
from __future__ import annotations

from pathlib import Path

import pytest

from services.scrapers.base import ExperienceLevel, JobType
from services.scrapers.internshala import parse_detail

FIXTURE = (Path(__file__).parent / "fixtures" / "internshala_detail.html").read_text()
URL = "https://internshala.com/internship/detail/backend-engineering-intern-acme-tech-1234567"


@pytest.fixture
def parsed():
    return parse_detail(FIXTURE, url=URL)


def test_returns_normalized_job(parsed) -> None:
    assert parsed is not None
    assert parsed.title == "Backend Engineering Intern"
    assert parsed.company == "Acme Tech"


def test_employment_type_maps_internship(parsed) -> None:
    assert parsed.job_type == JobType.INTERNSHIP
    assert parsed.experience_level == ExperienceLevel.ENTRY


def test_location_parsed_from_jsonld(parsed) -> None:
    assert "Bengaluru" in parsed.location
    assert "India" in parsed.location


def test_remote_flag_from_telecommute(parsed) -> None:
    assert parsed.remote is True


def test_description_sanitized_to_text(parsed) -> None:
    assert "Backend Engineering Intern" in parsed.description
    # HTML tags from the JSON-LD <p>/<b> should be stripped (no <script> ever)
    assert "<script" not in parsed.description.lower()
    assert "<p>" not in parsed.description
    assert "<b>" not in parsed.description


def test_required_skills_extracted_from_description(parsed) -> None:
    # Internshala fixture lists Python / FastAPI / PostgreSQL / Docker / Git
    assert "python" in parsed.required_skills
    assert "fastapi" in parsed.required_skills
    assert "postgresql" in parsed.required_skills
    assert "docker" in parsed.required_skills
    assert "git" in parsed.required_skills


def test_nice_to_have_skills_separated(parsed) -> None:
    # "Nice to have: Kafka, Redis, Kubernetes" should split
    assert "kafka" in parsed.nice_to_have_skills
    assert "redis" in parsed.nice_to_have_skills
    assert "kubernetes" in parsed.nice_to_have_skills
    # Should not double-count
    assert "kafka" not in parsed.required_skills


def test_dates_parsed(parsed) -> None:
    assert parsed.posted_at.year == 2026
    assert parsed.posted_at.month == 6
    assert parsed.expires_at is not None
    assert parsed.expires_at.year == 2026


def test_stipend_extracted_from_html_fallback(parsed) -> None:
    # ₹ 20,000 in the .stipend block
    assert parsed.salary_min == 20_000
    assert parsed.salary_max == 20_000
    assert parsed.currency == "INR"


def test_source_set_correctly(parsed) -> None:
    assert parsed.source == "internshala"
    assert str(parsed.source_url) == URL


def test_returns_none_for_empty_html() -> None:
    assert parse_detail("<html><body></body></html>", url=URL) is None
