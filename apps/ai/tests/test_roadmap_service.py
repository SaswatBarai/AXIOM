"""pytest tests for Phase 15 roadmap_service."""
from __future__ import annotations

import json
from unittest.mock import MagicMock, patch

import pytest

from services.roadmap_service import (
    _build_skill_list,
    _extract_gap_skills,
    _parse_json_response,
    build_prompt,
    compute_progress_stats,
    generate_roadmap,
)

# ── _extract_gap_skills ───────────────────────────────────────────────────────

def test_extract_gap_skills_full():
    report = {
        "missing": {
            "must_have": ["Python", "SQL"],
            "should_have": ["Docker"],
            "nice_to_have": ["Kubernetes"],
        }
    }
    must, should, nice = _extract_gap_skills(report)
    assert must    == ["Python", "SQL"]
    assert should  == ["Docker"]
    assert nice    == ["Kubernetes"]


def test_extract_gap_skills_empty():
    must, should, nice = _extract_gap_skills({})
    assert must == should == nice == []


def test_extract_gap_skills_non_dict_missing():
    must, should, nice = _extract_gap_skills({"missing": []})
    assert must == should == nice == []


def test_extract_gap_skills_filters_non_strings():
    report = {"missing": {"must_have": ["Python", 42, None], "should_have": [], "nice_to_have": []}}
    must, should, nice = _extract_gap_skills(report)
    assert must == ["Python"]


# ── _build_skill_list ─────────────────────────────────────────────────────────

def test_build_skill_list_priority_order():
    result = _build_skill_list(["Python"], ["Docker"], ["Kubernetes"], weeks=10)
    assert result[0] == ("Python", "must_have")
    assert result[1] == ("Docker", "should_have")
    assert result[2] == ("Kubernetes", "nice_to_have")


def test_build_skill_list_caps_at_weeks():
    must   = [f"skill{i}" for i in range(20)]
    result = _build_skill_list(must, [], [], weeks=8)
    assert len(result) == 8


def test_build_skill_list_empty():
    result = _build_skill_list([], [], [], weeks=12)
    assert result == []


def test_build_skill_list_mixed_tiers_order():
    result = _build_skill_list(["A"], ["B", "C"], ["D"], weeks=4)
    tiers = [t for _, t in result]
    assert tiers == ["must_have", "should_have", "should_have", "nice_to_have"]


# ── build_prompt ──────────────────────────────────────────────────────────────

def test_build_prompt_contains_target_role():
    skill_list = [("Python", "must_have")]
    prompt = build_prompt("Senior Engineer", skill_list, 1, [])
    assert "Senior Engineer" in prompt


def test_build_prompt_contains_skills():
    skill_list = [("Python", "must_have"), ("Docker", "should_have")]
    prompt = build_prompt("Backend Dev", skill_list, 2, [])
    assert "Python" in prompt
    assert "Docker" in prompt


def test_build_prompt_contains_matched_mastered():
    skill_list = [("Python", "must_have")]
    prompt = build_prompt("Dev", skill_list, 1, ["React", "TypeScript"])
    assert "React" in prompt
    assert "TypeScript" in prompt


def test_build_prompt_empty_matched():
    skill_list = [("SQL", "must_have")]
    prompt = build_prompt("Data Engineer", skill_list, 1, [])
    assert "none listed" in prompt


def test_build_prompt_week_numbering():
    skill_list = [("A", "must_have"), ("B", "should_have")]
    prompt = build_prompt("Dev", skill_list, 2, [])
    assert "Week 1" in prompt
    assert "Week 2" in prompt


# ── _parse_json_response ──────────────────────────────────────────────────────

def _make_step(**kwargs):
    base = {
        "week": 1,
        "skill": "Python",
        "tier": "must_have",
        "resources": ["Docs", "Book"],
        "estimated_hours": 15,
    }
    base.update(kwargs)
    return base


def test_parse_json_valid():
    raw = json.dumps([_make_step()])
    result = _parse_json_response(raw)
    assert len(result) == 1
    assert result[0]["skill"] == "Python"


def test_parse_json_strips_markdown_fence():
    raw = "```json\n" + json.dumps([_make_step()]) + "\n```"
    result = _parse_json_response(raw)
    assert result[0]["week"] == 1


def test_parse_json_no_array_raises():
    with pytest.raises(ValueError):
        _parse_json_response('{"week": 1}')


def test_parse_json_missing_key_raises():
    step = _make_step()
    del step["resources"]
    with pytest.raises(ValueError, match="Missing key 'resources'"):
        _parse_json_response(json.dumps([step]))


def test_parse_json_resources_not_list_coerced():
    step = _make_step(resources="just a string")
    result = _parse_json_response(json.dumps([step]))
    assert isinstance(result[0]["resources"], list)


def test_parse_json_multiple_steps():
    steps = [_make_step(week=i+1) for i in range(4)]
    result = _parse_json_response(json.dumps(steps))
    assert len(result) == 4


# ── compute_progress_stats ────────────────────────────────────────────────────

def test_compute_progress_stats_empty():
    stats = compute_progress_stats([], {})
    assert stats["pct"] == 0
    assert stats["totalWeeks"] == 0


def test_compute_progress_stats_none_done():
    steps = [{"week": 1}, {"week": 2}]
    stats = compute_progress_stats(steps, {})
    assert stats["completedWeeks"] == 0
    assert stats["pct"] == 0
    assert stats["etaWeeks"] == 2


def test_compute_progress_stats_half_done():
    steps = [{"week": 1}, {"week": 2}]
    stats = compute_progress_stats(steps, {"1": True})
    assert stats["completedWeeks"] == 1
    assert stats["pct"] == 50
    assert stats["etaWeeks"] == 1


def test_compute_progress_stats_all_done():
    steps = [{"week": 1}, {"week": 2}, {"week": 3}]
    progress = {"1": True, "2": True, "3": True}
    stats = compute_progress_stats(steps, progress)
    assert stats["pct"] == 100
    assert stats["etaWeeks"] == 0


# ── generate_roadmap (mocked) ─────────────────────────────────────────────────

_VALID_RESPONSE = json.dumps([
    {
        "week": 1, "skill": "Python", "tier": "must_have",
        "resources": ["Docs", "Fluent Python"],
        "estimated_hours": 20,
    }
])


def test_generate_roadmap_returns_steps():
    mock_model = MagicMock()
    mock_model.generate_content.return_value = MagicMock(text=_VALID_RESPONSE)
    with patch("services.roadmap_service.genai.GenerativeModel", return_value=mock_model):
        result = generate_roadmap("SWE", {"missing": {"must_have": ["Python"], "should_have": [], "nice_to_have": []}, "matched": {}})
    assert len(result) == 1
    assert result[0]["skill"] == "Python"


def test_generate_roadmap_clamps_weeks():
    mock_model = MagicMock()
    mock_model.generate_content.return_value = MagicMock(text=_VALID_RESPONSE)
    with patch("services.roadmap_service.genai.GenerativeModel", return_value=mock_model):
        result = generate_roadmap("SWE", {}, weeks=100)
    assert isinstance(result, list)


def test_generate_roadmap_no_gaps_placeholder():
    mock_model = MagicMock()
    placeholder = json.dumps([
        {"week": 1, "skill": "Review and deepen existing skills", "tier": "nice_to_have",
         "resources": ["Docs"], "estimated_hours": 8}
    ])
    mock_model.generate_content.return_value = MagicMock(text=placeholder)
    with patch("services.roadmap_service.genai.GenerativeModel", return_value=mock_model):
        result = generate_roadmap("SWE", {})
    assert len(result) >= 1


def test_generate_roadmap_retries_on_bad_json():
    mock_model = MagicMock()
    call_count = 0

    def side_effect(*args, **kwargs):
        nonlocal call_count
        call_count += 1
        if call_count == 1:
            return MagicMock(text="not json at all")
        return MagicMock(text=_VALID_RESPONSE)

    mock_model.generate_content.side_effect = side_effect
    with patch("services.roadmap_service.genai.GenerativeModel", return_value=mock_model):
        result = generate_roadmap("SWE", {"missing": {"must_have": ["Python"], "should_have": [], "nice_to_have": []}, "matched": {}})
    assert call_count == 2
    assert result[0]["skill"] == "Python"


def test_generate_roadmap_raises_after_two_failures():
    mock_model = MagicMock()
    mock_model.generate_content.return_value = MagicMock(text="bad json {{")
    with patch("services.roadmap_service.genai.GenerativeModel", return_value=mock_model):
        with pytest.raises(RuntimeError, match="Failed to generate roadmap"):
            generate_roadmap("SWE", {"missing": {"must_have": ["Python"], "should_have": [], "nice_to_have": []}, "matched": {}})
