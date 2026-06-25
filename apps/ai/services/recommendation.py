"""
AI-driven job recommendation engine.

Every stage uses DeepSeek V4 Flash to understand, infer, and decide — nothing hardcoded.

Pipeline:
  Stage 1 — AI Profile Understanding
  Stage 2 — AI Career Direction Inference
  Stage 3 — AI Search Intent Generation
  Stage 4 — Fetch & embed opportunities
  Stage 5 — AI opportunity scoring (batched)
  Stage 6 — AI ranking & filtering
"""
from __future__ import annotations
import json
import re
import time
from dataclasses import dataclass, field
from typing import Optional

import numpy as _np

from services.embedding import embed_text
from services.llm import ask_llm
from services.scrapers.freshness import is_db_job_active, max_age_days
from utils.db import get_db_connection, return_connection, parse_vector
from utils.logger import logger


def _parse_json(text: str) -> dict | list:
    """Extract and parse JSON from LLM response (handles markdown fences)."""
    cleaned = text.strip()
    if cleaned.startswith("```"):
        cleaned = re.sub(r"^```(?:json)?\s*", "", cleaned)
        cleaned = re.sub(r"\s*```$", "", cleaned)
    return json.loads(cleaned)


# ── Data classes ──────────────────────────────────────────────────────────────

@dataclass
class CareerDirection:
    name: str
    role_family: str
    confidence: float
    rationale: str
    required_skills: list[str] = field(default_factory=list)


@dataclass
class ProfileInsight:
    directions: list[CareerDirection]
    seniority: str
    seniority_confidence: float
    domains: list[str]
    tech_stack: list[str]
    years_of_experience: float
    has_leadership: bool
    career_stage: str
    strengths: list[str] = field(default_factory=list)
    interests: list[str] = field(default_factory=list)


# ── Helpers ───────────────────────────────────────────────────────────────────

# Keep only the text builder — it formats data, not applies business rules.

_EXCLUDE_KEYS = {"email", "phone", "certifications"}


def _build_profile_text(parsed_data: dict) -> str:
    """Build a clean profile summary for the LLM."""
    parts: list[str] = []

    summary = (parsed_data.get("summary") or "").strip()
    if summary:
        parts.append(f"Summary: {summary}")

    skills = [
        s.get("name", "").strip()
        for s in parsed_data.get("skills", [])
        if isinstance(s, dict) and s.get("name", "").strip()
    ]
    if skills:
        parts.append(f"Skills: {', '.join(skills)}")

    for exp in parsed_data.get("experience", []):
        if not isinstance(exp, dict):
            continue
        title = (exp.get("title") or "").strip()
        company = (exp.get("company") or "").strip()
        desc = (exp.get("description") or "").strip()
        duration = ""
        if exp.get("startDate"):
            duration = f"{exp['startDate']} – {exp.get('endDate', 'Present')}"
        line = f"{title} at {company}" if company else title
        if duration:
            line += f" ({duration})"
        parts.append(line)
        if desc:
            parts.append(f"  {desc}")

    for proj in parsed_data.get("projects", []):
        if isinstance(proj, dict):
            name = (proj.get("name") or "").strip()
            desc = (proj.get("description") or "").strip()
            pskills = proj.get("skills", [])
            p = f"Project: {name}"
            if desc:
                p += f" — {desc}"
            if pskills:
                p += f" [{', '.join(pskills[:5])}]"
            parts.append(p)

    for edu in parsed_data.get("education", []):
        if isinstance(edu, dict):
            field = (edu.get("field") or "").strip()
            degree = (edu.get("degree") or "").strip()
            inst = (edu.get("institution") or "").strip()
            line = ", ".join(x for x in [degree, field, inst] if x)
            if line:
                parts.append(f"Education: {line}")

    return "\n".join(parts)


# ── Stage 1: AI Profile Understanding ─────────────────────────────────────────

_PROFILE_PROMPT = """You are a career profile analyst. Given a parsed resume, understand the person holistically.

Return ONLY valid JSON (no markdown, no explanation) with this structure:
{{
  "seniority": "ENTRY" | "MID" | "SENIOR" | "LEAD" | "EXECUTIVE",
  "seniority_confidence": <0.0–1.0>,
  "domains": ["<domain>", ...],
  "tech_stack": ["<technology>", ...],
  "years_of_experience": <float>,
  "has_leadership": <true|false>,
  "career_stage": "<short label>",
  "strengths": ["<strength>", ...],
  "interests": ["<interest>", ...]
}}

Rules:
- seniority: infer from role titles, years, responsibilities. Do NOT default to ENTRY.
- domains: natural language labels like "backend engineering", "frontend development", "data science", "cloud infrastructure", "devops", "mobile development", "machine learning", "full-stack", etc. Infer freely from skills + experience — do NOT use a predefined list.
- tech_stack: specific technologies/frameworks/tools mentioned
- years_of_experience: estimate from dates. If unclear, make a reasonable guess.
- has_leadership: true if they led teams, mentored, or held lead/principal/manager titles
- career_stage: a natural label like "early career", "mid career", "established", "senior", "leadership"
- strengths: 3–5 things they seem strongest at
- interests: 2–3 areas they appear interested in based on projects and skills

Resume data:
{profile_text}"""


def understand_profile(parsed_data: dict) -> ProfileInsight:
    profile_text = _build_profile_text(parsed_data)
    prompt = _PROFILE_PROMPT.format(profile_text=profile_text)
    raw = ask_llm(prompt)
    try:
        data = _parse_json(raw)
    except (json.JSONDecodeError, ValueError) as e:
        logger.error(f"[stage1] Gemini returned invalid JSON: {raw[:300]}")
        raise ValueError(f"Profile understanding failed: {e}") from e

    return ProfileInsight(
        directions=[],
        seniority=data.get("seniority", "MID"),
        seniority_confidence=float(data.get("seniority_confidence", 0.5)),
        domains=data.get("domains", []),
        tech_stack=data.get("tech_stack", []),
        years_of_experience=float(data.get("years_of_experience", 0)),
        has_leadership=bool(data.get("has_leadership", False)),
        career_stage=data.get("career_stage", "early career"),
        strengths=data.get("strengths", []),
        interests=data.get("interests", []),
    )


# ── Stage 2: AI Career Direction Inference ────────────────────────────────────

_DIRECTIONS_PROMPT = """You are a career strategist. Infer what career directions this person should pursue.

Return ONLY valid JSON (no markdown, no explanation):
[
  {{
    "name": "<direction name>",
    "role_family": "<role family label>",
    "confidence": <0.0–1.0>,
    "rationale": "<why this direction fits>",
    "required_skills": ["<skill>", ...]
  }}
]

Rules:
- Infer 3–5 directions from most to least confident.
- The first (highest confidence) is the PRIMARY career direction.
- Include SECONDARY and ADJACENT directions.
- Names should be natural role titles like "Backend Engineer", "Data Scientist", "Platform Engineer", "Full Stack Developer", "ML Engineer", "DevOps Engineer", "Cloud Architect", etc. — do NOT limit to a predefined list.
- confidence: how strongly the profile supports this direction
- rationale: 1–2 sentences explaining the fit
- required_skills: skills they'd need to strengthen for this direction (can overlap with their existing skills)

Profile seniority: {seniority}
Profile domains: {domains}
Tech stack: {tech_stack}
Years of experience: {years_of_experience}

Full profile:
{profile_text}"""


def infer_career_directions(parsed_data: dict, insight: ProfileInsight) -> list[CareerDirection]:
    profile_text = _build_profile_text(parsed_data)
    prompt = _DIRECTIONS_PROMPT.format(
        profile_text=profile_text,
        seniority=insight.seniority,
        domains=insight.domains,
        tech_stack=insight.tech_stack,
        years_of_experience=insight.years_of_experience,
    )
    raw = ask_llm(prompt)
    try:
        data = _parse_json(raw)
    except (json.JSONDecodeError, ValueError) as e:
        logger.error(f"[stage2] Gemini returned invalid JSON: {raw[:300]}")
        raise ValueError(f"Career direction inference failed: {e}") from e

    if isinstance(data, dict) and "directions" in data:
        data = data["directions"]
    if not isinstance(data, list):
        raise ValueError(f"Expected list of directions, got {type(data)}")

    return [
        CareerDirection(
            name=d.get("name", ""),
            role_family=d.get("role_family", ""),
            confidence=float(d.get("confidence", 0)),
            rationale=d.get("rationale", ""),
            required_skills=d.get("required_skills", []),
        )
        for d in data
    ]


# ── Stage 3: AI Search Intent Generation ──────────────────────────────────────

_INTENTS_PROMPT = """You are a job search strategist. Given a person's profile and career directions, generate diverse search queries to discover relevant opportunities.

Return ONLY valid JSON array of strings (no markdown, no explanation):
["<query 1>", "<query 2>", ...]

Rules:
- Generate 6–10 queries covering primary, secondary, and adjacent directions
- Include role-based queries (e.g., "Backend Engineer intern")
- Include skill-based queries (e.g., "Python backend internship")
- Include domain-based queries (e.g., "backend internship")
- Be diverse — don't repeat similar queries
- Optimize for actual job board search (short, keyword-rich)

Career directions:
{directions_text}

Profile summary:
- Seniority: {seniority}
- Domains: {domains}
- Top skills: {tech_stack}
- Career stage: {career_stage}"""


def generate_search_intents(directions: list[CareerDirection], insight: ProfileInsight) -> list[str]:
    directions_text = "\n".join(
        f"- {d.name} (confidence: {d.confidence:.2f}, family: {d.role_family})"
        for d in directions
    )
    prompt = _INTENTS_PROMPT.format(
        directions_text=directions_text,
        seniority=insight.seniority,
        domains=", ".join(insight.domains),
        tech_stack=", ".join(insight.tech_stack[:8]),
        career_stage=insight.career_stage,
    )
    raw = ask_llm(prompt)
    try:
        intents = _parse_json(raw)
    except (json.JSONDecodeError, ValueError) as e:
        logger.error(f"[stage3] Gemini returned invalid JSON: {raw[:300]}")
        raise ValueError(f"Search intent generation failed: {e}") from e

    if isinstance(intents, dict) and "queries" in intents:
        intents = intents["queries"]
    if not isinstance(intents, list):
        intents = [str(intents)]
    return [str(q).strip() for q in intents if str(q).strip()][:10]


# ── Stage 5: AI Opportunity Scoring (batched) ────────────────────────────────

_BATCH_MATCH_PROMPT = """You are a hiring match analyst. Given a person's profile and a list of job opportunities, evaluate how well each fits.

Return ONLY valid JSON array (no markdown, no explanation):
[
  {{
    "index": <0-based index>,
    "score": <0–100>,
    "matched_skills": ["<skill>", ...],
    "missing_skills": ["<skill>", ...],
    "strengths": ["<strength>", ...],
    "weaknesses": ["<weakness>", ...],
    "reasoning": "<1-2 sentence explanation>",
    "confidence": "high" | "medium" | "low",
    "verdict": "strong_match" | "partial_match" | "weak_match" | "mismatch"
  }}
]

Rules:
- score: 0–100 overall fit. 90+ = exceptional. 70-89 = strong. 50-69 = decent. 30-49 = weak. Below 30 = poor.
- matched_skills: skills the person has that the job requires
- missing_skills: skills the job requires that the person lacks
- strengths: 2-3 profile aspects that make them suitable
- weaknesses: 2-3 gaps or concerns
- reasoning: WHY this score — be specific, reference actual profile details
- verdict: strong_match (great fit), partial_match (some alignment), weak_match (marginal), mismatch (wrong direction)
- Only return entries for jobs you've evaluated. Skip any that don't have enough data.
- If verdict is "mismatch" or score < 20, the job should be excluded.

PROFILE:
{profile_text}

OPPORTUNITIES:
{opportunities_text}"""


def _evaluate_batch(profile_text: str, jobs: list[dict]) -> list[dict]:
    """Score multiple jobs against the profile in a single Gemini call."""
    if not jobs:
        return []

    opp_lines = []
    for i, job in enumerate(jobs):
        desc = (job.get("description") or "")[:800]
        skills = ", ".join(job.get("required_skills", [])[:10])
        opp_lines.append(
            f"[{i}] Title: {job['title']}\n"
            f"    Company: {job['company']}\n"
            f"    Description: {desc}\n"
            f"    Required Skills: {skills}\n"
            f"    Level: {job.get('experience_level', 'MID')}\n"
        )

    prompt = _BATCH_MATCH_PROMPT.format(
        profile_text=profile_text,
        opportunities_text="\n".join(opp_lines),
    )

    try:
        raw = ask_llm(prompt)
        data = _parse_json(raw)
        if not isinstance(data, list):
            logger.warning(f"[match] unexpected batch response: {type(data)}")
            return []
    except (json.JSONDecodeError, ValueError) as e:
        logger.warning(f"[match] batch parse error: {e}")
        return []
    except Exception as e:
        logger.warning(f"[match] batch error: {e}")
        return []

    results = []
    for entry in data:
        idx = entry.get("index")
        if idx is None or idx < 0 or idx >= len(jobs):
            continue
        if entry.get("verdict") == "mismatch" or float(entry.get("score", 0)) < 20:
            continue
        job = jobs[idx]
        results.append({
            "job_id": job["id"],
            "title": job.get("title", ""),
            "company": job.get("company", ""),
            "score": float(entry.get("score", 0)),
            "matched_skills": entry.get("matched_skills", []),
            "missing_skills": entry.get("missing_skills", []),
            "match_reason": {
                "reasoning": entry.get("reasoning", ""),
                "strengths": entry.get("strengths", []),
                "weaknesses": entry.get("weaknesses", []),
                "confidence": entry.get("confidence", "low"),
                "verdict": entry.get("verdict", "weak_match"),
            },
            "source": job.get("source", ""),
            "experience_level": job.get("experience_level", "MID"),
        })
    return results


# ── Stage 6: AI Ranking & Final Filtering ─────────────────────────────────────

_RANK_PROMPT = """You are a recommendation quality analyst. Review these job recommendations for a person and rerank them by genuine relevance.

Return ONLY valid JSON array (no markdown, no explanation):
[
  {{
    "job_id": "<exact job_id from the list below, e.g. abc123>",
    "final_score": <0–100>,
    "rank": <integer starting at 1>,
    "reason": "<why this rank>",
    "would_apply": <true|false>,
    "keep": <true|false>
  }}
]

IMPORTANT: job_id must be the exact ID string shown in brackets before each recommendation, not a number.

Rules:
- "keep": false for any recommendation that feels wrong, irrelevant, or that the person would never apply to.
- "would_apply": true only if you genuinely believe the person would submit an application.
- keep=false and would_apply=false entries will be REMOVED.
- Reorder the kept entries by genuine relevance (best first).
- final_score can adjust the original score up/down based on your holistic judgment.
- Be strict: 5 excellent recommendations > 15 mediocre ones.

Profile summary: {profile_summary}

Career directions: {directions_text}

Scored recommendations:
{results_text}"""


def _rerank(results: list[dict], profile_text: str, directions: list[CareerDirection]) -> list[dict]:
    """Use Gemini to rerank and filter recommendations."""
    if not results:
        return []

    profile_summary = profile_text[:1500]
    directions_text = "; ".join(f"{d.name} ({d.confidence:.0%})" for d in directions[:3])
    results_text = "\n".join(
        f"[{i}] job_id={r['job_id']} score={r['score']} | {r['title']} @ {r['company']} | "
        f"matched={r['matched_skills'][:4]} missing={r['missing_skills'][:4]} | "
        f"verdict={r['match_reason'].get('verdict','?')}"
        for i, r in enumerate(results)
    )

    prompt = _RANK_PROMPT.format(
        profile_summary=profile_summary,
        directions_text=directions_text,
        results_text=results_text,
    )

    try:
        raw = ask_llm(prompt)
        ranking = _parse_json(raw)
        if isinstance(ranking, dict) and "rankings" in ranking:
            ranking = ranking["rankings"]
        if not isinstance(ranking, list):
            logger.warning(f"[rank] unexpected type: {type(ranking)}")
            return results
        logger.debug(f"[rank] LLM returned {len(ranking)} entries")
    except (json.JSONDecodeError, ValueError) as e:
        logger.warning(f"[rank] Gemini parse error: {e}")
        return results
    except Exception as e:
        logger.warning(f"[rank] error: {e}")
        return results

    # Build lookup
    ranking_map = {}
    for entry in ranking:
        jid = entry.get("job_id")
        if jid and entry.get("keep", True):
            ranking_map[jid] = entry

    # Filter + rerank
    kept = [r for r in results if r["job_id"] in ranking_map]
    kept.sort(key=lambda r: ranking_map.get(r["job_id"], {}).get("final_score", 0), reverse=True)

    # Update scores from reranker
    for r in kept:
        jid = r["job_id"]
        if jid in ranking_map:
            r["score"] = ranking_map[jid].get("final_score", r["score"])
            r["match_reason"]["final_reason"] = ranking_map[jid].get("reason", "")
            r["match_reason"]["would_apply"] = ranking_map[jid].get("would_apply", True)

    logger.info(f"[rank] {len(results)} → {len(kept)} after AI reranking")
    return kept


# ── Entry point ───────────────────────────────────────────────────────────────

def match_resume_jobs(resume_id: str, job_ids: Optional[list[str]] = None) -> list[dict]:
    """
    End-to-end AI-driven job recommendation pipeline.

    Stages:
      1. AI Profile Understanding
      2. AI Career Direction Inference
      3. AI Search Intent Generation (logged for scraper)
      4. Fetch + embed opportunities from DB
      5. AI opportunity scoring (Gemini evaluates each job)
      6. AI ranking & filtering (Gemini reranks and prunes)
    """
    pipeline_started = time.monotonic()

    def _log_stage(stage: str, event: str, **extra) -> None:
        logger.info(f"[discovery][match] resume={resume_id} stage={stage} event={event} {extra}")

    conn = get_db_connection()
    try:
        # ── Stage 1a: Fetch resume ────────────────────────────────────────
        with conn.cursor() as cur:
            cur.execute(
                'SELECT "parsedData", "embedding" FROM "resumes" WHERE "id" = %s;',
                (resume_id,),
            )
            row = cur.fetchone()
        if not row:
            raise ValueError(f"Resume {resume_id} not found")

        raw_parsed, stored_emb = row
        parsed_data: dict = (
            json.loads(raw_parsed) if isinstance(raw_parsed, str) else raw_parsed
        ) or {}

        # ── Stage 1b: AI Profile Understanding ─────────────────────────────
        profile_text = _build_profile_text(parsed_data)
        if not profile_text.strip():
            raise ValueError("Empty profile text — cannot evaluate")
        logger.info(f"[match] profile text length={len(profile_text)}")

        stage_started = time.monotonic()
        _log_stage("role_inference", "started")

        # Generate + cache embedding (fast pre-filter, not a business rule)
        profile_embedding = parse_vector(stored_emb)
        if not profile_embedding:
            logger.info(f"[match] Generating embedding for resume {resume_id}")
            profile_embedding = embed_text(profile_text)
            with conn.cursor() as cur:
                cur.execute(
                    'UPDATE "resumes" SET "embedding" = %s::vector WHERE "id" = %s;',
                    (str(profile_embedding), resume_id),
                )
            conn.commit()

        insight = understand_profile(parsed_data)
        logger.info(
            f"[stage1] resume={resume_id} seniority={insight.seniority} "
            f"(conf={insight.seniority_confidence}) domains={insight.domains} "
            f"yoe={insight.years_of_experience} strengths={insight.strengths}"
        )

        # ── Stage 2: AI Career Direction Inference ─────────────────────────
        directions = infer_career_directions(parsed_data, insight)
        insight.directions = directions
        logger.info(
            f"[stage2] resume={resume_id} directions={[d.name for d in directions]} "
            f"confidences={[round(d.confidence, 2) for d in directions]}"
        )

        # ── Stage 3: AI Search Intents (for scraper) ───────────────────────
        intents = generate_search_intents(directions, insight)
        logger.info(f"[stage3] resume={resume_id} intents={intents}")

        _log_stage(
            "role_inference",
            "completed",
            duration_ms=int((time.monotonic() - stage_started) * 1000),
            intent_count=len(intents),
        )

        # ── Stage 4a: Fetch jobs ──────────────────────────────────────────
        fetch_started = time.monotonic()
        _log_stage("job_fetch", "started", job_id_count=len(job_ids) if job_ids else 0)
        max_age = max_age_days()
        freshness_sql = (
            ' AND "postedAt" > NOW() - make_interval(days => %s)'
            ' AND ("expiresAt" IS NULL OR "expiresAt" > NOW())'
        )
        select_cols = (
            '"id", "title", "company", "description", '
            '"requiredSkills", "embedding", "experienceLevel", "source", '
            '"postedAt", "expiresAt"'
        )
        with conn.cursor() as cur:
            if job_ids:
                cur.execute(
                    f'SELECT {select_cols} FROM "jobs" '
                    f'WHERE "id" = ANY(%s){freshness_sql};',
                    (job_ids, max_age),
                )
            else:
                cur.execute(
                    f'SELECT {select_cols} FROM "jobs" '
                    f'WHERE TRUE{freshness_sql};',
                    (max_age,),
                )
            rows = cur.fetchall()

        jobs: list[dict] = [
            {
                "id": r[0],
                "title": r[1] or "",
                "company": r[2] or "",
                "description": r[3] or "",
                "required_skills": r[4] or [],
                "embedding": parse_vector(r[5]),
                "experience_level": r[6] or "MID",
                "source": r[7] or "",
                "posted_at": r[8],
                "expires_at": r[9],
            }
            for r in rows
        ]
        jobs = [
            j for j in jobs
            if j["posted_at"] is not None
            and is_db_job_active(
                title=j["title"],
                posted_at=j["posted_at"],
                expires_at=j["expires_at"],
            )
        ]

        if not jobs:
            logger.warning(f"[match] resume={resume_id} no jobs found")
            return []

        _log_stage(
            "job_fetch",
            "completed",
            duration_ms=int((time.monotonic() - fetch_started) * 1000),
            job_count=len(jobs),
        )

        # ── Stage 4b: Generate embeddings for jobs that lack them ─────────
        embed_started = time.monotonic()
        _log_stage("job_embedding", "started", job_count=len(jobs))
        to_update: list[tuple[str, list[float]]] = []
        for job in jobs:
            if not job["embedding"]:
                job_text = (
                    f"Job Title: {job['title']}\n"
                    f"Company: {job['company']}\n"
                    f"Description: {job['description']}\n"
                    f"Required Skills: {', '.join(job['required_skills'])}"
                )
                job["embedding"] = embed_text(job_text)
                to_update.append((job["id"], job["embedding"]))

        if to_update:
            with conn.cursor() as cur:
                for j_id, j_emb in to_update:
                    cur.execute(
                        'UPDATE "jobs" SET "embedding" = %s::vector WHERE "id" = %s;',
                        (str(j_emb), j_id),
                    )
            conn.commit()
            logger.info(f"[match] Generated embeddings for {len(to_update)} jobs")

        _log_stage(
            "job_embedding",
            "completed",
            duration_ms=int((time.monotonic() - embed_started) * 1000),
            embedded_count=len(to_update),
        )

        # ── Use embedding similarity as a fast pre-filter ─────────────────
        # (Linear algebra, not a business rule — no hardcoded threshold.)
        # Sort jobs by cosine similarity to profile; take those with non-zero sim.
        r_vec = _np.array(profile_embedding, dtype=_np.float32)
        r_norm = _np.linalg.norm(r_vec)
        mat = _np.array([j["embedding"] for j in jobs], dtype=_np.float32)
        dots = mat @ r_vec
        norms = _np.linalg.norm(mat, axis=1)
        denom = norms * r_norm
        sims = _np.where(denom > 0, dots / denom, 0.0).clip(0.0, 1.0)

        # Pair similarity with jobs, sort descending
        paired = [(float(sims[i]), jobs[i]) for i in range(len(jobs))]
        paired.sort(key=lambda x: x[0], reverse=True)

        # Take jobs with non-zero similarity — up to a reasonable batch
        candidates = [j for sim, j in paired if sim > 0][:60]

        if not candidates:
            # Fallback: take all jobs (edge case where no embeddings are similar)
            candidates = jobs[:30]

        logger.info(f"[match] resume={resume_id} total_jobs={len(jobs)} candidates={len(candidates)}")

        # ── Stage 5: AI Opportunity Scoring (batched) ─────────────────────
        scoring_started = time.monotonic()
        _log_stage("ai_scoring", "started", candidate_count=len(candidates))
        BATCH_SIZE = 5
        results: list[dict] = []
        for i in range(0, len(candidates), BATCH_SIZE):
            batch = candidates[i:i + BATCH_SIZE]
            batch_started = time.monotonic()
            batch_results = _evaluate_batch(profile_text, batch)
            results.extend(batch_results)
            logger.info(
                f"[discovery][match] resume={resume_id} stage=ai_scoring batch={i // BATCH_SIZE + 1} "
                f"duration_ms={int((time.monotonic() - batch_started) * 1000)} scored={len(batch_results)}"
            )

        _log_stage(
            "ai_scoring",
            "completed",
            duration_ms=int((time.monotonic() - scoring_started) * 1000),
            scored_count=len(results),
        )

        logger.info(f"[stage5] resume={resume_id} scored={len(results)}")

        active_ids = {j["id"] for j in jobs}
        results = [r for r in results if r["job_id"] in active_ids]

        # ── Stage 6: AI Ranking & Filtering ───────────────────────────────
        rerank_started = time.monotonic()
        _log_stage("ai_ranking", "started", input_count=len(results))
        results = _rerank(results, profile_text, directions)
        _log_stage(
            "ai_ranking",
            "completed",
            duration_ms=int((time.monotonic() - rerank_started) * 1000),
            output_count=len(results),
        )

        # ── Quality self-check ────────────────────────────────────────────
        would_apply = [r for r in results if r.get("match_reason", {}).get("would_apply", False)]
        logger.info(
            f"[quality] resume={resume_id} total_recommended={len(results)} "
            f"would_apply={len(would_apply)} "
            f"avg_score={round(sum(r['score'] for r in results) / max(len(results), 1), 1)} "
            f"pipeline_duration_ms={int((time.monotonic() - pipeline_started) * 1000)}"
        )

        return results

    except Exception as exc:
        logger.error(f"[match] Pipeline failed for {resume_id}: {exc}")
        conn.rollback()
        raise
    finally:
        return_connection(conn)
