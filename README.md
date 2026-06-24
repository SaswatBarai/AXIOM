# AXIOM — AI Career Copilot

> AI-powered platform for resume analysis, smart job search, skill gap detection, and GenAI career guidance.

## Stack

| Layer | Tech |
|-------|------|
| Monorepo | Turborepo + pnpm workspaces |
| Frontend | Next.js 15, Tailwind v4, Redux, TanStack Query |
| API | Node.js, Express, TypeScript |
| AI/ML | Python, FastAPI, LangChain, Gemini, FAISS |
| Database | PostgreSQL (Prisma 7), Redis |
| Infra | Docker, Kafka, Elasticsearch |

## Quickstart

```bash
# 1. Install dependencies
pnpm install

# 2. Copy env files
cp .env.example apps/api/.env
cp .env.example apps/ai/.env
# Edit each with real values (API keys, DATABASE_URL, JOB_MAX_AGE_DAYS, etc.)

# 3. Start infrastructure
docker compose -f docker/docker-compose.yml up -d

# 4. Run DB migrations
pnpm db:migrate

# 5. Start all apps
pnpm dev
```

Services after startup:
- Frontend → http://localhost:3000
- API → http://localhost:4000
- AI service → http://localhost:8000 (Swagger: /docs)

## Monorepo Structure

```
apps/
  web/    Next.js frontend
  api/    Node.js Express API
  ai/     Python FastAPI AI service
packages/
  database/      Prisma schema + client
  shared-types/  Shared TypeScript types
  ui/            cn() utility (Shadcn lives in apps/web)
  config-typescript/
  config-eslint/
docker/           Infrastructure (PostgreSQL, Redis, Kafka, ES)
```

## Commands

| Command | Description |
|---------|-------------|
| `pnpm dev` | Start all JS apps in parallel |
| `pnpm build` | Build all apps |
| `pnpm lint` | Lint all packages |
| `pnpm typecheck` | Type-check all packages |
| `pnpm db:migrate` | Run Prisma migrations |
| `pnpm db:generate` | Regenerate Prisma client |
| `make -C apps/ai dev` | Start Python AI service |

## ATS Resume Analyzer (Phase 7)

Scores a parsed resume against a job description and persists the result on
`Resume.atsScore`. Pure heuristic — no LLM, fully deterministic.

```
POST /api/resumes/:id/analyze
Authorization: Bearer <jwt>
Content-Type: application/json
{ "jobDescription": "We are hiring a Senior Backend Engineer with ..." }
```

Returns `{ resume: { ..., atsScore: { overall, keywordMatch, completeness,
readability, formatting, strengths, missingSkills, suggestions } } }`.

- **Architecture:** [docs/adr/0001-ats-resume-analyzer.md](docs/adr/0001-ats-resume-analyzer.md)
- **API spec:** [apps/api/docs/openapi.yaml](apps/api/docs/openapi.yaml)
- **Scoring implementation:** [apps/ai/services/ats.py](apps/ai/services/ats.py)
- **Tests:**
  - `cd apps/api && pnpm test` — 50 vitest cases (upload, list, get, delete, analyze with 7 scenarios)
  - `cd apps/ai && make test` — 33 pytest cases on `services/ats.py` (89%) and `services/parser.py` (75%)
- **Benchmark:** `cd apps/api && ACCESS_TOKEN=… RESUME_ID=… pnpm tsx scripts/bench-ats.ts --n=100`
  - Local p50 ≈ 8 ms, p95 ≈ 13 ms, p99 ≈ 16 ms over 80 sequential requests (full stack: Postgres + Redis + Express + FastAPI)

## Job Search + Scraping (Phase 8)

Search across jobs ingested from **Internshala**, **Unstop**, and **Naukri** via a
pluggable scraper framework in [apps/ai/services/scrapers/](apps/ai/services/scrapers/).
LinkedIn and Indeed are out of scope for this phase (no public API, hostile anti-bot)
but can be plugged in later as additional adapters.

```
GET    /api/jobs               # search with filters + pagination
GET    /api/jobs/:id           # single job
GET    /api/jobs/saved         # user's saved jobs
POST   /api/jobs/:id/save      # save
DELETE /api/jobs/:id/save      # unsave
POST   /api/jobs/scrape        # admin-only: trigger a scrape run
```

- **Architecture:** [docs/adr/0002-job-scraping.md](docs/adr/0002-job-scraping.md)
- **Scrapers:** [internshala.py](apps/ai/services/scrapers/internshala.py) · [unstop.py](apps/ai/services/scrapers/unstop.py) · [naukri.py](apps/ai/services/scrapers/naukri.py)
- **Tests:** 33 pytest cases (parsers + skill extraction) + 17 vitest cases (routes); each adapter has a frozen-fixture pytest so CI never hits the network.
- **Politeness:** 1 req / 3 s per host, UA rotation, `Retry-After` honored, `bleach`-sanitized descriptions, upsert dedupe by unique `sourceUrl`.

> **Operator note:** scraping is in a ToS gray area. Run respectfully (default
> rate limits, low concurrency) and revisit with a paid aggregator before any
> commercial launch.

## Job Discovery Pipeline

When a user **activates a resume**, the API enqueues a background discovery job
(Bull queue `job-discovery`). Discovery runs once per resume — it is **not**
triggered by the parse worker, to avoid duplicate concurrent runs.

```
register → upload → parse → activate → discovery → recommendations
```

### Stages

| Stage | Where | What happens |
|-------|--------|----------------|
| `search_intents` | API | Build scrape queries from parsed resume (titles, skills, education) |
| `internshala` / `unstop` / `naukri` | AI scrapers | Scrape each source × query; upsert jobs by `sourceUrl` |
| `normalization` | API | Collect scraped job IDs (capped at 100); skip full-table scan |
| `ai_matching` | AI service | Role inference + batched LLM scoring on scoped jobs only |
| `database_save` | API | Persist `JobRecommendation` rows; mark discovery `COMPLETED` |

Stage timings are logged as `[discovery] <stage> started|completed` in the API
log. The current stage is also exposed via Redis and returned on
`GET /api/resumes/:id/discovery` as `discovery.stage`.

### Endpoints

```
PUT  /api/resumes/:id/activate   # set active resume + enqueue discovery
GET  /api/resumes/:id/discovery  # poll status (PENDING | SCRAPING | COMPLETED | FAILED)
POST /api/resumes/:id/discover   # manual re-run (force=true)
GET  /api/jobs/recommended       # top matched jobs for active resume
GET  /api/jobs?sortBy=match      # search sorted by match score
```

### Reliability

- **Dedup:** Bull job ID `discovery:{resumeId}` prevents duplicate queue entries.
- **Heartbeat:** `updatedAt` is bumped at each stage so orphaned `SCRAPING` rows
  can be taken over after 90 s without progress.
- **Match timeout:** AI match client uses a 300 s timeout (role inference + LLM batches).
- **Stuck checker:** Repeatable cron marks PENDING/SCRAPING records older than 30 min as `FAILED`.

### Verify locally

```bash
# API + AI running; Redis OTP for email verify
strings /tmp/api-service.log | grep '\[discovery\]'
grep -E 'stage5|quality|\[discovery\]\[match\]' /tmp/ai-service.log
```

- **Implementation:** [discovery.service.ts](apps/api/src/services/discovery.service.ts) · [queue.service.ts](apps/api/src/services/queue.service.ts) · [recommendation.py](apps/ai/services/recommendation.py)

## Job Freshness Filtering

Only **active, current** listings are scraped, stored, matched, and shown.
Campaign titles like "Developer Internship 2023" are rejected unless the job
was posted recently.

### Definition of an active job

A job passes **all** of:

1. `expiresAt` is `NULL` **or** `expiresAt > now()`
2. `postedAt` is within the last `JOB_MAX_AGE_DAYS` (default **90**)
3. Title does not contain a year older than `currentYear - 1` (e.g. in 2026,
   reject titles with `2023` or `2024`) **unless** `postedAt` is within the
   max-age window

Unknown `posted_at` values are **not** defaulted to `now()` — they are rejected
at the scraper layer so old listings cannot appear fresh.

### Defense in depth (three layers)

| Layer | Location | Behavior |
|-------|----------|----------|
| **1 — Scraper** | `apps/ai/services/scrapers/freshness.py`, `runner.py` | `is_job_active()` before yield; log `skipped_stale=N` per source |
| **2 — API** | `apps/api/src/utils/jobFreshness.ts`, `job.service.ts` | Skip upsert for stale payloads; `activeJobWhere()` on search, recommendations, discovery |
| **3 — AI matching** | `apps/ai/services/recommendation.py` | SQL `postedAt` / `expiresAt` filters + title check on fetched rows |

### Environment variables

Set in `apps/api/.env` and `apps/ai/.env` (see root [.env.example](.env.example)):

```bash
JOB_MAX_AGE_DAYS=90          # max age of postedAt for a job to be considered active
JOB_STALE_TITLE_REJECT=true  # reject titles with old campaign years (set false to disable)
```

### Maintenance scripts

```bash
# Remove stale jobs and orphaned recommendations from the DB
cd apps/api && npx ts-node -r dotenv/config scripts/prune-stale-jobs.ts
```

### Tests

```bash
cd apps/ai && make test    # includes tests/test_job_freshness.py
cd apps/api && pnpm test   # includes src/__tests__/jobFreshness.test.ts
```

Key cases covered:

- `Developer Internship 2023` with old `postedAt` → rejected
- Expired job (`expiresAt` in the past) → rejected
- Recent job posted today → accepted
- Scrape payload without `posted_at` → rejected at persistence

- **Shared rules (Python):** [freshness.py](apps/ai/services/scrapers/freshness.py)
- **Shared rules (TypeScript):** [jobFreshness.ts](apps/api/src/utils/jobFreshness.ts)

## Development Phases

See [Development.md](Development.md) for the full 18-phase roadmap.
