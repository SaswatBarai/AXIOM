import { prisma } from "@axiom/database";
import type { DiscoveryStatus } from "@axiom/database";
import { logger } from "../utils/logger";
import { matchJobs } from "./ai.service";
import { runScrape } from "./job.service";
import { redis } from "./redis.service";
import { activeJobWhere, isActiveJob } from "../utils/jobFreshness";

const SOURCES = ["internshala", "unstop", "naukri"] as const;

type ParsedProfile = {
  skills?:     { name: string }[];
  experience?: { title?: string; company?: string }[];
  education?:  { field?: string }[];
};

/**
 * Build diverse, career-aware search queries from a parsed resume.
 *
 * Generates queries from experience titles and education field rather than
 * just joining raw skill names. This produces higher-intent scraping results:
 * a "Backend Engineer with Python" profile searches for "Backend Engineer",
 * "Backend Engineer python", and "python" separately rather than a single
 * undirected "python javascript redis postgresql" blob.
 */
// Titles that look like club/org names, not job roles — skip them as search queries.
// Heuristics: contain parentheses (e.g. "Club(Name)"), are ALL CAPS without spaces,
// or embed a date range (Jan. 2024–Present) because the parser picked up the date line.
function _isJobTitle(raw: string): boolean {
  if (/[()（）]/.test(raw)) return false;                   // parentheses → club/org name
  if (/\d{4}/.test(raw)) return false;                      // contains a year → date in title
  if (/[–—-]\s*(present|current)/i.test(raw)) return false; // date range embedded
  if (raw.length > 80) return false;                        // implausibly long
  if (raw === raw.toUpperCase() && !/\s/.test(raw)) return false; // ALLCAPS-no-space acronym
  return true;
}

function buildDiscoveryQueries(parsed: ParsedProfile): string[] {
  const titles = (parsed.experience ?? [])
    .map((e) => e.title?.trim())
    .filter((t): t is string => t !== undefined && t.length > 0 && _isJobTitle(t));

  const skills = (parsed.skills ?? [])
    .map((s) => s.name?.trim())
    .filter((s): s is string => Boolean(s));

  const queries: string[] = [];

  // Primary: most recent job title (highest-signal career direction anchor)
  if (titles[0]) queries.push(titles[0]);

  // Secondary: recent title + top skill (precision query for specific tech roles)
  if (titles[0] && skills[0]) queries.push(`${titles[0]} ${skills[0]}`);

  // Tertiary: top 3 skills joined (technology-specific discovery)
  if (skills.length > 0) queries.push(skills.slice(0, 3).join(" "));

  // Quaternary: second title covers lateral moves and adjacent roles
  if (titles[1] && titles[1] !== titles[0]) queries.push(titles[1]);

  // Quinary: education field catches domain-adjacent roles (e.g. "Computer Science")
  const eduField = parsed.education?.[0]?.field?.trim();
  if (eduField) queries.push(eduField);

  // Deduplicate while preserving priority order; fall back to generic query
  const unique = [...new Set(queries.filter(Boolean))];
  return unique.length > 0 ? unique.slice(0, 5) : ["software engineer"];
}

const DISCOVERY_TIMEOUT_MS = 30 * 60 * 1000; // 30 minutes
/** If SCRAPING with no heartbeat for this long, assume the prior worker died. */
const SCRAPING_ORPHAN_MS = 90 * 1000;
/** Max jobs sent to AI matching per discovery run. */
const MATCH_JOB_CAP = 100;
const STAGE_TTL_SEC = 30 * 60;

function stageKey(resumeId: string): string {
  return `discovery:stage:${resumeId}`;
}

function elapsedMs(since: number): number {
  return Date.now() - since;
}

async function setDiscoveryStage(resumeId: string, stage: string): Promise<void> {
  await redis.set(stageKey(resumeId), stage, STAGE_TTL_SEC);
}

async function heartbeatDiscovery(resumeId: string, stage?: string): Promise<void> {
  if (stage) {
    await setDiscoveryStage(resumeId, stage);
  }
  // Force updatedAt bump even when status is already SCRAPING (Prisma skips @updatedAt otherwise).
  await prisma.jobDiscovery.update({
    where: { resumeId },
    data:  { status: "SCRAPING", updatedAt: new Date() },
  });
}

function logStage(
  resumeId: string,
  stage: string,
  event: "started" | "completed",
  extra?: Record<string, unknown>,
): void {
  logger.info({ resumeId, stage, event, ...extra }, `[discovery] ${stage} ${event}`);
}

/**
 * Ensure a resume has a JobDiscovery record, creating one if needed.
 * Returns the current status and whether jobs already exist.
 *
 * This is the entry point called when a user activates a resume.
 * It never blocks — if discovery is needed, it creates a PENDING record
 * and the caller is responsible for enqueuing the worker.
 */
export async function ensureDiscovery(resumeId: string): Promise<{
  status: DiscoveryStatus;
  existingJobs: boolean;
}> {
  const count = await prisma.jobRecommendation.count({ where: { resumeId } });
  if (count > 0) {
    return { status: "COMPLETED", existingJobs: true };
  }

  const existing = await prisma.jobDiscovery.findUnique({
    where:  { resumeId },
    select: { status: true },
  });

  if (!existing || existing.status === "FAILED") {
    await prisma.jobDiscovery.upsert({
      where:  { resumeId },
      update: { status: "PENDING", error: null },
      create: { resumeId, status: "PENDING" },
    });
    return { status: "PENDING", existingJobs: false };
  }

  // PENDING or SCRAPING — already in progress
  return { status: existing.status, existingJobs: false };
}

/**
 * Run job discovery for a specific resume.
 *
 * @param resumeId - The resume to discover jobs for.
 * @param options.force - Skip the in-progress / already-completed guard.
 *   Pass true only for explicit user-triggered re-runs ("Refresh" button).
 *   Auto-triggered calls (queue, activation) should leave this false so
 *   concurrent invocations for the same resume don't clobber each other.
 */
export async function runJobDiscovery(
  resumeId: string,
  { force = false }: { force?: boolean } = {},
): Promise<void> {
  const resume = await prisma.resume.findUnique({
    where:  { id: resumeId },
    select: { id: true, userId: true, status: true, parsedData: true },
  });

  if (!resume || resume.status !== "COMPLETED") {
    logger.warn({ resumeId }, "Discovery skipped: resume not found or not COMPLETED");
    return;
  }

  // ── In-progress / already-done guard ────────────────────────────────────────
  if (!force) {
    const existing = await prisma.jobDiscovery.findUnique({
      where:  { resumeId },
      select: { status: true, updatedAt: true },
    });

    // Timeout detection: if record is stuck in PENDING/SCRAPING for > 30 min
    if (existing && (existing.status === "PENDING" || existing.status === "SCRAPING")) {
      const stuckMs = Date.now() - existing.updatedAt.getTime();
      if (stuckMs > DISCOVERY_TIMEOUT_MS) {
        logger.warn({ resumeId, status: existing.status, stuckMs }, "Discovery timed out — marking FAILED");
        await prisma.jobDiscovery.update({
          where: { resumeId },
          data:  { status: "FAILED", error: `Discovery timed out after ${Math.round(stuckMs / 1000)}s` },
        });
      } else {
        if (existing.status === "SCRAPING") {
          if (stuckMs < SCRAPING_ORPHAN_MS) {
            logger.warn(
              { resumeId, stuckMs },
              "Discovery already in progress — skipping concurrent call",
            );
            throw new Error("DISCOVERY_IN_PROGRESS");
          }
          logger.warn(
            { resumeId, stuckMs },
            "SCRAPING record has no recent progress — taking over orphaned discovery",
          );
        }
        // PENDING: allow the worker to proceed (it was just enqueued)
      }
    }

    if (existing?.status === "COMPLETED") {
      logger.info({ resumeId }, "Discovery already completed — skipping (pass force=true to re-run)");
      return;
    }
  }

  // ── Mark as in-progress ──────────────────────────────────────────────────────
  await prisma.jobDiscovery.upsert({
    where:  { resumeId },
    update: { status: "SCRAPING", error: null },
    create: { resumeId, status: "SCRAPING" },
  });
  await setDiscoveryStage(resumeId, "search_intents");

  const pipelineStarted = Date.now();
  const scrapedJobIds = new Set<string>();
  logStage(resumeId, "discovery", "started");

  try {
    // ── Build search queries locally (role inference runs later in AI matching) ─
    const intentStarted = Date.now();
    logStage(resumeId, "search_intents", "started");
    await heartbeatDiscovery(resumeId, "search_intents");

    const parsedData = (resume.parsedData as {
      skills?:     { name: string }[];
      experience?: { title?: string; company?: string }[];
      education?:  { field?: string }[];
    } | null) ?? {};

    const queries = buildDiscoveryQueries(parsedData);
    logStage(resumeId, "search_intents", "completed", {
      durationMs: elapsedMs(intentStarted),
      queryCount: queries.length,
      queries,
    });

    // ── Scrape each source × each query (failures are isolated) ──────────────────
    const scrapeTotals: Record<string, { fetched: number; inserted: number; durationMs: number }> = {};

    for (const source of SOURCES) {
      const sourceStarted = Date.now();
      logStage(resumeId, source, "started");
      await heartbeatDiscovery(resumeId, source);

      let sourceFetched = 0;
      let sourceInserted = 0;

      for (const query of queries) {
        const queryStarted = Date.now();
        try {
          const result = await runScrape({ source, query, maxPages: 1, maxJobs: 25 });
          sourceFetched += result.fetched;
          sourceInserted += result.inserted;
          for (const id of result.jobIds) {
            scrapedJobIds.add(id);
          }
          await heartbeatDiscovery(resumeId, source);
          logger.info({
            resumeId,
            source,
            query,
            fetched: result.fetched,
            inserted: result.inserted,
            durationMs: result.durationMs,
            queryDurationMs: elapsedMs(queryStarted),
          }, `[discovery] scrape query completed`);
        } catch (scrapeErr) {
          logger.warn({
            err: scrapeErr,
            resumeId,
            source,
            query,
            durationMs: elapsedMs(queryStarted),
          }, `[discovery] scrape query failed — continuing`);
        }
      }

      const sourceDurationMs = elapsedMs(sourceStarted);
      scrapeTotals[source] = { fetched: sourceFetched, inserted: sourceInserted, durationMs: sourceDurationMs };
      logStage(resumeId, source, "completed", {
        durationMs: sourceDurationMs,
        jobCount: sourceFetched,
        inserted: sourceInserted,
        queryCount: queries.length,
      });
    }

    const normalizationStarted = Date.now();
    logStage(resumeId, "normalization", "started");
    await heartbeatDiscovery(resumeId, "normalization");

    let jobIds = [...scrapedJobIds];
    if (jobIds.length === 0) {
      const recentCutoff = new Date(pipelineStarted);
      const recent = await prisma.job.findMany({
        where: {
          source: { in: [...SOURCES] },
          updatedAt: { gte: recentCutoff },
          ...activeJobWhere(),
        },
        select: { id: true },
        orderBy: { updatedAt: "desc" },
        take: MATCH_JOB_CAP,
      });
      jobIds = recent.map((j) => j.id);
    } else {
      const active = await prisma.job.findMany({
        where: { id: { in: jobIds }, ...activeJobWhere() },
        select: { id: true, title: true, postedAt: true, expiresAt: true },
      });
      jobIds = active.filter((j) => isActiveJob(j)).map((j) => j.id);
      if (jobIds.length > MATCH_JOB_CAP) {
        jobIds = jobIds.slice(0, MATCH_JOB_CAP);
      }
    }

    logStage(resumeId, "normalization", "completed", {
      durationMs: elapsedMs(normalizationStarted),
      jobCount: jobIds.length,
      scrapedCount: scrapedJobIds.size,
    });

    if (jobIds.length === 0) {
      logger.warn({ resumeId, pipelineDurationMs: elapsedMs(pipelineStarted) }, "No jobs in DB after scraping — marking COMPLETED with 0 recommendations");
      await prisma.jobDiscovery.update({
        where: { resumeId },
        data:  { status: "COMPLETED", error: null },
      });
      logStage(resumeId, "discovery", "completed", { durationMs: elapsedMs(pipelineStarted), recommendationCount: 0 });
      return;
    }

    const matchingStarted = Date.now();
    logStage(resumeId, "ai_matching", "started", { jobCount: jobIds.length });
    await heartbeatDiscovery(resumeId, "ai_matching");

    const matches = await matchJobs(resumeId, jobIds);
    if (!matches) {
      throw new Error("AI match service returned null");
    }

    const matchedJobIds = matches.map((m) => m.job_id);
    const activeMatched = await prisma.job.findMany({
      where: { id: { in: matchedJobIds }, ...activeJobWhere() },
      select: { id: true, title: true, postedAt: true, expiresAt: true },
    });
    const activeIdSet = new Set(
      activeMatched.filter((j) => isActiveJob(j)).map((j) => j.id),
    );

    logStage(resumeId, "ai_matching", "completed", {
      durationMs: elapsedMs(matchingStarted),
      matchCount: matches.length,
      activeMatchCount: activeIdSet.size,
    });

    const recommendations = matches
      .filter((m) => activeIdSet.has(m.job_id))
      .map((m) => ({
      resumeId,
      jobId:         m.job_id,
      score:         m.score,
      matchedSkills: m.matched_skills,
      missingSkills: m.missing_skills,
      matchReason:   (m.match_reason as object) ?? undefined,
    }));

    const dbStarted = Date.now();
    logStage(resumeId, "database_save", "started", { recommendationCount: recommendations.length });
    await heartbeatDiscovery(resumeId, "database_save");

    await prisma.$transaction([
      prisma.jobRecommendation.deleteMany({ where: { resumeId } }),
      prisma.jobRecommendation.createMany({ data: recommendations }),
      prisma.jobDiscovery.update({
        where: { resumeId },
        data:  { status: "COMPLETED", error: null },
      }),
    ]);

    logStage(resumeId, "database_save", "completed", {
      durationMs: elapsedMs(dbStarted),
      recommendationCount: recommendations.length,
    });

    logStage(resumeId, "status", "completed", { status: "COMPLETED" });
    await redis.del(stageKey(resumeId));
    logger.info({
      resumeId,
      count: recommendations.length,
      pipelineDurationMs: elapsedMs(pipelineStarted),
      scrapeTotals,
    }, "[discovery] discovery completed");
  } catch (err) {
    const message = (err as Error).message ?? "Unknown discovery error";
    logger.error({
      err,
      resumeId,
      pipelineDurationMs: elapsedMs(pipelineStarted),
    }, `Job discovery failed: ${message}`);
    await prisma.jobDiscovery.update({
      where: { resumeId },
      data:  { status: "FAILED", error: message },
    }).catch((updateErr) => {
      logger.error({ err: updateErr, resumeId }, "Failed to persist discovery failure status");
    });
    await redis.del(stageKey(resumeId));
    return; // don't fall through to auto-activation
  }

  // ── Auto-activate (outside try/catch so it can never flip COMPLETED→FAILED) ──
  // Only activate if the user has no active resume set yet — never override an
  // explicit choice the user has already made.
  try {
    const user = await prisma.user.findUnique({
      where:  { id: resume.userId },
      select: { activeResumeId: true },
    });
    if (!user?.activeResumeId) {
      await prisma.user.update({
        where: { id: resume.userId },
        data:  { activeResumeId: resume.id },
      });
      logger.info({ userId: resume.userId, resumeId }, "Auto-activated: no active resume was set");
    }
  } catch (activateErr) {
    // Non-fatal — discovery already completed; just log and continue
    logger.warn({ err: activateErr, resumeId }, "Auto-activation failed (discovery is still COMPLETED)");
  }
}

export async function getDiscoveryStatus(resumeId: string) {
  const [discovery, stage] = await Promise.all([
    prisma.jobDiscovery.findUnique({ where: { resumeId } }),
    redis.get(stageKey(resumeId)),
  ]);
  if (!discovery) return null;
  return { ...discovery, stage: stage ?? null };
}

/**
 * Periodic check for stuck JobDiscovery records.
 * Marks PENDING / SCRAPING records older than the timeout as FAILED.
 * Designed to be called from a cron / repeatable Bull job.
 */
export async function checkStuckDiscoveries(): Promise<number> {
  const cutoff = new Date(Date.now() - DISCOVERY_TIMEOUT_MS);

  const stuck = await prisma.jobDiscovery.findMany({
    where: {
      status: { in: ["PENDING", "SCRAPING"] },
      updatedAt: { lt: cutoff },
    },
  });

  for (const record of stuck) {
    logger.warn({ resumeId: record.resumeId, status: record.status }, "Marking stuck discovery as FAILED");
    await prisma.jobDiscovery.update({
      where: { id: record.id },
      data:  { status: "FAILED", error: "Discovery timed out after 30 minutes" },
    });
  }

  if (stuck.length > 0) {
    logger.info({ count: stuck.length }, "Stuck discoveries marked FAILED");
  }

  return stuck.length;
}
