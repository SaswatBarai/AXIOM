"""Phase 15 — Career Roadmap Generator: gap-driven, LLM-ordered week-by-week plan."""
from __future__ import annotations

import json
import os
import re
import textwrap
from typing import TypedDict

import google.generativeai as genai

# ── Gemini setup ──────────────────────────────────────────────────────────────

_API_KEY    = os.getenv("GEMINI_API_KEY", "")
_MODEL_NAME = os.getenv("GEMINI_MODEL", "gemini-2.5-flash-lite")
genai.configure(api_key=_API_KEY)

# ── Types ─────────────────────────────────────────────────────────────────────

class RoadmapStep(TypedDict):
    week:            int
    skill:           str
    tier:            str          # "must_have" | "should_have" | "nice_to_have"
    resources:       list[str]
    estimated_hours: int


# ── Skill extraction from gap report ─────────────────────────────────────────

def _extract_gap_skills(gap_report: dict) -> tuple[list[str], list[str], list[str]]:
    """Return (must_have, should_have, nice_to_have) lists of missing skills."""
    missing = gap_report.get("missing", {})
    if isinstance(missing, dict):
        must    = missing.get("must_have", [])
        should  = missing.get("should_have", [])
        nice    = missing.get("nice_to_have", [])
    else:
        must, should, nice = [], [], []
    return (
        [s for s in must   if isinstance(s, str)],
        [s for s in should if isinstance(s, str)],
        [s for s in nice   if isinstance(s, str)],
    )


def _build_skill_list(
    must: list[str],
    should: list[str],
    nice: list[str],
    weeks: int,
) -> list[tuple[str, str]]:
    """Return [(skill, tier)] capped to fit roughly within weeks."""
    # Priority order: must → should → nice; cap total at weeks
    combined: list[tuple[str, str]] = []
    for s in must:
        combined.append((s, "must_have"))
    for s in should:
        combined.append((s, "should_have"))
    for s in nice:
        combined.append((s, "nice_to_have"))
    return combined[:weeks]  # at most 1 skill per week


# ── Prompt ────────────────────────────────────────────────────────────────────

_SYSTEM = textwrap.dedent("""
    You are a senior engineering career coach generating a personalized learning roadmap.

    Rules:
    1. Return ONLY a valid JSON array — no markdown fences, no extra text.
    2. Each element: {"week": int, "skill": str, "tier": str, "resources": [str, str], "estimated_hours": int}
    3. Order skills logically: foundational first, advanced later.
    4. Must-have skills always come before should-have, which come before nice-to-have.
    5. estimated_hours: easy skill = 8-15h, medium = 15-25h, hard = 25-40h.
    6. resources: 2 concrete resources per skill (course name, book, or doc URL — no made-up URLs).
    7. Each week covers exactly one skill.
    8. Week numbers start at 1 and are consecutive.
""").strip()

_JSON_RE = re.compile(r"\[.*\]", re.DOTALL)

_DIFFICULTY_HINTS: dict[str, str] = {
    "must_have":    "foundational/critical",
    "should_have":  "important but learnable on the job",
    "nice_to_have": "differentiating/advanced",
}


def build_prompt(
    target_role:  str,
    skill_list:   list[tuple[str, str]],
    weeks:        int,
    matched:      list[str],
) -> str:
    skill_lines = "\n".join(
        f"  Week {i+1}: {skill} [{tier.replace('_',' ')} — {_DIFFICULTY_HINTS.get(tier,'')}]"
        for i, (skill, tier) in enumerate(skill_list)
    )
    matched_str = ", ".join(matched[:15]) if matched else "none listed"

    return textwrap.dedent(f"""
        {_SYSTEM}

        Target Role: {target_role}
        Total weeks: {weeks}

        Skills already mastered (DO NOT include in roadmap):
        {matched_str}

        Suggested weekly order (you may reorder within tier constraints):
        {skill_lines}

        Generate the JSON roadmap array now ({len(skill_list)} steps):
    """).strip()


# ── JSON parsing with retry ───────────────────────────────────────────────────

def _parse_json_response(raw: str) -> list[dict]:
    text = re.sub(r"^```(?:json)?", "", raw.strip()).rstrip("`").strip()
    m = _JSON_RE.search(text)
    if not m:
        raise ValueError(f"No JSON array in response: {text[:200]}")
    data = json.loads(m.group())
    if not isinstance(data, list):
        raise ValueError("Expected a JSON array")
    for item in data:
        for key in ("week", "skill", "tier", "resources", "estimated_hours"):
            if key not in item:
                raise ValueError(f"Missing key '{key}' in step")
        if not isinstance(item["resources"], list):
            item["resources"] = [str(item["resources"])]
    return data


# ── Main generation function ──────────────────────────────────────────────────

def generate_roadmap(
    target_role: str,
    gap_report:  dict,
    weeks:       int = 12,
) -> list[RoadmapStep]:
    """Generate a week-by-week career roadmap from a Phase 11 gap report."""
    weeks = max(4, min(weeks, 52))

    must, should, nice = _extract_gap_skills(gap_report)
    matched_all: list[str] = []
    for tier_key in ("must_have", "should_have", "nice_to_have"):
        matched_all.extend(gap_report.get("matched", {}).get(tier_key, []))

    skill_list = _build_skill_list(must, should, nice, weeks)

    if not skill_list:
        # No gaps — return a polish/advance plan with placeholders
        skill_list = [("Review and deepen existing skills", "nice_to_have")]

    prompt = build_prompt(target_role, skill_list, len(skill_list), matched_all)
    model  = genai.GenerativeModel(_MODEL_NAME)
    config = genai.types.GenerationConfig(temperature=0.5, max_output_tokens=3000)

    last_err: Exception | None = None
    for attempt in range(2):
        try:
            resp = model.generate_content(prompt, generation_config=config)
            return _parse_json_response(resp.text)
        except (ValueError, json.JSONDecodeError) as exc:
            last_err = exc
            if attempt == 0:
                prompt = prompt + "\n\nIMPORTANT: Return ONLY the raw JSON array, nothing else."
            continue

    raise RuntimeError(f"Failed to generate roadmap after 2 attempts: {last_err}")


# ── Progress helpers ──────────────────────────────────────────────────────────

def compute_progress_stats(
    steps:    list[dict],
    progress: dict,
) -> dict:
    """Return { completedWeeks, totalWeeks, pct, etaWeeks }."""
    total     = len(steps)
    completed = sum(1 for s in steps if progress.get(str(s["week"]), False))
    remaining = total - completed
    pct       = round((completed / total) * 100) if total else 0
    # Assume 1 week per step for ETA
    return {
        "completedWeeks": completed,
        "totalWeeks":     total,
        "pct":            pct,
        "etaWeeks":       remaining,
    }
