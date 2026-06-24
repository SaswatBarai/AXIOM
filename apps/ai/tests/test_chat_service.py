"""Tests for services/chat_service.py — Phase 12."""
import pytest
from unittest.mock import AsyncMock, MagicMock, patch
from services.chat_service import (
    strip_pii,
    _build_resume_context,
    _build_jobs_context,
    _build_history_text,
    new_session_id,
)


# ── PII stripping ─────────────────────────────────────────────────────────────

def test_strip_pii_removes_email():
    result = strip_pii("Contact me at john.doe@example.com for more info.")
    assert "john.doe@example.com" not in result
    assert "[EMAIL]" in result

def test_strip_pii_removes_phone():
    result = strip_pii("Call me at +1 415-555-1234 anytime.")
    assert "555" not in result or "[PHONE]" in result

def test_strip_pii_preserves_normal_text():
    text = "I have 5 years of Python experience."
    assert strip_pii(text) == text

def test_strip_pii_multiple_emails():
    text = "From a@b.com to c@d.org"
    result = strip_pii(text)
    assert "a@b.com" not in result
    assert "c@d.org" not in result


# ── Resume context builder ────────────────────────────────────────────────────

def test_build_resume_context_happy_path():
    parsed = {
        "personal_info": {"name": "Jane Doe", "email": "jane@example.com"},
        "skills": [{"name": "Python"}, {"name": "React"}, "TypeScript"],
        "experience": [{"title": "Engineer", "company": "Acme", "duration": "2 years"}],
        "education": [{"degree": "B.Tech CS", "institution": "IIT"}],
    }
    ctx = _build_resume_context(parsed)
    assert "Python" in ctx
    assert "Engineer" in ctx
    assert "B.Tech" in ctx
    # Email should be stripped
    assert "jane@example.com" not in ctx

def test_build_resume_context_empty():
    assert _build_resume_context({}) == ""

def test_build_resume_context_no_skills():
    parsed = {"personal_info": {"name": "Bob"}}
    ctx = _build_resume_context(parsed)
    assert "Bob" in ctx

def test_build_resume_context_caps_experience_at_3():
    parsed = {
        "experience": [
            {"title": f"Role{i}", "company": "Co", "duration": "1yr"} for i in range(10)
        ]
    }
    ctx = _build_resume_context(parsed)
    # Only 3 experience items should appear
    assert ctx.count("Experience:") == 3


# ── Jobs context builder ──────────────────────────────────────────────────────

def test_build_jobs_context_happy_path():
    jobs = [{"title": "SWE", "company": "Google", "location": "Remote"}]
    ctx = _build_jobs_context(jobs)
    assert "SWE" in ctx
    assert "Google" in ctx

def test_build_jobs_context_empty():
    assert _build_jobs_context([]) == ""

def test_build_jobs_context_caps_at_5():
    jobs = [{"title": f"Role{i}", "company": "Co", "location": "NYC"} for i in range(10)]
    ctx = _build_jobs_context(jobs)
    assert ctx.count("- ") == 5


# ── History text builder ──────────────────────────────────────────────────────

def test_build_history_text():
    history = [
        {"role": "user", "content": "Hello"},
        {"role": "assistant", "content": "Hi there"},
    ]
    text = _build_history_text(history)
    assert "User: Hello" in text
    assert "Assistant: Hi there" in text

def test_build_history_text_caps_at_10():
    history = [{"role": "user", "content": f"msg{i}"} for i in range(20)]
    text = _build_history_text(history)
    assert text.count("User:") == 10

def test_build_history_text_empty():
    assert _build_history_text([]) == ""


# ── Session ID ────────────────────────────────────────────────────────────────

def test_new_session_id_is_uuid():
    import uuid
    sid = new_session_id()
    # Should not raise
    uuid.UUID(sid)

def test_new_session_id_unique():
    assert new_session_id() != new_session_id()


# ── stream_chat (mocked LLM) ─────────────────────────────────────────────────

async def _mock_stream(prompt, **kwargs):
    for token in ["Hello", " world"]:
        yield token

@pytest.mark.asyncio
async def test_stream_chat_yields_tokens():
    with patch("services.chat_service.stream_llm", side_effect=_mock_stream):
        from services.chat_service import stream_chat
        tokens = []
        async for t in stream_chat("Tell me about Python", []):
            tokens.append(t)
        assert tokens == ["Hello", " world"]

@pytest.mark.asyncio
async def test_stream_chat_with_resume_context():
    captured = {}

    async def capture_stream(prompt, **kwargs):
        captured["prompt"] = prompt
        yield "Great skills!"

    with patch("services.chat_service.stream_llm", side_effect=capture_stream):
        from services.chat_service import stream_chat
        parsed = {"skills": [{"name": "Python"}], "experience": []}
        tokens = []
        async for t in stream_chat("How's my resume?", [], resume_parsed=parsed):
            tokens.append(t)

        assert "Resume context" in captured["prompt"] or "Python" in captured["prompt"]

@pytest.mark.asyncio
async def test_stream_chat_skips_empty_chunks():
    async def sparse_stream(prompt, **kwargs):
        yield ""
        yield "content"

    with patch("services.chat_service.stream_llm", side_effect=sparse_stream):
        from services.chat_service import stream_chat
        tokens = [t async for t in stream_chat("Hi", [])]
        assert tokens == ["content"]
