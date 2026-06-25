"""Unit tests for the ATS scoring engine.

These tests exercise the public `analyze_resume` function across the
representative shapes of parsed resumes and job descriptions.
"""
from __future__ import annotations

import pytest

from services.ats import analyze_resume


# ── Fixtures ──────────────────────────────────────────────────────────────────


@pytest.fixture
def strong_resume() -> dict:
    """A complete senior backend resume — should score highly."""
    return {
        "skills": [
            {"name": "python"}, {"name": "fastapi"}, {"name": "postgresql"},
            {"name": "redis"}, {"name": "docker"}, {"name": "kubernetes"},
            {"name": "aws"}, {"name": "kafka"},
        ],
        "experience": [
            {
                "title": "Senior Backend Engineer",
                "company": "Stripe",
                "description": "Built payment APIs in Python and FastAPI serving 50M requests/day. "
                               "Designed PostgreSQL schemas and Redis caching layer.",
                "skills": [],
            },
            {
                "title": "Backend Engineer",
                "company": "Acme",
                "description": "REST APIs in Django; deployed on Docker and Kubernetes.",
                "skills": [],
            },
        ],
        "education": [{"degree": "BS", "field": "Computer Science", "institution": "UC Berkeley"}],
        "projects": [{"name": "open-source kafka client", "description": "Async kafka library", "skills": []}],
        "certifications": ["AWS Solutions Architect"],
        "summary": "Senior backend engineer with 6 years of experience building production-grade APIs at scale.",
        "email": "sarah@example.com",
        "phone": "+1-415-555-0142",
    }


@pytest.fixture
def empty_resume() -> dict:
    return {
        "skills": [],
        "experience": [],
        "education": [],
        "projects": [],
        "certifications": [],
        "summary": None,
        "email": None,
        "phone": None,
    }


# ── analyze_resume — happy path ───────────────────────────────────────────────


def test_returns_all_required_fields(strong_resume: dict) -> None:
    result = analyze_resume(strong_resume, "Python FastAPI backend engineer")
    for field in (
        "overall", "keywordMatch", "completeness", "readability",
        "formatting", "strengths", "missingSkills", "suggestions",
    ):
        assert field in result, f"missing field: {field}"


def test_overall_is_weighted_average(strong_resume: dict) -> None:
    jd = "Python FastAPI PostgreSQL Redis Docker Kubernetes AWS Kafka"
    result = analyze_resume(strong_resume, jd)

    expected = round(
        result["keywordMatch"] * 0.50
        + result["completeness"] * 0.25
        + result["readability"] * 0.15
        + result["formatting"] * 0.10
    )
    assert result["overall"] == expected


def test_strong_resume_scores_high_against_matching_jd(strong_resume: dict) -> None:
    jd = "Python FastAPI PostgreSQL Redis Docker Kubernetes AWS Kafka engineer backend"
    result = analyze_resume(strong_resume, jd)

    assert result["overall"] >= 80
    assert result["keywordMatch"] >= 80
    assert len(result["strengths"]) >= 2


def test_scores_are_bounded_0_to_100(strong_resume: dict) -> None:
    result = analyze_resume(strong_resume, "Senior backend engineer")
    for k in ("overall", "keywordMatch", "completeness", "readability", "formatting"):
        assert 0 <= result[k] <= 100, f"{k}={result[k]} out of 0..100"


# ── analyze_resume — edge cases ───────────────────────────────────────────────


def test_empty_resume_does_not_crash(empty_resume: dict) -> None:
    result = analyze_resume(empty_resume, "Looking for Python developer")
    assert isinstance(result["overall"], int)
    assert result["completeness"] < 100  # heavily penalised


def test_empty_jd_falls_back_to_neutral_keyword_score(strong_resume: dict) -> None:
    result = analyze_resume(strong_resume, "")
    # No JD keywords → neutral 75 fallback per _score_keyword_match
    assert result["keywordMatch"] == 75
    assert result["missingSkills"] == []


def test_zero_matches_produces_low_keyword_score(empty_resume: dict) -> None:
    jd = "Java Spring Hibernate Cassandra Scala"
    result = analyze_resume(empty_resume, jd)
    assert result["keywordMatch"] == 0
    # Missing keywords are listed for actionability
    assert len(result["missingSkills"]) > 0


def test_missing_skills_excludes_short_tokens(strong_resume: dict) -> None:
    # The trailing single-char "x" should never appear in missingSkills
    jd = "We need a Python developer and x"
    result = analyze_resume(strong_resume, jd)
    for m in result["missingSkills"]:
        assert len(m) >= 3, f"short token leaked: {m!r}"


def test_missing_skills_capped_at_10(empty_resume: dict) -> None:
    # 20 distinct multi-char keywords
    jd = " ".join(f"keyword{i:02d}" for i in range(20))
    result = analyze_resume(empty_resume, jd)
    assert len(result["missingSkills"]) <= 10


def test_completeness_penalises_missing_sections(empty_resume: dict) -> None:
    full = analyze_resume(
        {**empty_resume, "skills": [{"name": "python"}], "experience": [{"title": "x", "company": "y", "description": "z", "skills": []}], "education": [{"degree": "BS"}], "email": "a@b.c", "phone": "1", "summary": "s"},
        "python",
    )
    bare = analyze_resume(empty_resume, "python")
    assert full["completeness"] > bare["completeness"]


def test_suggestions_recommend_missing_summary() -> None:
    resume = {
        "skills": [{"name": "python"}], "experience": [], "education": [],
        "projects": [], "certifications": [], "summary": None,
        "email": "a@b.c", "phone": "1",
    }
    result = analyze_resume(resume, "Python engineer")
    assert any("summary" in s.lower() for s in result["suggestions"])


def test_strengths_mention_keyword_alignment_when_matched(strong_resume: dict) -> None:
    jd = "Python FastAPI PostgreSQL Redis Docker Kubernetes AWS"
    result = analyze_resume(strong_resume, jd)
    assert any("keyword" in s.lower() for s in result["strengths"])
