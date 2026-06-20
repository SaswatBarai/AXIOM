"""Skill extraction from raw job-description text.

Reuses the same boundary-aware regex bank as the resume parser
(`services.parser.SKILL_PATTERNS`) so resume skills and job skills speak the
same vocabulary — critical for Phase 9 (matching) to work cleanly.
"""
from __future__ import annotations

from services.parser import SKILL_PATTERNS


def extract_required_skills(text: str, *, cap: int = 25) -> list[str]:
    """Return ordered, deduplicated skill list found in `text`.

    Order preserved by first occurrence in the SKILLS taxonomy so output is
    stable across runs (important for diffs in upserts).
    """
    found: list[str] = []
    if not text:
        return found
    for name, pat in SKILL_PATTERNS:
        if pat.search(text):
            found.append(name)
            if len(found) >= cap:
                break
    return found


def split_required_vs_nice(text: str) -> tuple[list[str], list[str]]:
    """Heuristic split: skills mentioned alongside 'preferred', 'nice', 'bonus',
    'plus' tokens land in `nice_to_have_skills`; everything else is required.

    Crude on purpose — adapters that have structured required/nice lists in
    their source data should override this and not call us.
    """
    if not text:
        return [], []

    lower = text.lower()
    nice_markers = ("nice to have", "preferred", "bonus", "plus:", "good to have")
    cutoff = min((lower.find(m) for m in nice_markers if m in lower), default=-1)

    if cutoff < 0:
        return extract_required_skills(text), []

    required_part = text[:cutoff]
    nice_part = text[cutoff:]
    req = extract_required_skills(required_part)
    nice = [s for s in extract_required_skills(nice_part) if s not in req]
    return req, nice
