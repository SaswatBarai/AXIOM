import json
import math
from services.embedding import embed_text
from utils.db import get_db_connection, parse_vector
from utils.logger import logger

try:
    import numpy as _np
    _NUMPY = True
except ImportError:
    _NUMPY = False


def compute_cosine_similarity(v1: list[float], v2: list[float]) -> float:
    """Cosine similarity; uses numpy when available (~20x faster than pure Python)."""
    if _NUMPY:
        a = _np.array(v1, dtype=_np.float32)
        b = _np.array(v2, dtype=_np.float32)
        denom = _np.linalg.norm(a) * _np.linalg.norm(b)
        if denom == 0:
            return 0.0
        return float(_np.dot(a, b) / denom)
    # Pure-Python fallback
    dot = sum(x * y for x, y in zip(v1, v2))
    mag1 = math.sqrt(sum(x * x for x in v1))
    mag2 = math.sqrt(sum(x * x for x in v2))
    if mag1 == 0 or mag2 == 0:
        return 0.0
    return dot / (mag1 * mag2)

def compute_match_score(
    resume_embedding: list[float],
    resume_skills_set: set[str],
    job_embedding: list[float],
    job_required_skills: list[str]
) -> tuple[float, list[str], list[str]]:
    """Compute blended score: 70% Cosine Similarity + 30% Keyword Overlap."""
    # Cosine similarity
    cos_sim = 0.0
    v1 = resume_embedding
    v2 = job_embedding
    if v1 and v2 and len(v1) == len(v2):
        cos_sim = compute_cosine_similarity(v1, v2)

    cosine_score = max(0.0, cos_sim) * 100.0

    # Keyword overlap
    job_skills_set = {s.lower().strip() for s in job_required_skills if s}
    matched_skills = resume_skills_set.intersection(job_skills_set)

    if job_skills_set:
        keyword_score = (len(matched_skills) / len(job_skills_set)) * 100.0
    else:
        keyword_score = 100.0  # no required skills → no penalty

    # Blended score (70% Cosine + 30% Keyword)
    blended_score = 0.7 * cosine_score + 0.3 * keyword_score

    # Maintain casing of original job required skills
    matched_cased = [s for s in job_required_skills if s and s.lower().strip() in resume_skills_set]
    missing_cased = [s for s in job_required_skills if s and s.lower().strip() not in resume_skills_set]

    return round(blended_score, 1), matched_cased, missing_cased

def _batch_match(
    resume_embedding: list[float],
    resume_skills_set: set[str],
    jobs: list[dict],
) -> list[dict]:
    """Score all jobs in one vectorized pass (numpy) or a Python loop (fallback).

    Using a single matrix multiply instead of per-job calls cuts runtime from
    ~38 µs/job to ~0.5 µs/job on 10k jobs.
    """
    if not jobs:
        return []

    if _NUMPY:
        r_vec = _np.array(resume_embedding, dtype=_np.float32)
        r_norm = _np.linalg.norm(r_vec)

        # Build matrix only for jobs that have embeddings
        valid_idx = [i for i, j in enumerate(jobs) if j["embedding"]]
        if valid_idx:
            mat = _np.array([jobs[i]["embedding"] for i in valid_idx], dtype=_np.float32)
            dots = mat @ r_vec                            # (N,)
            j_norms = _np.linalg.norm(mat, axis=1)       # (N,)
            denom = j_norms * r_norm
            cos_sims = _np.where(denom > 0, dots / denom, 0.0)
            cos_scores = _np.clip(cos_sims, 0.0, 1.0) * 100.0
        else:
            cos_scores = _np.zeros(len(jobs), dtype=_np.float32)
            valid_idx = list(range(len(jobs)))

        cos_map: dict[int, float] = {i: float(cos_scores[k]) for k, i in enumerate(valid_idx)}
    else:
        cos_map = {}
        for i, job in enumerate(jobs):
            if job["embedding"]:
                cos_map[i] = max(0.0, compute_cosine_similarity(resume_embedding, job["embedding"])) * 100.0
            else:
                cos_map[i] = 0.0

    matches = []
    for i, job in enumerate(jobs):
        cosine_score = cos_map.get(i, 0.0)
        job_skills_set = {s.lower().strip() for s in job["required_skills"] if s}
        if job_skills_set:
            matched_skills = resume_skills_set.intersection(job_skills_set)
            keyword_score = (len(matched_skills) / len(job_skills_set)) * 100.0
        else:
            matched_skills = set()
            keyword_score = 100.0

        blended = round(0.7 * cosine_score + 0.3 * keyword_score, 1)
        matched_cased = [s for s in job["required_skills"] if s and s.lower().strip() in resume_skills_set]
        missing_cased = [s for s in job["required_skills"] if s and s.lower().strip() not in resume_skills_set]

        matches.append({
            "job_id": job["id"],
            "score": blended,
            "matched_skills": matched_cased,
            "missing_skills": missing_cased,
        })

    matches.sort(key=lambda x: x["score"], reverse=True)
    return matches


def match_resume_jobs(resume_id: str, job_ids: list[str] = None) -> list[dict]:
    conn = get_db_connection()
    try:
        # 1. Fetch resume
        with conn.cursor() as cur:
            cur.execute(
                'SELECT "parsedData", "embedding" FROM "resumes" WHERE "id" = %s;',
                (resume_id,)
            )
            res = cur.fetchone()
            if not res:
                logger.error(f"Resume {resume_id} not found")
                raise ValueError("Resume not found")
            parsed_data_json, resume_emb_data = res

        # Parse resume data
        if isinstance(parsed_data_json, str):
            parsed_data = json.loads(parsed_data_json)
        else:
            parsed_data = parsed_data_json or {}

        # 2. Get/generate resume embedding
        resume_embedding = parse_vector(resume_emb_data)
        if not resume_embedding:
            logger.info(f"Generating embedding for resume {resume_id}...")
            # Build profile text
            skills_list = [s.get("name", "") for s in parsed_data.get("skills", []) if isinstance(s, dict)]
            skills_str = ", ".join(skills_list)

            exp_list = []
            for e in parsed_data.get("experience", []):
                if isinstance(e, dict):
                    exp_list.append(f"{e.get('title', '')} at {e.get('company', '')}: {e.get('description', '')}")
            exp_str = "\n".join(exp_list)

            summary = parsed_data.get("summary", "") or ""

            resume_text = f"Skills: {skills_str}\nSummary: {summary}\nExperience: {exp_str}"
            resume_embedding = embed_text(resume_text)

            # Save it back to db
            with conn.cursor() as cur:
                cur.execute(
                    'UPDATE "resumes" SET "embedding" = %s::vector WHERE "id" = %s;',
                    (str(resume_embedding), resume_id)
                )
            conn.commit()

        # 3. Fetch jobs
        jobs = []
        with conn.cursor() as cur:
            if job_ids:
                cur.execute(
                    'SELECT "id", "title", "company", "description", "requiredSkills", "embedding" FROM "jobs" WHERE "id" = ANY(%s);',
                    (job_ids,)
                )
            else:
                cur.execute(
                    'SELECT "id", "title", "company", "description", "requiredSkills", "embedding" FROM "jobs";'
                )

            rows = cur.fetchall()
            for r in rows:
                jobs.append({
                    "id": r[0],
                    "title": r[1],
                    "company": r[2],
                    "description": r[3],
                    "required_skills": r[4] or [],
                    "embedding": parse_vector(r[5])
                })

        # 4. Generate missing job embeddings
        jobs_to_update = []
        for job in jobs:
            if not job["embedding"] or len(job["embedding"]) == 0:
                logger.info(f"Generating embedding for job {job['id']}...")
                job_text = f"Job Title: {job['title']}\nCompany: {job['company']}\nDescription: {job['description']}\nRequired Skills: {', '.join(job['required_skills'])}"
                job["embedding"] = embed_text(job_text)
                jobs_to_update.append((job["id"], job["embedding"]))

        if jobs_to_update:
            with conn.cursor() as cur:
                for j_id, j_emb in jobs_to_update:
                    cur.execute(
                        'UPDATE "jobs" SET "embedding" = %s::vector WHERE "id" = %s;',
                        (str(j_emb), j_id)
                    )
            conn.commit()

        # 5. Perform match computation
        resume_skills_set = {
            s.get("name", "").lower().strip()
            for s in parsed_data.get("skills", [])
            if isinstance(s, dict) and s.get("name")
        }

        matches = _batch_match(resume_embedding, resume_skills_set, jobs)

        # Sort by score descending
        matches.sort(key=lambda x: x["score"], reverse=True)
        return matches

    except Exception as e:
        logger.error(f"Error in match_resume_jobs: {e}")
        conn.rollback()
        raise e
    finally:
        conn.close()
