"""
Phase 11 — Skill Gap Detection.

Compares a parsed resume against a curated target-role skill taxonomy and
returns matched / missing skills tiered as must-have / should-have / nice-to-have.
"""
from __future__ import annotations

import json
import os
from typing import Any

_DATA_PATH = os.path.join(os.path.dirname(__file__), "..", "data", "target_roles.json")

# Loaded once at import time; no I/O per request
with open(_DATA_PATH, encoding="utf-8") as _f:
    _ROLES_DATA: dict[str, Any] = json.load(_f)

ROLES_VERSION: str = _ROLES_DATA["version"]
_ROLES: dict[str, dict] = _ROLES_DATA["roles"]


def list_roles() -> list[dict]:
    """Return role ids + labels + descriptions for the picker UI."""
    return [
        {"id": role_id, "label": meta["label"], "description": meta["description"]}
        for role_id, meta in _ROLES.items()
    ]


def _resume_skill_set(parsed: dict[str, Any]) -> set[str]:
    """Merge skills from the skills list AND from experience entries."""
    skills: set[str] = set()

    for s in parsed.get("skills", []):
        name = (s.get("name", "") if isinstance(s, dict) else str(s)).lower().strip()
        if name:
            skills.add(name)

    for exp in parsed.get("experience", []):
        for s in exp.get("skills", []):
            skills.add(str(s).lower().strip())

    return skills


def _match_skill(candidate: str, resume_skills: set[str]) -> bool:
    """
    Fuzzy-enough matching: a resume skill matches a role skill if either
    is a substring of the other (handles 'nextjs' vs 'next.js', 'nodejs' vs 'node.js').
    """
    c = candidate.lower().replace(".", "").replace("-", "").replace("/", "").replace(" ", "")
    for rs in resume_skills:
        r = rs.lower().replace(".", "").replace("-", "").replace("/", "").replace(" ", "")
        if c == r or c in r or r in c:
            return True
    return False


def _build_recommendations(missing_by_tier: dict[str, list[str]]) -> list[dict]:
    """Turn missing skills into ranked recommendation objects."""
    recs: list[dict] = []
    priority = {"must_have": 1, "should_have": 2, "nice_to_have": 3}
    labels = {"must_have": "Must Have", "should_have": "Should Have", "nice_to_have": "Nice to Have"}
    for tier, skills in missing_by_tier.items():
        for skill in skills:
            recs.append({"skill": skill, "tier": tier, "tierLabel": labels[tier], "priority": priority[tier]})
    return recs


def analyze_skill_gap(parsed: dict[str, Any], role_id: str) -> dict[str, Any]:
    """
    Compare parsed resume against the given target role.

    Returns:
        {
          roleId, roleLabel, version,
          matched: { must_have: [...], should_have: [...], nice_to_have: [...] },
          missing: { must_have: [...], should_have: [...], nice_to_have: [...] },
          recommendations: [{ skill, tier, tierLabel, priority }],
          summary: { total, matched_count, missing_count, readiness_pct,
                     must_have_gap, skills_away }
        }
    """
    if role_id not in _ROLES:
        raise ValueError(f"Unknown role '{role_id}'. Valid: {list(_ROLES)}")

    role = _ROLES[role_id]
    resume_skills = _resume_skill_set(parsed)

    matched: dict[str, list[str]] = {"must_have": [], "should_have": [], "nice_to_have": []}
    missing: dict[str, list[str]] = {"must_have": [], "should_have": [], "nice_to_have": []}

    for tier in ("must_have", "should_have", "nice_to_have"):
        for skill in role.get(tier, []):
            if _match_skill(skill, resume_skills):
                matched[tier].append(skill)
            else:
                missing[tier].append(skill)

    total_skills = sum(len(role.get(t, [])) for t in ("must_have", "should_have", "nice_to_have"))
    matched_count = sum(len(v) for v in matched.values())
    missing_count = sum(len(v) for v in missing.values())

    # Readiness weights: must-have = 3×, should-have = 2×, nice-to-have = 1×
    weighted_matched = (
        len(matched["must_have"]) * 3 +
        len(matched["should_have"]) * 2 +
        len(matched["nice_to_have"]) * 1
    )
    weighted_total = (
        len(role.get("must_have", [])) * 3 +
        len(role.get("should_have", [])) * 2 +
        len(role.get("nice_to_have", [])) * 1
    )
    readiness_pct = round(weighted_matched / weighted_total * 100) if weighted_total else 0

    return {
        "roleId": role_id,
        "roleLabel": role["label"],
        "version": ROLES_VERSION,
        "matched": matched,
        "missing": missing,
        "recommendations": _build_recommendations(missing),
        "summary": {
            "total": total_skills,
            "matchedCount": matched_count,
            "missingCount": missing_count,
            "readinessPct": readiness_pct,
            "mustHaveGap": len(missing["must_have"]),
            "skillsAway": missing_count,
        },
    }
