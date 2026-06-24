"""Phase 14 — Interview Question Generator: topic taxonomy + DeepSeek JSON generation."""
from __future__ import annotations

import json
import re
import textwrap
from typing import Literal

from services.llm import ask_llm
from utils.sanitize import sanitize_input


# ── Types ─────────────────────────────────────────────────────────────────────

Difficulty = Literal["easy", "medium", "hard"]
Category   = Literal["dsa", "system_design", "sql", "behavioral", "coding", "language_specific"]

# ── Topic taxonomy ────────────────────────────────────────────────────────────

TOPIC_WEIGHTS: dict[str, dict[Category, float]] = {
    "frontend": {
        "dsa": 0.10, "system_design": 0.15, "sql": 0.05,
        "behavioral": 0.25, "coding": 0.30, "language_specific": 0.15,
    },
    "backend": {
        "dsa": 0.20, "system_design": 0.25, "sql": 0.15,
        "behavioral": 0.15, "coding": 0.20, "language_specific": 0.05,
    },
    "fullstack": {
        "dsa": 0.15, "system_design": 0.20, "sql": 0.10,
        "behavioral": 0.20, "coding": 0.25, "language_specific": 0.10,
    },
    "data": {
        "dsa": 0.15, "system_design": 0.10, "sql": 0.30,
        "behavioral": 0.15, "coding": 0.20, "language_specific": 0.10,
    },
    "default": {
        "dsa": 0.20, "system_design": 0.20, "sql": 0.10,
        "behavioral": 0.20, "coding": 0.20, "language_specific": 0.10,
    },
}

CATEGORY_TOPICS: dict[Category, list[str]] = {
    "dsa": [
        "Arrays and strings", "Linked lists", "Stacks and queues",
        "Trees and graphs", "Hash maps", "Sorting and searching",
        "Dynamic programming", "Recursion and backtracking", "Heaps and priority queues",
    ],
    "system_design": [
        "Load balancing", "Database sharding", "Caching strategies",
        "Microservices vs monolith", "Message queues", "API design (REST/GraphQL)",
        "CDN and edge computing", "Distributed consensus", "Rate limiting at scale",
    ],
    "sql": [
        "JOIN types and use cases", "Window functions", "Indexes and query optimization",
        "Transactions and ACID", "Normalization", "Aggregation and GROUP BY",
        "Subqueries vs CTEs", "Stored procedures", "Schema design",
    ],
    "behavioral": [
        "Conflict resolution", "Leadership and ownership", "Handling failure",
        "Cross-functional collaboration", "Prioritization under pressure",
        "Giving and receiving feedback", "Technical mentoring",
    ],
    "coding": [
        "Clean code principles", "Debugging approach", "Code review best practices",
        "Testing strategy (unit/integration/e2e)", "Refactoring legacy code",
        "Design patterns", "Error handling and edge cases",
    ],
    "language_specific": [
        "Memory management", "Concurrency primitives", "Type system nuances",
        "Standard library highlights", "Package/module system",
        "Performance characteristics", "Common gotchas",
    ],
}

ALL_CATEGORIES: list[Category] = list(CATEGORY_TOPICS.keys())


def _detect_role_type(job_title: str) -> str:
    title = job_title.lower()
    if any(k in title for k in ("front", "react", "vue", "angular", "ui ", "css")):
        return "frontend"
    if any(k in title for k in ("data", "analyst", "scientist", "ml", "machine")):
        return "data"
    if any(k in title for k in ("full", "fullstack", "full-stack")):
        return "fullstack"
    if any(k in title for k in ("back", "api", "server", "node", "django", "rails")):
        return "backend"
    return "default"


def _resolve_sections(
    sections: list[str] | None,
    job_title: str,
    count: int,
) -> list[tuple[str, int]]:
    """Return [(category, n_questions)] summing to count."""
    if sections:
        valid = [s for s in sections if s in CATEGORY_TOPICS]
        if not valid:
            valid = ALL_CATEGORIES
    else:
        role_type  = _detect_role_type(job_title)
        weights    = TOPIC_WEIGHTS.get(role_type, TOPIC_WEIGHTS["default"])
        valid      = sorted(weights.keys(), key=lambda k: -weights[k])

    per_cat  = max(1, count // len(valid))
    result   = [(cat, per_cat) for cat in valid]
    # distribute remainder to first category
    total    = sum(n for _, n in result)
    if total < count:
        result[0] = (result[0][0], result[0][1] + (count - total))
    return result[:count]  # cap if many categories with count=1 each


# ── Prompt ────────────────────────────────────────────────────────────────────

_SYSTEM = textwrap.dedent("""
    You are a senior technical interviewer at a top-tier tech company.
    Generate interview questions that are specific, insightful, and calibrated to the requested difficulty.

    Rules:
    1. Return ONLY a valid JSON array — no markdown fences, no extra text.
    2. Each element: {"category": str, "question": str, "expected_answer_hint": str, "difficulty": str}
    3. Questions must be directly relevant to the job title and category topic.
    4. expected_answer_hint: 1-3 concise sentences on what a strong answer covers.
    5. Difficulty: easy = foundational knowledge, medium = applied reasoning, hard = expert-level depth.
    6. Behavioral questions use the STAR format hint.
    7. Coding/DSA questions mention the key algorithmic concept.
""").strip()

_DIFF_EXAMPLES: dict[str, str] = {
    "easy":   "e.g. Explain what a linked list is and when you would use it.",
    "medium": "e.g. Design a rate limiter for a REST API handling 10k req/s.",
    "hard":   "e.g. How would you implement distributed transactions across microservices without 2PC?",
}


def build_prompt(
    job_title: str,
    job_description: str,
    difficulty: Difficulty,
    section_counts: list[tuple[str, int]],
) -> str:
    specs = "\n".join(
        f"- {cat}: {n} question{'s' if n > 1 else ''}" for cat, n in section_counts
    )
    diff_example = _DIFF_EXAMPLES.get(difficulty, "")
    return textwrap.dedent(f"""
        Job Title: {sanitize_input(job_title, 200)}
        Job Description (excerpt):
        {sanitize_input(job_description, 1200)}

        Difficulty level: {difficulty} ({diff_example})

        Generate questions in these categories:
        {specs}

        Return the JSON array now:
    """).strip()


# ── Generation with retry ─────────────────────────────────────────────────────

_JSON_RE = re.compile(r"\[.*\]", re.DOTALL)


def _parse_json_response(raw: str) -> list[dict]:
    """Extract JSON array from LLM response, retry-safe."""
    text = raw.strip()
    # strip markdown fences if present
    text = re.sub(r"^```(?:json)?", "", text).rstrip("`").strip()
    m = _JSON_RE.search(text)
    if not m:
        raise ValueError(f"No JSON array found in response: {text[:200]}")
    data = json.loads(m.group())
    if not isinstance(data, list):
        raise ValueError("Expected a JSON array")
    for item in data:
        for key in ("category", "question", "expected_answer_hint", "difficulty"):
            if key not in item:
                raise ValueError(f"Missing key '{key}' in question item")
    return data


def generate_questions(
    job_title: str,
    job_description: str,
    difficulty: Difficulty = "medium",
    sections: list[str] | None = None,
    count: int = 10,
) -> list[dict]:
    """Generate interview questions; retries once on bad JSON."""
    count          = max(1, min(count, 30))
    section_counts = _resolve_sections(sections, job_title, count)
    prompt         = build_prompt(job_title, job_description, difficulty, section_counts)
    last_err: Exception | None = None
    for attempt in range(2):
        try:
            text = ask_llm(prompt, system=_SYSTEM, temperature=0.7, max_tokens=2000)
            return _parse_json_response(text)
        except (ValueError, json.JSONDecodeError) as exc:
            last_err = exc
            if attempt == 0:
                # retry with stricter instruction
                prompt = prompt + "\n\nIMPORTANT: Return ONLY the raw JSON array, nothing else."
            continue

    raise RuntimeError(f"Failed to parse questions after 2 attempts: {last_err}")
