"""Unit tests for the resume parser.

Network/file-IO functions (download_file, extract_text_*) are not exercised
here — they're trivially correct given pdfplumber/python-docx do the work.
We focus on the extraction logic where the bugs live.
"""
from __future__ import annotations

import pytest

from services.parser import (
    extract_skills,
    extract_experience,
    extract_education,
    extract_projects,
    extract_certifications,
    extract_email,
    extract_phone,
    split_sections,
    _parse_education_line,
    _parse_experience_header,
)


# ── extract_skills — word-boundary correctness ────────────────────────────────


def test_skills_word_boundary_prevents_substring_false_positives() -> None:
    """The old bug: 'c' matched 'computer', 'r' matched 'redis', 'go' matched 'going'."""
    text = "Worked on computer science research; rebuilt going strategies."
    result = [s["name"] for s in extract_skills(text)]
    # None of these should fire
    assert "go" not in result
    assert "python" not in result


def test_skills_match_real_listings() -> None:
    text = "Skills: Python, FastAPI, Django, PostgreSQL, Redis, Docker, Kubernetes, AWS, Git"
    result = [s["name"] for s in extract_skills(text)]
    for expected in ("python", "fastapi", "django", "postgresql", "redis", "docker", "kubernetes", "aws", "git"):
        assert expected in result, f"missed: {expected}"


def test_skills_handle_special_chars() -> None:
    text = "Languages: C++, C#, Node.js, Next.js. Tools: CI/CD pipelines."
    result = [s["name"] for s in extract_skills(text)]
    assert "c++" in result
    assert "c#" in result
    assert "node.js" in result
    assert "next.js" in result
    assert "ci/cd" in result


def test_skills_case_insensitive() -> None:
    text = "Python and PYTHON and python"
    result = [s["name"] for s in extract_skills(text)]
    # Should appear once (deduplicated by virtue of one entry per pattern)
    assert result.count("python") == 1


def test_skills_empty_text() -> None:
    assert extract_skills("") == []


# ── extract_experience — header parsing ───────────────────────────────────────


def test_experience_splits_company_and_title_with_em_dash() -> None:
    company, title, start, end, current = _parse_experience_header(
        "Stripe — Senior Backend Engineer (2022 - Present)"
    )
    assert company == "Stripe"
    assert title == "Senior Backend Engineer"
    assert start == "2022"
    assert end == "Present"
    assert current is True


def test_experience_splits_at_keyword() -> None:
    company, title, start, end, current = _parse_experience_header(
        "Backend Engineer at Acme Corp (2019 - 2022)"
    )
    assert company == "Acme Corp"
    assert title == "Backend Engineer"
    assert start == "2019"
    assert end == "2022"
    assert current is False


def test_experience_splits_with_comma() -> None:
    company, title, _, _, _ = _parse_experience_header(
        "Senior Engineer, Vercel | 2020 - 2024"
    )
    assert title == "Senior Engineer"
    assert company == "Vercel"


def test_experience_full_section() -> None:
    section = (
        "Stripe — Senior Backend Engineer (2022 - Present)\n"
        "Built payment APIs in Python and FastAPI.\n"
        "Designed Redis caching layer.\n"
        "\n"
        "Acme Corp — Backend Engineer (2019 - 2022)\n"
        "REST APIs in Django and Flask."
    )
    entries = extract_experience(section)
    assert len(entries) == 2
    assert entries[0]["company"] == "Stripe"
    assert entries[0]["title"] == "Senior Backend Engineer"
    assert entries[0]["current"] is True
    assert "FastAPI" in entries[0]["description"]
    assert entries[1]["company"] == "Acme Corp"
    assert entries[1]["current"] is False


# ── extract_education — year + degree parsing ─────────────────────────────────


def test_education_parses_full_line() -> None:
    degree, field, institution = _parse_education_line(
        "BS Computer Science, UC Berkeley (2015 - 2019)"
    )
    assert degree == "BS"
    assert field == "Computer Science"
    assert institution == "UC Berkeley"


def test_education_full_years_not_truncated() -> None:
    """The old bug: YEAR_RE capture group caused findall to return '20' instead of '2015'."""
    entries = extract_education("BS Computer Science, UC Berkeley (2015 - 2019)")
    assert len(entries) == 1
    assert entries[0]["startYear"] == 2015
    assert entries[0]["endYear"] == 2019


def test_education_parses_bachelor_of_science() -> None:
    degree, field, _institution = _parse_education_line(
        "Bachelor of Science in Computer Science, MIT"
    )
    assert degree.lower().startswith("bachelor")
    assert "Computer Science" in field


def test_education_handles_institution_only() -> None:
    entries = extract_education("Stanford University (2018 - 2022)")
    assert len(entries) == 1
    assert entries[0]["startYear"] == 2018
    assert entries[0]["endYear"] == 2022


def test_education_extracts_gpa() -> None:
    entries = extract_education("BS CS, Stanford (2018 - 2022) GPA: 3.85")
    assert entries[0]["gpa"] == 3.85


def test_education_skips_unrelated_lines() -> None:
    section = (
        "BS Computer Science, UC Berkeley (2015 - 2019)\n"
        "Volunteered as a TA for CS 61A.\n"
    )
    entries = extract_education(section)
    # Only one real education line — the volunteer line lacks year/keyword/degree
    assert len(entries) == 1


# ── Contact extractors ────────────────────────────────────────────────────────


def test_extract_email() -> None:
    assert extract_email("Contact: sarah.chen@example.com") == "sarah.chen@example.com"
    assert extract_email("no email here") is None


def test_extract_phone() -> None:
    assert extract_phone("Phone: +1 (415) 555-0142") is not None
    assert extract_phone("no phone here") is None


# ── Projects + certifications ─────────────────────────────────────────────────


def test_extract_projects_returns_list() -> None:
    section = "Built a CLI for resume parsing using Rust and tree-sitter."
    projects = extract_projects(section)
    assert isinstance(projects, list)


def test_extract_projects_caps_at_10() -> None:
    section = "\n".join(f"Project{i}\nhttps://example.com/{i}" for i in range(15))
    projects = extract_projects(section)
    assert len(projects) <= 10


def test_extract_certifications_strips_and_caps() -> None:
    section = "AWS Solutions Architect\n  GCP Professional Cloud Architect  \n\nKubernetes CKA"
    certs = extract_certifications(section)
    assert "AWS Solutions Architect" in certs
    assert "GCP Professional Cloud Architect" in certs
    assert "Kubernetes CKA" in certs
    assert len(certs) <= 10


# ── Section splitting ─────────────────────────────────────────────────────────


def test_split_sections_finds_known_headers() -> None:
    text = (
        "John Doe\n"
        "Summary\n"
        "Senior engineer.\n"
        "Experience\n"
        "Stripe — Engineer (2020 - Present)\n"
        "Education\n"
        "BS CS, Stanford (2016 - 2020)\n"
    )
    sections = split_sections(text)
    assert "summary" in sections
    assert "experience" in sections
    assert "education" in sections
    assert "Senior engineer" in sections["summary"]
    assert "Stripe" in sections["experience"]
