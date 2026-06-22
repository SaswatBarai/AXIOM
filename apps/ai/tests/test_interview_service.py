"""Phase 14 — Interview Question Generator: pytest test suite."""
from __future__ import annotations

import json
from unittest.mock import MagicMock, patch

import pytest

from services.interview_service import (
    ALL_CATEGORIES,
    CATEGORY_TOPICS,
    TOPIC_WEIGHTS,
    _detect_role_type,
    _parse_json_response,
    _resolve_sections,
    build_prompt,
    generate_questions,
)

# ── Fixtures ──────────────────────────────────────────────────────────────────

SAMPLE_QUESTIONS = [
    {
        "category": "dsa",
        "question": "Explain the difference between BFS and DFS.",
        "expected_answer_hint": "BFS uses a queue; DFS uses a stack or recursion. BFS finds shortest path in unweighted graphs.",
        "difficulty": "easy",
    },
    {
        "category": "system_design",
        "question": "How would you design a URL shortener?",
        "expected_answer_hint": "Hash function, collision handling, redirect flow, analytics, storage choice.",
        "difficulty": "medium",
    },
    {
        "category": "behavioral",
        "question": "Tell me about a time you dealt with a difficult stakeholder.",
        "expected_answer_hint": "STAR: Situation, Task, Action, Result. Focus on empathy and alignment.",
        "difficulty": "easy",
    },
]


def _make_mock_response(questions: list[dict]) -> MagicMock:
    mock = MagicMock()
    mock.text = json.dumps(questions)
    return mock


# ── _detect_role_type ─────────────────────────────────────────────────────────

def test_detect_role_type_frontend():
    assert _detect_role_type("Senior React Developer") == "frontend"

def test_detect_role_type_backend():
    assert _detect_role_type("Backend Engineer - Node.js") == "backend"

def test_detect_role_type_data():
    assert _detect_role_type("Data Scientist") == "data"

def test_detect_role_type_fullstack():
    assert _detect_role_type("Full-Stack Engineer") == "fullstack"

def test_detect_role_type_default():
    assert _detect_role_type("Product Manager") == "default"


# ── _resolve_sections ─────────────────────────────────────────────────────────

def test_resolve_sections_explicit():
    result = _resolve_sections(["dsa", "behavioral"], "Software Engineer", 6)
    cats   = [cat for cat, _ in result]
    assert "dsa" in cats
    assert "behavioral" in cats

def test_resolve_sections_count_distribution():
    result = _resolve_sections(["dsa", "sql"], "Backend Engineer", 6)
    total  = sum(n for _, n in result)
    assert total == 6

def test_resolve_sections_auto_from_job_title():
    result = _resolve_sections(None, "React Frontend Developer", 10)
    assert len(result) > 0
    total  = sum(n for _, n in result)
    assert total == 10

def test_resolve_sections_invalid_ignored():
    # invalid section names get filtered; falls back to ALL_CATEGORIES
    result = _resolve_sections(["nonexistent_cat"], "SWE", 5)
    total  = sum(n for _, n in result)
    assert total == 5

def test_resolve_sections_remainder_distributed():
    result = _resolve_sections(["dsa", "sql", "behavioral"], "Engineer", 10)
    total  = sum(n for _, n in result)
    assert total == 10

def test_resolve_sections_min_one_per_cat():
    result = _resolve_sections(["dsa", "sql", "behavioral", "coding"], "Engineer", 4)
    for _, n in result:
        assert n >= 1


# ── _parse_json_response ──────────────────────────────────────────────────────

def test_parse_json_response_clean():
    raw  = json.dumps(SAMPLE_QUESTIONS)
    data = _parse_json_response(raw)
    assert len(data) == 3
    assert data[0]["category"] == "dsa"

def test_parse_json_response_strips_markdown():
    raw  = "```json\n" + json.dumps(SAMPLE_QUESTIONS) + "\n```"
    data = _parse_json_response(raw)
    assert len(data) == 3

def test_parse_json_response_embedded_in_text():
    raw  = "Here are your questions:\n" + json.dumps(SAMPLE_QUESTIONS)
    data = _parse_json_response(raw)
    assert len(data) == 3

def test_parse_json_response_missing_key_raises():
    bad = [{"category": "dsa", "question": "Q?"}]  # missing expected_answer_hint + difficulty
    with pytest.raises(ValueError, match="Missing key"):
        _parse_json_response(json.dumps(bad))

def test_parse_json_response_no_array_raises():
    with pytest.raises(ValueError, match="No JSON array"):
        _parse_json_response("This is plain text with no JSON.")

def test_parse_json_response_not_array_raises():
    # a JSON object (not array) has no [...] so it hits "No JSON array found"
    with pytest.raises(ValueError):
        _parse_json_response('{"key": "value"}')


# ── build_prompt ──────────────────────────────────────────────────────────────

def test_build_prompt_contains_job_title():
    prompt = build_prompt("Backend Engineer", "Build REST APIs", "medium", [("dsa", 3)])
    assert "Backend Engineer" in prompt

def test_build_prompt_contains_difficulty():
    prompt = build_prompt("SWE", "Code stuff", "hard", [("coding", 5)])
    assert "hard" in prompt

def test_build_prompt_truncates_jd():
    long_jd = "x" * 5000
    prompt  = build_prompt("SWE", long_jd, "easy", [("behavioral", 2)])
    assert long_jd not in prompt
    assert len(prompt) < 5000 + 500  # prompt overhead is bounded

def test_build_prompt_contains_section_specs():
    prompt = build_prompt("SWE", "desc", "medium", [("dsa", 3), ("sql", 2)])
    assert "dsa" in prompt
    assert "sql" in prompt


# ── generate_questions ────────────────────────────────────────────────────────

def test_generate_questions_returns_list():
    mock_resp = _make_mock_response(SAMPLE_QUESTIONS)
    with patch("services.interview_service.genai.GenerativeModel") as MockModel:
        MockModel.return_value.generate_content.return_value = mock_resp
        result = generate_questions("Backend Engineer", "Build APIs", difficulty="medium", count=3)
    assert isinstance(result, list)
    assert len(result) == 3

def test_generate_questions_fields_present():
    mock_resp = _make_mock_response(SAMPLE_QUESTIONS)
    with patch("services.interview_service.genai.GenerativeModel") as MockModel:
        MockModel.return_value.generate_content.return_value = mock_resp
        result = generate_questions("SWE", "desc")
    for q in result:
        assert "category" in q
        assert "question" in q
        assert "expected_answer_hint" in q
        assert "difficulty" in q

def test_generate_questions_retries_on_bad_json():
    good_resp  = _make_mock_response(SAMPLE_QUESTIONS)
    bad_resp   = MagicMock()
    bad_resp.text = "not json at all"

    with patch("services.interview_service.genai.GenerativeModel") as MockModel:
        MockModel.return_value.generate_content.side_effect = [bad_resp, good_resp]
        result = generate_questions("SWE", "desc", count=3)
    assert len(result) == 3

def test_generate_questions_raises_after_two_failures():
    bad_resp       = MagicMock()
    bad_resp.text  = "not json"
    with patch("services.interview_service.genai.GenerativeModel") as MockModel:
        MockModel.return_value.generate_content.return_value = bad_resp
        with pytest.raises(RuntimeError, match="Failed to parse"):
            generate_questions("SWE", "desc")

def test_generate_questions_count_capped_at_30():
    many = SAMPLE_QUESTIONS * 10  # 30 items
    mock_resp = _make_mock_response(many)
    with patch("services.interview_service.genai.GenerativeModel") as MockModel:
        MockModel.return_value.generate_content.return_value = mock_resp
        # count=50 should be clamped to 30 before calling LLM
        generate_questions("SWE", "desc", count=50)
    call_args = MockModel.return_value.generate_content.call_args
    prompt_str = call_args[0][0]
    # prompt should NOT contain "50 questions"
    assert "50 question" not in prompt_str


# ── Taxonomy sanity ───────────────────────────────────────────────────────────

def test_all_categories_have_topics():
    for cat in ALL_CATEGORIES:
        assert cat in CATEGORY_TOPICS
        assert len(CATEGORY_TOPICS[cat]) > 0

def test_topic_weights_sum_approximately_one():
    for role, weights in TOPIC_WEIGHTS.items():
        total = sum(weights.values())
        assert abs(total - 1.0) < 0.01, f"{role} weights sum to {total}"

def test_all_category_ids_valid():
    for cat in ALL_CATEGORIES:
        assert cat in ("dsa", "system_design", "sql", "behavioral", "coding", "language_specific")
