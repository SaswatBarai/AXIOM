# ADR 0002 — Job ingestion via web scraping

**Status:** Accepted
**Date:** 2026-06-20
**Phase:** 8

## Context

AXIOM needs a corpus of real job listings to power search (Phase 8), semantic
matching (Phase 9), interview-question generation (Phase 14), and the career
copilot (Phase 12). The spec named LinkedIn, Indeed, Naukri, and Internshala
as desired sources.

The reality of those four:

| Source       | API status                                   | Practical access                                 |
|--------------|----------------------------------------------|--------------------------------------------------|
| LinkedIn     | No public Jobs API                           | Paid third-party scrapers (~$30–200/mo)          |
| Indeed       | Publisher API shut down in 2020              | Cloudflare-protected; requires residential proxy |
| Naukri       | No public API                                | Public listings accessible via HTML/JSON         |
| Internshala  | No public API                                | Public listings with JSON-LD embedded            |

Free public-API alternatives (Remotive, Adzuna) cover remote/global tech but
miss the India-focused early-career segment AXIOM is targeting. **Unstop** —
not in the original spec — fills the same niche as Internshala and Naukri
(jobs + internships + hackathons) with a friendly internal JSON endpoint.

## Decision

For Phase 8 we **web-scrape three India-friendly sources**: Internshala, Unstop,
and Naukri. LinkedIn and Indeed are **out of scope** for this phase and may be
added behind a feature flag in a later phase if residential proxies or
authenticated sessions become available.

The scraper framework lives in `apps/ai/services/scrapers/`. Each adapter
implements the same `JobSourceAdapter` protocol, so adding a fourth source
later is a self-contained file plus a fixture-based pytest.

### Architecture

```
[Bull Worker (Phase 17)]
   │ every 6h: POST /api/jobs/scrape  (admin auth, internal-secret upstream)
   ▼
[Express job.service.ts]
   │ axios → AI service
   ▼
[FastAPI /api/jobs/scrape]
   │ run_scrape(adapter, query, max_pages, max_jobs, timeout)
   ▼
[InternshalaAdapter | UnstopAdapter | NaukriAdapter]
   │ ScraperHttpClient (UA rotation + retry + token-bucket rate limit)
   ▼
[parse_detail / parse_listing_entry / parse_listing_html]  ← pure functions
   │ NormalizedJob[]
   ▼
[Express job.service]
   │ prisma.job.upsert by unique sourceUrl
   ▼
[Postgres jobs table]
```

The AI service is **stateless w.r.t. Postgres** — it returns normalized rows;
the API service owns persistence. This keeps the AI service horizontally
scalable and avoids cross-service schema coupling.

### Per-adapter strategy

| Source       | Transport                                    | Parser                                       |
|--------------|----------------------------------------------|----------------------------------------------|
| Internshala  | `httpx` GET                                  | JSON-LD `<script type="application/ld+json">` + HTML fallback for stipend |
| Unstop       | `httpx` GET to internal `search-result` JSON | Direct dict walk; no HTML parse              |
| Naukri       | `httpx` GET (Next.js SSR pages)              | Extract `__NEXT_DATA__` JSON + BFS for job list |

All three are pure-parsable from frozen HTML/JSON fixtures, so unit tests run
without network. If any moves to client-only rendering, swapping the
`httpx.get` call for a Playwright page render is a 5-line change inside the
adapter — the parser stays decoupled.

### Rate-limiting and politeness

- Default **1 request per 3 seconds per host** via a token-bucket limiter.
- Per-host backoff respects `Retry-After` on 429/503.
- `tenacity` retry with exponential backoff on 429 / 5xx / network errors.
- Realistic User-Agent rotation across 3 desktop browser strings.
- HTML sanitized via `bleach` (strip all tags, cap at 16 KB) — descriptions
  may contain user-generated XSS payloads.
- Job upserts dedupe by the unique `sourceUrl` column (already on the Prisma
  `Job` model).

## Consequences

### Positive

- **No vendor lock-in or recurring cost** — scrapers are first-party code.
- **Deterministic tests** — frozen fixtures make CI fast and stable.
- **Skill vocabulary is shared** with the resume parser, so Phase 9 matching
  works without separate taxonomies.
- **Pluggable** — a fourth source (e.g. paid LinkedIn scraper later) drops in
  as a single file + fixture without changing the runner or API layer.

### Negative / trade-offs

- **Fragility.** Sites change HTML layouts every few months. The fixture
  tests can't catch real-site drift — Phase 17 (notifications) will add a
  "zero-result alarm" so we're paged when an adapter silently breaks.
- **ToS gray area.** We don't bypass auth, don't scale aggressively, and
  hold to polite rate limits, but none of these sites *want* to be scraped.
  For a commercial production launch we would need to revisit with a paid
  service. Documented in the README so operators can make an informed call.
- **LinkedIn / Indeed gap.** The two highest-volume Western boards are
  missing. Mitigated by the framework's pluggability — a future RapidAPI or
  JSearch adapter can backfill them.

## Alternatives considered

1. **Remotive + Adzuna (free APIs).** Rejected as primary because they don't
   cover the India-focused early-career segment that drives most of AXIOM's
   target use cases. May be added later as supplementary sources.
2. **Paid aggregators (JSearch, ScraperAPI).** Rejected for v1 — adds
   recurring cost ($30–200/mo) and a runtime external dependency. Pluggable
   architecture means adding one later is a single file.
3. **Hand-curated seed dataset only.** Considered as fallback but rejected
   as primary — the data goes stale immediately and undermines the value of
   matching against real openings.

## References

- Framework: [apps/ai/services/scrapers/](../../apps/ai/services/scrapers/)
- Adapters: [internshala.py](../../apps/ai/services/scrapers/internshala.py) · [unstop.py](../../apps/ai/services/scrapers/unstop.py) · [naukri.py](../../apps/ai/services/scrapers/naukri.py)
- API wiring: [apps/api/src/services/job.service.ts](../../apps/api/src/services/job.service.ts) · [job.routes.ts](../../apps/api/src/routes/job.routes.ts)
- OpenAPI: [apps/api/docs/openapi.yaml](../../apps/api/docs/openapi.yaml)
- Tests:
  - [apps/ai/tests/test_internshala.py](../../apps/ai/tests/test_internshala.py)
  - [apps/ai/tests/test_unstop.py](../../apps/ai/tests/test_unstop.py)
  - [apps/ai/tests/test_naukri.py](../../apps/ai/tests/test_naukri.py)
  - [apps/api/src/__tests__/job.routes.test.ts](../../apps/api/src/__tests__/job.routes.test.ts)
