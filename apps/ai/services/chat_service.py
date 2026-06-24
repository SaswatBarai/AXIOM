"""Phase 12 — AI Career Chatbot: RAG pipeline + DeepSeek V4 Flash streaming."""
from __future__ import annotations

import re
import uuid
from typing import AsyncGenerator

from services.llm import ask_llm, stream_llm
from utils.sanitize import sanitize_input

# ── PII patterns ──────────────────────────────────────────────────────────────

_PII_PATTERNS = [
    (re.compile(r"[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+"), "[EMAIL]"),
    (re.compile(r"\+?[\d\s\-().]{7,15}"), "[PHONE]"),
    (re.compile(r"\b\d{3}-\d{2}-\d{4}\b"), "[SSN]"),
]

def strip_pii(text: str) -> str:
    for pattern, replacement in _PII_PATTERNS:
        text = pattern.sub(replacement, text)
    return text


# ── Context builder ───────────────────────────────────────────────────────────

def _build_resume_context(parsed: dict) -> str:
    if not parsed:
        return ""
    parts: list[str] = []
    if name := parsed.get("personal_info", {}).get("name"):
        parts.append(f"Candidate: {name}")
    skills = [s.get("name", s) if isinstance(s, dict) else s for s in parsed.get("skills", [])]
    if skills:
        parts.append(f"Skills: {', '.join(skills[:30])}")
    exp = parsed.get("experience", [])
    for e in exp[:3]:
        parts.append(f"Experience: {e.get('title','')} at {e.get('company','')} ({e.get('duration','')})")
    edu = parsed.get("education", [])
    for ed in edu[:2]:
        parts.append(f"Education: {ed.get('degree','')} from {ed.get('institution','')}")
    return strip_pii("\n".join(parts))


def _build_jobs_context(saved_jobs: list[dict]) -> str:
    if not saved_jobs:
        return ""
    lines = []
    for j in saved_jobs[:5]:
        lines.append(f"- {j.get('title','')} at {j.get('company','')} [{j.get('location','')}]")
    return "Saved jobs:\n" + "\n".join(lines)


def _build_history_text(history: list[dict]) -> str:
    """Convert [{role, content}] → plain text for context."""
    lines = []
    for m in history[-10:]:  # last 10 turns
        role = "User" if m["role"] == "user" else "Assistant"
        lines.append(f"{role}: {m['content']}")
    return "\n".join(lines)


# ── System prompt ─────────────────────────────────────────────────────────────

_SYSTEM_PROMPT = """You are AXIOM Copilot, an expert AI career assistant embedded in AXIOM — a job search and career development platform.

Your job is to help users with:
- Resume analysis and improvement
- Job search strategy and role matching
- Interview preparation (behavioral and technical)
- Career growth roadmaps and skill gap advice
- Cover letter drafting

Rules:
1. Answer ONLY career-related questions. Politely decline anything off-topic.
2. Always base advice on the user's resume and saved jobs when provided — cite which section you're drawing from.
3. Be concise, specific, and actionable. Avoid generic platitudes.
4. If you lack context to give good advice, ask a targeted clarifying question.
5. Never reveal email addresses, phone numbers, or other PII in your output."""


# ── Main chat function ────────────────────────────────────────────────────────

async def stream_chat(
    message: str,
    history: list[dict],
    resume_parsed: dict | None = None,
    saved_jobs: list[dict] | None = None,
) -> AsyncGenerator[str, None]:
    """Yields text chunks as they arrive from DeepSeek."""
    safe_msg = sanitize_input(message)

    context_parts: list[str] = []
    if resume_parsed:
        ctx = _build_resume_context(resume_parsed)
        if ctx:
            context_parts.append(f"[Resume context]\n{ctx}")
    if saved_jobs:
        ctx = _build_jobs_context(saved_jobs)
        if ctx:
            context_parts.append(ctx)
    if history:
        context_parts.append(f"[Conversation so far]\n{_build_history_text(history)}")

    context_block = "\n\n".join(context_parts)
    user_content = (
        f"{context_block}\n\nUser: {safe_msg}\nAssistant:"
        if context_block
        else f"User: {safe_msg}\nAssistant:"
    )

    async for chunk in stream_llm(user_content, system=_SYSTEM_PROMPT):
        if chunk:
            yield chunk


async def get_session_title(first_message: str) -> str:
    """Generate a short session title from the first user message."""
    safe_msg = sanitize_input(first_message, 500)
    prompt = (
        "Summarize the following career question in 4-6 words as a chat session title. "
        "Return only the title, no punctuation.\n\nQuestion: " + safe_msg
    )
    try:
        return ask_llm(prompt, temperature=0.3, max_tokens=80)[:80]
    except Exception:
        return safe_msg[:60]


def new_session_id() -> str:
    return str(uuid.uuid4())
