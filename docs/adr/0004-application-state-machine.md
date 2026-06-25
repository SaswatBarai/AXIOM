# ADR 0004 — Application Tracker State Machine & Analytics

**Status:** Accepted
**Date:** 2026-06-21
**Phase:** 10

## Context

AXIOM needs a job application tracker that allows candidates to track the life-cycle of their job applications (from saving/bookmarking a job, applying, completing online assessments, scheduled interviews, up to receiving offers or rejections).

To ensure high data integrity:
- We must enforce strict transitions between states (e.g. users should not jump directly from `SAVED` to `OFFER_RECEIVED` without an intermediate `APPLIED` or interview stage).
- Every state change needs to be tracked inside a log to display a history timeline.
- We must compute analytics stats (application counts by status, success rate, and average days to interview) efficiently and cache results to minimize database workload.

## Decision

We designed a backend status state machine in `application.service.ts` enforcing transitions, log entries appended to a JSON-typed `timeline` column, and Redis caching.

### 1. Allowed Transitions (State Machine)

The allowed transitions are defined as:
- `SAVED` ➔ `APPLIED`, `WITHDRAWN`, `REJECTED`
- `APPLIED` ➔ `OA_RECEIVED`, `INTERVIEW_SCHEDULED`, `OFFER_RECEIVED`, `REJECTED`, `WITHDRAWN`
- `OA_RECEIVED` ➔ `INTERVIEW_SCHEDULED`, `OFFER_RECEIVED`, `REJECTED`, `WITHDRAWN`
- `INTERVIEW_SCHEDULED` ➔ `OFFER_RECEIVED`, `REJECTED`, `WITHDRAWN`
- `OFFER_RECEIVED` ➔ `WITHDRAWN`, `REJECTED`
- `REJECTED` ➔ `SAVED`, `APPLIED` (Allows recovery if user accidentally rejects)
- `WITHDRAWN` ➔ `SAVED`, `APPLIED` (Allows recovery if user accidentally withdraws)

Any attempt to make an illegal transition (e.g., direct jump from `SAVED` to `INTERVIEW_SCHEDULED` or `OFFER_RECEIVED`) throws an `AppError` with status code `422` (Unprocessable Entity).

### 2. Timeline JSON Logging

Instead of creating a heavy separate relation table for status history, we utilize a PostgreSQL JSON column `timeline` in the `Application` schema.
- Every state transition appends an object: `{ status, at, note }`.
- To prevent unbounded database growth, the array size is capped at `50` entries maximum (`timelineList.slice(-50)`).
- Custom notes and auto-generated transition messages are saved inside the timeline entries.

### 3. Analytics & Redis Caching

To display analytics charts on the dashboard:
- We compute status counts, success rates (offers / non-saved applications), and average time-to-interview (average duration between the first `APPLIED` timestamp and the first `INTERVIEW_SCHEDULED` timestamp).
- Since this runs multiple array scans and date parses, stats results are cached in Redis under `applications:stats:{userId}` with a 5-minute TTL.
- The cache is invalidated instantly (`redis.del`) upon any application creation, update, or deletion.

## Consequences

### Positive
- **Strong Integrity:** Clients cannot submit inconsistent status transitions.
- **Efficient History Logging:** Timeline logging requires no database joins and updates atomically within the application row.
- **Fast Dashboard Load:** Caching minimizes PostgreSQL aggregation times.

### Negative / Trade-offs
- **PostgreSQL JSON querying:** Parsing timestamps from JSON lists is done in the Node service layer. While fast for typical user application counts (<500 apps), massive trackers could benefit from a dedicated history table.

## References
- Service: [application.service.ts](../../apps/api/src/services/application.service.ts)
- Controller: [application.controller.ts](../../apps/api/src/controllers/application.controller.ts)
- Routes: [application.routes.ts](../../apps/api/src/routes/application.routes.ts)
- Tests: [application.service.test.ts](../../apps/api/src/__tests__/application.service.test.ts)
