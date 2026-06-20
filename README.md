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
# Edit each with real values

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

## Development Phases

See [Development.md](Development.md) for the full 18-phase roadmap.
