# ADR 0006 — Materialized View Refresh Strategy

**Status:** Accepted  
**Date:** 2026-06-21  
**Phase:** 16 (Analytics & Dashboard)

## Context

Phase 16 introduces two PostgreSQL materialized views:

| View | Purpose |
|------|---------|
| `mv_skill_demand_global` | Top skills aggregated across all jobs (used for benchmark comparisons) |
| `mv_user_application_funnel` | Per-user application status counts (fast funnel reads) |

Materialized views are stale by definition — they must be periodically refreshed to reflect new data.

## Decision

**Nightly refresh at midnight UTC via Node.js `setTimeout` scheduler.**

The Express API (`apps/api/src/index.ts`) runs `scheduleNightlyRefresh()` on startup. This function:
1. Calculates milliseconds until the next local midnight.
2. Fires `REFRESH MATERIALIZED VIEW CONCURRENTLY` for both views.
3. Re-schedules itself 24 hours later.

`CONCURRENTLY` is used so reads are never blocked — the unique indexes on both views (`mv_skill_demand_global_skill_idx`, `mv_user_application_funnel_user_idx`) make this possible.

## Consequences

**Good:**
- Zero extra dependencies (no `node-cron`, no BullMQ, no pg_cron).
- No read locks: `CONCURRENTLY` allows queries during refresh.
- Refresh happens automatically as long as the API process is running.

**Bad / Trade-offs:**
- If the API restarts at 23:59, the next refresh fires in ~1 minute instead of 24 hours — acceptable given the analytics use case.
- Multi-instance deployments (e.g. horizontal pod autoscaling) would trigger N refreshes per night. Mitigation: add a distributed lock (Redis `SETNX`) around the refresh call before scaling to >1 replica.
- Stale window: up to 24 hours. For real-time analytics, switch to an event-driven refresh (trigger on `INSERT` into `applications`) — but this is overkill for a job-search tool.

## Alternatives Considered

| Option | Rejected Because |
|--------|-----------------|
| `pg_cron` extension | Requires superuser; not available on managed Postgres (e.g. Neon, Supabase free tier) |
| BullMQ scheduled job | Adds Redis queue overhead; overkill for one nightly task |
| `node-cron` npm package | Extra dependency with no benefit over native `setTimeout` for a single task |
| Manual refresh only | Would never refresh in production without human intervention |
