"""Tests for services/skill_gap.py — Phase 11."""
import pytest
from services.skill_gap import analyze_skill_gap, list_roles, _resume_skill_set, _match_skill


# ── list_roles ────────────────────────────────────────────────────────────────

def test_list_roles_returns_all():
    roles = list_roles()
    assert len(roles) == 12
    ids = {r["id"] for r in roles}
    assert "frontend_engineer" in ids
    assert "backend_engineer" in ids
    assert "ml_engineer" in ids

def test_list_roles_shape():
    for role in list_roles():
        assert "id" in role
        assert "label" in role
        assert "description" in role


# ── _resume_skill_set ─────────────────────────────────────────────────────────

def test_resume_skill_set_merges_skills_and_experience():
    parsed = {
        "skills": [{"name": "Python"}, {"name": "React"}],
        "experience": [
            {"title": "Engineer", "skills": ["Docker", "Redis"]}
        ],
    }
    skills = _resume_skill_set(parsed)
    assert "python" in skills
    assert "react" in skills
    assert "docker" in skills
    assert "redis" in skills

def test_resume_skill_set_handles_string_skills():
    parsed = {"skills": ["python", "typescript"]}
    skills = _resume_skill_set(parsed)
    assert "python" in skills
    assert "typescript" in skills

def test_resume_skill_set_empty():
    assert _resume_skill_set({}) == set()


# ── _match_skill ──────────────────────────────────────────────────────────────

def test_match_skill_exact():
    assert _match_skill("python", {"python", "react"})

def test_match_skill_normalises_dots():
    # "nextjs" in role vs "next.js" in resume
    assert _match_skill("nextjs", {"next.js", "docker"})

def test_match_skill_normalises_hyphens():
    assert _match_skill("ci/cd", {"ci-cd", "docker"})

def test_match_skill_no_match():
    assert not _match_skill("kubernetes", {"docker", "python"})

def test_match_skill_substring():
    # "expressjs" contains "express"
    assert _match_skill("expressjs", {"express"})


# ── analyze_skill_gap — happy path ────────────────────────────────────────────

STRONG_BACKEND_RESUME = {
    "skills": [
        {"name": "Python"}, {"name": "Node.js"}, {"name": "PostgreSQL"},
        {"name": "REST"}, {"name": "Docker"}, {"name": "Redis"},
        {"name": "FastAPI"}, {"name": "AWS"}, {"name": "Kafka"},
    ],
    "experience": [{"title": "SWE", "skills": ["TypeScript"]}],
}

def test_analyze_returns_all_required_fields():
    result = analyze_skill_gap(STRONG_BACKEND_RESUME, "backend_engineer")
    assert "roleId" in result
    assert "roleLabel" in result
    assert "version" in result
    assert "matched" in result
    assert "missing" in result
    assert "recommendations" in result
    assert "summary" in result

def test_analyze_version_present():
    result = analyze_skill_gap(STRONG_BACKEND_RESUME, "backend_engineer")
    assert result["version"] == "v1"

def test_strong_resume_high_readiness():
    result = analyze_skill_gap(STRONG_BACKEND_RESUME, "backend_engineer")
    assert result["summary"]["readinessPct"] >= 70

def test_empty_resume_low_readiness():
    result = analyze_skill_gap({}, "backend_engineer")
    assert result["summary"]["readinessPct"] == 0
    assert result["summary"]["mustHaveGap"] == 5  # all 5 must-haves missing

def test_matched_plus_missing_equals_total():
    result = analyze_skill_gap(STRONG_BACKEND_RESUME, "frontend_engineer")
    total = result["summary"]["total"]
    matched = result["summary"]["matchedCount"]
    missing = result["summary"]["missingCount"]
    assert matched + missing == total

def test_tier_keys_present():
    result = analyze_skill_gap({}, "frontend_engineer")
    for key in ("must_have", "should_have", "nice_to_have"):
        assert key in result["matched"]
        assert key in result["missing"]

def test_recommendations_have_required_fields():
    result = analyze_skill_gap({}, "frontend_engineer")
    for rec in result["recommendations"]:
        assert "skill" in rec
        assert "tier" in rec
        assert "tierLabel" in rec
        assert "priority" in rec

def test_recommendations_sorted_by_priority():
    result = analyze_skill_gap({}, "frontend_engineer")
    priorities = [r["priority"] for r in result["recommendations"]]
    assert priorities == sorted(priorities)

def test_must_have_priority_lower_number_than_nice_to_have():
    result = analyze_skill_gap({}, "frontend_engineer")
    must = next(r for r in result["recommendations"] if r["tier"] == "must_have")
    nice = next((r for r in result["recommendations"] if r["tier"] == "nice_to_have"), None)
    if nice:
        assert must["priority"] < nice["priority"]


# ── analyze_skill_gap — error handling ───────────────────────────────────────

def test_invalid_role_raises_value_error():
    with pytest.raises(ValueError, match="Unknown role"):
        analyze_skill_gap({}, "wizard_engineer")


# ── cross-role correctness ────────────────────────────────────────────────────

def test_ml_engineer_role():
    resume = {"skills": [{"name": "Python"}, {"name": "PyTorch"}, {"name": "Docker"}]}
    result = analyze_skill_gap(resume, "ml_engineer")
    assert "pytorch" in [s.lower() for s in result["matched"]["must_have"]]

def test_frontend_engineer_role():
    resume = {"skills": [{"name": "React"}, {"name": "TypeScript"}]}
    result = analyze_skill_gap(resume, "frontend_engineer")
    assert result["summary"]["matchedCount"] >= 2

def test_devops_engineer_role():
    resume = {"skills": [{"name": "Docker"}, {"name": "Kubernetes"}, {"name": "AWS"}]}
    result = analyze_skill_gap(resume, "devops_engineer")
    assert result["summary"]["matchedCount"] >= 3
