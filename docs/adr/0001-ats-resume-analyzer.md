# ADR 0001 — ATS Resume Analyzer pipeline

**Status:** Accepted
**Date:** 2026-06-20
**Phase:** 7

## Context

AXIOM needs to score a candidate's resume against an arbitrary job description
(JD) and return:

- a composite ATS score (0–100),
- sub-scores for keyword match, completeness, readability, and formatting,
- a list of resume *strengths*, *missing skills*, and *actionable suggestions*.

The scoring needs to be deterministic, cheap, and fast enough to run inline on
an HTTP request — not a queued job. We did **not** want to depend on a hosted
LLM for this feature: it would add cost, latency, and a non-determinism that
makes the score hard to reason about. The DoD requires p95 < 200ms and the
LLM round-trip alone would blow that budget.

## Decision

Implement ATS scoring as a pure, dependency-free Python function in the AI
service. No LLM, no embedding model, no network calls beyond the original
inbound request.

**Pipeline:**

```
[Web]   POST /resumes/:id/analyze  { jobDescription }
   │
   ▼
[API]   resume.service.analyzeResume(id, userId, jd)
   │      ├─ Prisma  : fetch resume, check ownership, require parsedData
   │      └─ HTTP    : x-internal-secret → AI service
   ▼
[AI]    POST /api/resume/analyze   { parsed_data, job_description }
   │      └─ services/ats.analyze_resume(parsed, jd)  ← pure function
   ▼
[API]   prisma.resume.update({ atsScore: ... })
   │
   ▼
[Web]   { resume: { ..., atsScore } }
```

**Scoring formula** (weighted average → `overall`):

| sub-score      | weight | input                                              |
|----------------|--------|----------------------------------------------------|
| `keywordMatch` |  50%   | Set-intersection between JD keywords and resume words. |
| `completeness` |  25%   | Penalties for missing skills / experience / education / contact / summary. |
| `readability`  |  15%   | Word-count buckets (penalises very short or excessively long resumes). |
| `formatting`   |  10%   | Structural presence: skills, experience, education sections. |

**Keyword extraction** uses a regex tokenizer + curated stop-word and
generic-tech-noise lists, so words like *"experience"*, *"team"*, *"build"*
don't dilute the match.

## Consequences

### Positive

- **Fast.** Measured p95 = 12.9 ms over 80 sequential calls against the full
  stack (Postgres + Redis + Express + FastAPI). Well under the 200ms DoD bar.
- **Deterministic.** Same input → same output; easy to unit-test and reason
  about. 12 unit tests on `analyze_resume` covering happy path, empty inputs,
  zero-match, score bounds, and suggestion content.
- **Free at runtime.** No external API calls, no token spend.
- **Composable.** The same `analyze_resume` function can be invoked from a
  batch job (Phase 11 skill-gap detection) without HTTP overhead.

### Negative / trade-offs

- **Surface-level.** Pure keyword match misses semantic alignment — "ML
  engineer with model deployment experience" won't match "MLOps practitioner"
  even though they're equivalent. We accept this for v1; a later phase can
  layer a semantic embedding step on top of the keyword score without
  changing the API contract.
- **Stop-word list is hand-curated.** New domains (e.g. legal, healthcare)
  may need additions. The list lives in `apps/ai/services/ats.py` and is
  trivial to extend.
- **Requires parsed data.** If parsing hasn't completed, the endpoint returns
  422 and the client must retry. Acceptable because parsing typically finishes
  in <1s on a 2KB resume.

## Alternatives considered

1. **LLM-based scoring (GPT-4 / Claude).** Rejected: too slow (~1–3s per
   call), non-deterministic, costly at scale, and adds a runtime dependency.
   We may use an LLM later for the *suggestions* text, but the score itself
   stays deterministic.
2. **Embedding-based semantic matching.** Rejected for Phase 7: would require
   us to stand up a vector DB and an embedding model, doubling the
   infrastructure surface for a feature that works well enough with keywords.
   Earmarked for Phase 9 (Job Matching).
3. **Client-side scoring.** Rejected: would expose the scoring algorithm and
   prevent us from tuning weights without a frontend deploy.

## References

- Implementation: [apps/ai/services/ats.py](../../apps/ai/services/ats.py)
- API wiring: [apps/api/src/services/resume.service.ts](../../apps/api/src/services/resume.service.ts#L86)
- OpenAPI: [apps/api/docs/openapi.yaml](../../apps/api/docs/openapi.yaml)
- Tests:
  - [apps/ai/tests/test_ats.py](../../apps/ai/tests/test_ats.py)
  - [apps/api/src/__tests__/resume.routes.test.ts](../../apps/api/src/__tests__/resume.routes.test.ts)
- Benchmark: [apps/api/scripts/bench-ats.ts](../../apps/api/scripts/bench-ats.ts)
