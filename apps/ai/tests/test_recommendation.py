import sys
from unittest.mock import MagicMock

# Mock sentence-transformers and database drivers to run unit tests without heavy downloads
sys.modules['sentence_transformers'] = MagicMock()
sys.modules['psycopg2'] = MagicMock()
sys.modules['psycopg2.extras'] = MagicMock()

from services.recommendation import compute_cosine_similarity, compute_match_score

def test_compute_cosine_similarity():
    # Identical vectors
    v1 = [1.0, 2.0, 3.0]
    v2 = [1.0, 2.0, 3.0]
    assert abs(compute_cosine_similarity(v1, v2) - 1.0) < 1e-6

    # Orthogonal vectors
    v3 = [1.0, 0.0]
    v4 = [0.0, 1.0]
    assert abs(compute_cosine_similarity(v3, v4) - 0.0) < 1e-6

    # Opposite vectors
    v5 = [1.0, -1.0]
    v6 = [-1.0, 1.0]
    assert abs(compute_cosine_similarity(v5, v6) - (-1.0)) < 1e-6

    # Zero vector
    v7 = [0.0, 0.0]
    v8 = [1.0, 2.0]
    assert compute_cosine_similarity(v7, v8) == 0.0

def test_compute_match_score():
    # 1. Perfect match (100% cosine similarity, 100% skill overlap)
    resume_emb = [0.5, 0.5]
    job_emb = [0.5, 0.5]
    resume_skills = {"python", "react"}
    job_skills = ["Python", "React"]

    score, matched, missing = compute_match_score(resume_emb, resume_skills, job_emb, job_skills)
    assert score == 100.0
    assert set(matched) == {"Python", "React"}
    assert len(missing) == 0

    # 2. Partial match (2 out of 3 skills)
    job_skills_part = ["Python", "React", "Docker"]  # Docker is missing
    score_part, matched_part, missing_part = compute_match_score(resume_emb, resume_skills, job_emb, job_skills_part)
    # Cosine score = 100 * 0.7 = 70.0
    # Keyword score = (2/3) * 100 * 0.3 = 66.666 * 0.3 = 20.0
    # Total blended = 70.0 + 20.0 = 90.0
    assert abs(score_part - 90.0) < 0.2
    assert set(matched_part) == {"Python", "React"}
    assert set(missing_part) == {"Docker"}

    # 3. No skills listed in job
    score_no_skills, _, _ = compute_match_score(resume_emb, resume_skills, job_emb, [])
    # Cosine = 100 * 0.7 = 70.0
    # Keyword = 100 * 0.3 = 30.0
    # Total = 100.0
    assert score_no_skills == 100.0
