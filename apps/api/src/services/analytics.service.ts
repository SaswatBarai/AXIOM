import { prisma, Prisma } from "@axiom/database";
import { redis } from "./redis.service";

const OVERVIEW_TTL     = 60 * 15;      // 15 min per-user
const SKILL_DEMAND_TTL = 60 * 60;      // 1 h global

// ── Types ─────────────────────────────────────────────────────────────────────

export interface OverviewData {
  totalApplications: number;
  interviews:        number;
  offers:            number;
  successRate:       number;
  avgAtsScore:       number | null;
  savedJobs:         number;
  roadmaps:          number;
}

export interface AtsTrendPoint {
  version: number;
  score:   number;
  date:    string;
}

export interface MonthlyPoint {
  month:       string;
  applied:     number;
  interviewed: number;
  offered:     number;
}

export interface SkillDemandPoint {
  skill: string;
  count: number;
}

export interface FunnelStage {
  stage: string;
  count: number;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function dateWhere(days: number) {
  if (days === 0) return {};
  const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
  return { createdAt: { gte: since } };
}

const FUNNEL_ORDER: Record<string, number> = {
  SAVED: 0, APPLIED: 1, OA_RECEIVED: 2,
  INTERVIEW_SCHEDULED: 3, OFFER_RECEIVED: 4, REJECTED: 5, WITHDRAWN: 6,
};

// ── Overview ──────────────────────────────────────────────────────────────────

export async function getOverview(
  userId: string,
  days:   number,
): Promise<OverviewData> {
  const cacheKey = `analytics:overview:${userId}:${days}`;
  const cached   = await redis.get(cacheKey);
  if (cached) { const v = JSON.parse(cached); if (!isRecord(v)) throw new Error("Invalid cache: overview"); return v as unknown as OverviewData; }

  const where = { userId, ...dateWhere(days) };

  const [total, interviews, offers, savedJobs, roadmaps, resumes] = await Promise.all([
    prisma.application.count({ where }),
    prisma.application.count({ where: { ...where, status: "INTERVIEW_SCHEDULED" } }),
    prisma.application.count({ where: { ...where, status: "OFFER_RECEIVED" } }),
    prisma.savedJob.count({ where: { userId } }),
    prisma.careerRoadmap.count({ where: { userId } }),
    prisma.resume.findMany({
      where:  { userId, atsScore: { not: Prisma.JsonNull } },
      select: { atsScore: true },
    }),
  ]);

  const applied      = await prisma.application.count({ where: { ...where, status: { not: "SAVED" } } });
  const successRate  = applied > 0 ? Math.round((offers / applied) * 100 * 10) / 10 : 0;
  const atsScores    = resumes
    .map((r) => (r.atsScore as Record<string, number> | null)?.overall)
    .filter((s): s is number => typeof s === "number");
  const avgAtsScore  = atsScores.length > 0
    ? Math.round(atsScores.reduce((a, b) => a + b, 0) / atsScores.length)
    : null;

  const data: OverviewData = { totalApplications: total, interviews, offers, successRate, avgAtsScore, savedJobs, roadmaps };
  await redis.set(cacheKey, JSON.stringify(data), OVERVIEW_TTL);
  return data;
}

// ── ATS trend ─────────────────────────────────────────────────────────────────

export async function getAtsTrend(userId: string): Promise<AtsTrendPoint[]> {
  type Row = { version: number; score: number; date: Date };
  const rows = await prisma.$queryRaw<Row[]>`
    SELECT
      version,
      ("atsScore"->>'overall')::int AS score,
      "createdAt"                   AS date
    FROM resumes
    WHERE "userId" = ${userId}
      AND "atsScore" IS NOT NULL
    ORDER BY version ASC
  `;
  return rows.map((r) => ({
    version: r.version,
    score:   r.score,
    date:    new Date(r.date).toISOString().slice(0, 10),
  }));
}

// ── Monthly applications ──────────────────────────────────────────────────────

export async function getApplicationsMonthly(
  userId: string,
  days:   number,
): Promise<MonthlyPoint[]> {
  const dateFilter = days > 0
    ? Prisma.sql`AND "appliedAt" > NOW() - INTERVAL '1 day' * ${days}`
    : Prisma.sql``;

  type Row = { month: string; applied: bigint; interviewed: bigint; offered: bigint };
  const rows = await prisma.$queryRaw<Row[]>`
    SELECT
      TO_CHAR("appliedAt", 'YYYY-MM')                                                              AS month,
      COUNT(*)::bigint                                                                               AS applied,
      COUNT(*) FILTER (WHERE status IN ('INTERVIEW_SCHEDULED', 'OFFER_RECEIVED'))::bigint           AS interviewed,
      COUNT(*) FILTER (WHERE status = 'OFFER_RECEIVED')::bigint                                     AS offered
    FROM applications
    WHERE "userId" = ${userId}
      AND "appliedAt" IS NOT NULL
      ${dateFilter}
    GROUP BY month
    ORDER BY month ASC
  `;
  return rows.map((r) => ({
    month:       r.month,
    applied:     Number(r.applied),
    interviewed: Number(r.interviewed),
    offered:     Number(r.offered),
  }));
}

// ── Skills demand ─────────────────────────────────────────────────────────────

export async function getSkillsDemand(userId: string): Promise<SkillDemandPoint[]> {
  const cacheKey = `analytics:skills:global`;
  const cached   = await redis.get(cacheKey);
  if (cached) { const v = JSON.parse(cached); if (!Array.isArray(v)) throw new Error("Invalid cache: skills demand"); return v as unknown as SkillDemandPoint[]; }

  type Row = { skill: string; count: bigint };
  const rows = await prisma.$queryRaw<Row[]>`
    SELECT skill, COUNT(*)::bigint AS count
    FROM (
      SELECT unnest(j."requiredSkills") AS skill
      FROM jobs j
      WHERE j.id IN (
        SELECT "jobId" FROM applications WHERE "userId" = ${userId}
        UNION
        SELECT "jobId" FROM saved_jobs   WHERE "userId" = ${userId}
      )
    ) sub
    GROUP BY skill
    ORDER BY count DESC
    LIMIT 20
  `;
  const result = rows.map((r) => ({ skill: r.skill, count: Number(r.count) }));
  await redis.set(cacheKey, JSON.stringify(result), SKILL_DEMAND_TTL);
  return result;
}

// ── Application funnel ────────────────────────────────────────────────────────

export async function getApplicationFunnel(userId: string): Promise<FunnelStage[]> {
  const groups = await prisma.application.groupBy({
    by:    ["status"],
    where: { userId },
    _count: { status: true },
  });

  return groups
    .map((g) => ({ stage: g.status as string, count: g._count.status }))
    .sort((a, b) => (FUNNEL_ORDER[a.stage] ?? 99) - (FUNNEL_ORDER[b.stage] ?? 99));
}

// ── Materialized view refresh (called nightly) ────────────────────────────────

export async function refreshMaterializedViews(): Promise<void> {
  await prisma.$executeRaw`REFRESH MATERIALIZED VIEW CONCURRENTLY mv_skill_demand_global`;
  await prisma.$executeRaw`REFRESH MATERIALIZED VIEW CONCURRENTLY mv_user_application_funnel`;
}
