-- Phase 16: Analytics — materialized views for nightly aggregation

-- ── Global skill demand (refreshed nightly across all jobs) ──────────────────
CREATE MATERIALIZED VIEW IF NOT EXISTS mv_skill_demand_global AS
SELECT
  skill,
  COUNT(*)::int AS count
FROM (
  SELECT unnest("requiredSkills") AS skill FROM jobs
) sub
GROUP BY skill
ORDER BY count DESC;

CREATE UNIQUE INDEX IF NOT EXISTS mv_skill_demand_global_skill_idx
  ON mv_skill_demand_global (skill);

-- ── Per-user application funnel snapshot (refreshed nightly) ─────────────────
CREATE MATERIALIZED VIEW IF NOT EXISTS mv_user_application_funnel AS
SELECT
  "userId",
  status::text,
  COUNT(*)::int AS count
FROM applications
GROUP BY "userId", status;

CREATE INDEX IF NOT EXISTS mv_user_application_funnel_user_idx
  ON mv_user_application_funnel ("userId");
