"""Tests for services/cover_letter.py — Phase 13."""
import pytest
from unittest.mock import MagicMock, patch
from services.cover_letter import (
    build_prompt,
    _build_resume_snippet,
    export_pdf,
    export_docx,
)

# ── Fixtures ──────────────────────────────────────────────────────────────────

PARSED_RESUME = {
    "skills": [{"name": "Python"}, {"name": "FastAPI"}, "PostgreSQL"],
    "experience": [
        {
            "title": "Senior Engineer",
            "company": "Acme Corp",
            "duration": "3 years",
            "bullets": ["Reduced latency by 40%", "Led team of 5 engineers"],
        }
    ],
    "education": [{"degree": "B.Tech CS", "institution": "IIT Delhi"}],
}

JOB_DESCRIPTION = "We are looking for a backend engineer with Python, APIs, and databases experience."
COMPANY = "Stripe"
JOB_TITLE = "Senior Backend Engineer"


# ── _build_resume_snippet ─────────────────────────────────────────────────────

def test_resume_snippet_includes_skills():
    snippet = _build_resume_snippet(PARSED_RESUME)
    assert "Python" in snippet
    assert "FastAPI" in snippet

def test_resume_snippet_includes_experience():
    snippet = _build_resume_snippet(PARSED_RESUME)
    assert "Senior Engineer" in snippet
    assert "Acme Corp" in snippet

def test_resume_snippet_includes_education():
    snippet = _build_resume_snippet(PARSED_RESUME)
    assert "B.Tech" in snippet

def test_resume_snippet_caps_skills_at_20():
    parsed = {"skills": [{"name": f"Skill{i}"} for i in range(30)]}
    snippet = _build_resume_snippet(parsed)
    # "Skill20" through "Skill29" must not appear (cap is 20)
    assert "Skill20" not in snippet
    assert "Skill29" not in snippet

def test_resume_snippet_empty():
    assert _build_resume_snippet({}) == ""


# ── build_prompt ──────────────────────────────────────────────────────────────

def test_prompt_contains_company():
    prompt = build_prompt(PARSED_RESUME, JOB_DESCRIPTION, COMPANY, JOB_TITLE, "formal")
    assert "Stripe" in prompt

def test_prompt_contains_job_title():
    prompt = build_prompt(PARSED_RESUME, JOB_DESCRIPTION, COMPANY, JOB_TITLE, "formal")
    assert "Senior Backend Engineer" in prompt

def test_prompt_contains_tone_formal():
    prompt = build_prompt(PARSED_RESUME, JOB_DESCRIPTION, COMPANY, JOB_TITLE, "formal")
    assert "formal" in prompt.lower()

def test_prompt_contains_tone_friendly():
    prompt = build_prompt(PARSED_RESUME, JOB_DESCRIPTION, COMPANY, JOB_TITLE, "friendly")
    assert "friendly" in prompt.lower() or "warm" in prompt.lower()

def test_prompt_contains_tone_direct():
    prompt = build_prompt(PARSED_RESUME, JOB_DESCRIPTION, COMPANY, JOB_TITLE, "direct")
    assert "direct" in prompt.lower() or "punchy" in prompt.lower()

def test_prompt_includes_resume_snippet():
    prompt = build_prompt(PARSED_RESUME, JOB_DESCRIPTION, COMPANY, JOB_TITLE, "formal")
    assert "Python" in prompt

def test_prompt_truncates_long_job_description():
    long_jd = "x" * 3000
    prompt = build_prompt(PARSED_RESUME, long_jd, COMPANY, JOB_TITLE, "formal")
    # JD in prompt should be truncated to 1500 chars
    assert long_jd not in prompt
    assert "x" * 1500 in prompt or "x" * 1499 in prompt


# ── generate_cover_letter (mocked) ───────────────────────────────────────────

def test_generate_calls_llm_and_returns_text():
    with patch("services.cover_letter.ask_llm", return_value="  Dear Hiring Manager, I am excited...  "):
        from services.cover_letter import generate_cover_letter
        result = generate_cover_letter(PARSED_RESUME, JOB_DESCRIPTION, COMPANY, JOB_TITLE, "formal")
        assert result == "Dear Hiring Manager, I am excited..."

def test_generate_uses_temperature_07():
    with patch("services.cover_letter.ask_llm", return_value="letter body") as mock_ask:
        from services.cover_letter import generate_cover_letter
        generate_cover_letter(PARSED_RESUME, JOB_DESCRIPTION, COMPANY, JOB_TITLE, "friendly")
        assert mock_ask.call_args[1]["temperature"] == 0.7


# ── export_pdf ────────────────────────────────────────────────────────────────

def test_export_pdf_returns_bytes():
    pdf = export_pdf("First paragraph.\n\nSecond paragraph.", "Jane Doe", "SWE", "Google")
    assert isinstance(pdf, bytes)
    assert len(pdf) > 0

def test_export_pdf_is_valid_pdf():
    pdf = export_pdf("Hello world paragraph.", "Alice", "Engineer", "Acme")
    assert pdf[:4] == b"%PDF"

def test_export_pdf_handles_unicode():
    pdf = export_pdf("Résumé: café, naïve", "François Müller", "SWE", "ACME")
    assert isinstance(pdf, bytes)


# ── export_docx ───────────────────────────────────────────────────────────────

def test_export_docx_returns_bytes():
    docx = export_docx("First paragraph.\n\nSecond paragraph.", "Jane Doe", "SWE", "Google")
    assert isinstance(docx, bytes)
    assert len(docx) > 0

def test_export_docx_is_valid_zip():
    docx = export_docx("Content here.", "Bob", "PM", "Meta")
    # DOCX files are ZIP archives starting with PK
    assert docx[:2] == b"PK"

def test_export_docx_handles_unicode():
    docx = export_docx("Résumé: café", "François", "SWE", "ACME")
    assert isinstance(docx, bytes)

def test_export_docx_multiple_paragraphs():
    body = "Para one.\n\nPara two.\n\nPara three."
    docx = export_docx(body, "Alice", "Engineer", "Acme")
    assert isinstance(docx, bytes)
