import { prisma } from "@axiom/database";
import type { Prisma } from "@axiom/database";
import axios from "axios";
import { AppError } from "../middleware/errorHandler.middleware";
import { logger } from "../utils/logger";
import { requireEnv } from "../utils/env";
import type { JobSearchInput, ScrapeRunInput } from "../utils/schemas";
import { matchJobs } from "./ai.service";
import { redis } from "./redis.service";
import { activeJobWhere, isActiveJob, isActiveJobPayload } from "../utils/jobFreshness";

const AI_URL    = process.env.AI_SERVICE_URL    ?? "http://localhost:8000";
const AI_SECRET = requireEnv("AI_SERVICE_SECRET");

const aiClient = axios.create({
  baseURL: AI_URL,
  timeout: 120_000,
  headers: { "x-internal-secret": AI_SECRET },
});

// ── Search ────────────────────────────────────────────────────────────────────

export interface JobSearchResult {
  jobs: Awaited<ReturnType<typeof prisma.job.findMany>>;
  total: number;
  page: number;
  pageSize: number;
  discoveryStatus?: string;
}

export async function searchJobs(input: JobSearchInput, userId?: string): Promise<JobSearchResult> {
  const where = buildWhere(input);

  // Always resolve discovery status when user has an active resume,
  // regardless of sort order. This lets the frontend show the correct
  // banner even when sortBy is not "match".
  let discoveryStatus: string | undefined;
  let targetResumeId: string | undefined;

  if (userId) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { activeResumeId: true },
    });
    targetResumeId = user?.activeResumeId ?? undefined;
    if (targetResumeId) {
      const discovery = await prisma.jobDiscovery.findUnique({
        where: { resumeId: targetResumeId },
      });
      discoveryStatus = discovery?.status;
    }
  }

  if (input.sortBy === "match" && targetResumeId) {
    const recCount = await prisma.jobRecommendation.count({
      where: { resumeId: targetResumeId },
    });

    if (recCount > 0) {
      // Push both the search filter and pagination to DB — avoids fetching all
      // 100 recommendation rows + 100 job rows on every poll tick.
      const jobFilter = input.q
        ? {
            OR: [
              { title:       { contains: input.q, mode: "insensitive" as const } },
              { company:     { contains: input.q, mode: "insensitive" as const } },
              { description: { contains: input.q, mode: "insensitive" as const } },
            ],
          }
        : undefined;

      const recWhere = {
        resumeId: targetResumeId,
        job: {
          ...activeJobWhere(),
          ...(jobFilter ?? {}),
        },
      };
      const skip = (input.page - 1) * input.pageSize;

      const [paginated, total] = await Promise.all([
        prisma.jobRecommendation.findMany({
          where:   recWhere,
          include: { job: true },
          orderBy: { score: "desc" },
          skip,
          take:    input.pageSize,
        }),
        prisma.jobRecommendation.count({ where: recWhere }),
      ]);

      return {
        jobs: paginated
          .map((r) => ({
            ...r.job,
            matchScore:    r.score,
            matchedSkills: r.matchedSkills,
            missingSkills: r.missingSkills,
            matchReason:   r.matchReason ?? null,
          }))
          .filter((j) => isActiveJob(j)) as any,
        total,
        page: input.page,
        pageSize: input.pageSize,
        discoveryStatus,
      };
    }
    // No recommendations yet — fall through to default search
  }

  const skip  = (input.page - 1) * input.pageSize;

  const [jobs, total] = await Promise.all([
    prisma.job.findMany({
      where,
      orderBy: [{ postedAt: "desc" }, { createdAt: "desc" }],
      skip,
      take: input.pageSize,
    }),
    prisma.job.count({ where }),
  ]);

  return { jobs: jobs.filter((j) => isActiveJob(j)) as any, total, page: input.page, pageSize: input.pageSize, discoveryStatus };
}

export async function getJob(id: string) {
  const job = await prisma.job.findUnique({ where: { id } });
  if (!job) throw new AppError(404, "Job not found");
  return job;
}

function buildWhere(input: JobSearchInput): Prisma.JobWhereInput {
  const AND: Prisma.JobWhereInput[] = [activeJobWhere()];

  if (input.q) {
    const q = input.q.trim();
    if (q) {
      AND.push({
        OR: [
          { title:       { contains: q, mode: "insensitive" } },
          { company:     { contains: q, mode: "insensitive" } },
          { description: { contains: q, mode: "insensitive" } },
        ],
      });
    }
  }
  if (input.location) {
    AND.push({ location: { contains: input.location, mode: "insensitive" } });
  }
  if (input.remote !== undefined) {
    AND.push({ remote: input.remote });
  }
  if (input.jobType) {
    AND.push({ jobType: input.jobType });
  }
  if (input.experienceLevel) {
    AND.push({ experienceLevel: input.experienceLevel });
  }
  if (input.source) {
    AND.push({ source: input.source });
  }
  if (input.salaryMin !== undefined) {
    AND.push({ OR: [{ salaryMax: { gte: input.salaryMin } }, { salaryMax: null }] });
  }
  if (input.salaryMax !== undefined) {
    AND.push({ OR: [{ salaryMin: { lte: input.salaryMax } }, { salaryMin: null }] });
  }
  if (input.skills && input.skills.length > 0) {
    // Postgres String[] `hasSome` — matches any
    AND.push({ requiredSkills: { hasSome: input.skills } });
  }

  return AND.length > 0 ? { AND } : {};
}

// ── Save / unsave ─────────────────────────────────────────────────────────────

export async function saveJob(userId: string, jobId: string) {
  const job = await prisma.job.findUnique({ where: { id: jobId } });
  if (!job) throw new AppError(404, "Job not found");

  await prisma.savedJob.upsert({
    where:  { userId_jobId: { userId, jobId } },
    update: {},
    create: { userId, jobId },
  });
  return { message: "Job saved", jobId };
}

export async function unsaveJob(userId: string, jobId: string) {
  await prisma.savedJob.deleteMany({ where: { userId, jobId } });
  return { message: "Job unsaved", jobId };
}

export async function listSavedJobs(userId: string, page = 1, pageSize = 20) {
  const skip = (page - 1) * pageSize;
  const [saved, total] = await Promise.all([
    prisma.savedJob.findMany({
      where: { userId },
      include: { job: true },
      orderBy: { createdAt: "desc" },
      skip,
      take: pageSize,
    }),
    prisma.savedJob.count({ where: { userId } }),
  ]);
  return {
    jobs: saved.map((s) => s.job),
    total,
    page,
    pageSize,
  };
}

// ── Scrape orchestration ─────────────────────────────────────────────────────

interface ScrapeRunResponse {
  summary: {
    source: string;
    fetched: number;
    inserted: number;
    updated: number;
    skipped: number;
    errors: number;
    duration_ms: number;
  };
  jobs: NormalizedJobFromAI[];
}

interface NormalizedJobFromAI {
  title: string;
  company: string;
  company_logo_url?: string | null;
  location: string;
  remote: boolean;
  job_type:         "FULL_TIME" | "PART_TIME" | "CONTRACT" | "INTERNSHIP" | "FREELANCE";
  experience_level: "ENTRY" | "MID" | "SENIOR" | "LEAD" | "EXECUTIVE";
  salary_min?: number | null;
  salary_max?: number | null;
  currency: string;
  description: string;
  required_skills: string[];
  nice_to_have_skills: string[];
  source: string;
  source_url: string;
  posted_at: string;
  expires_at?: string | null;
}

export async function runScrape(input: ScrapeRunInput) {
  const started = Date.now();
  let aiResp: ScrapeRunResponse;

  try {
    const { data } = await aiClient.post<ScrapeRunResponse>("/api/jobs/scrape", {
      source:     input.source,
      query:      input.query,
      max_pages:  input.maxPages,
      max_jobs:   input.maxJobs,
    });
    aiResp = data;
  } catch (err) {
    logger.error(`scrape call failed for ${input.source}: ${(err as Error).message}`);
    throw new AppError(503, "Scraper service unavailable — try again later");
  }

  // Persist — upsert by unique sourceUrl; skip stale listings
  let inserted = 0;
  let updated = 0;
  let skippedStale = 0;
  const jobIds: string[] = [];
  for (const j of aiResp.jobs) {
    if (!isActiveJobPayload(j)) {
      skippedStale++;
      continue;
    }

    const data: Prisma.JobUncheckedCreateInput = {
      title:            j.title,
      company:          j.company,
      companyLogoUrl:   j.company_logo_url ?? null,
      location:         j.location,
      remote:           j.remote,
      jobType:          j.job_type,
      experienceLevel:  j.experience_level,
      salaryMin:        j.salary_min ?? null,
      salaryMax:        j.salary_max ?? null,
      currency:         j.currency,
      description:      j.description,
      requiredSkills:   j.required_skills,
      niceToHaveSkills: j.nice_to_have_skills,
      source:           j.source,
      sourceUrl:        j.source_url,
      postedAt:         new Date(j.posted_at),
      expiresAt:        j.expires_at ? new Date(j.expires_at) : null,
    };

    const result = await prisma.job.upsert({
      where:  { sourceUrl: j.source_url },
      update: data,
      create: data,
    });

    const isNew = result.createdAt.getTime() === result.updatedAt.getTime();
    if (isNew) inserted++;
    else updated++;
    jobIds.push(result.id);
  }

  const durationMs = Date.now() - started;

  if (skippedStale > 0) {
    logger.info(`scrape ${input.source}: skipped_stale=${skippedStale} at persistence layer`);
  }

  if (aiResp.summary.fetched === 0) {
    logger.error(
      `[SCRAPER ALARM] Zero results from source=${input.source} query="${input.query}" — adapter may be broken`,
    );
    await redis.set(`scraper:alarm:${input.source}`, "1", 86_400);
  }

  return {
    source:    input.source,
    fetched:   aiResp.summary.fetched,
    inserted,
    updated,
    skipped:   aiResp.summary.skipped + skippedStale,
    errors:    aiResp.summary.errors,
    durationMs,
    jobIds,
  };
}

async function getActiveOrCreateResumeId(userId: string): Promise<string> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { activeResumeId: true },
  });
  if (user?.activeResumeId) {
    return user.activeResumeId;
  }
  const latest = await prisma.resume.findFirst({
    where: { userId, status: "COMPLETED" },
    orderBy: { version: "desc" },
    select: { id: true },
  });
  if (!latest) {
    throw new AppError(400, "Please upload a resume first");
  }
  return latest.id;
}

export async function getRecommendedJobs(userId: string, limit = 20) {
  const resumeId = await getActiveOrCreateResumeId(userId);

  const cacheKey = `recommended_jobs:${resumeId}:${limit}`;
  const cached = await redis.getJson<any[]>(cacheKey);
  if (cached) {
    logger.info(`Serving cached recommended jobs for resume ${resumeId}`);
    return cached;
  }

  // Check for stored recommendations first — avoids calling AI on every fetch
  const storedRecs = await prisma.jobRecommendation.findMany({
    where: { resumeId, job: activeJobWhere() },
    include: { job: true },
    orderBy: { score: "desc" },
    take: limit,
  });

  if (storedRecs.length > 0) {
    const result = storedRecs
      .map((r) => ({
        ...r.job,
        matchScore: r.score,
        matchedSkills: r.matchedSkills,
        missingSkills: r.missingSkills,
        matchReason: r.matchReason,
      }))
      .filter((j) => isActiveJob(j));
    // Set a short cache so subsequent requests are fast but fresh data can be served
    await redis.setJson(cacheKey, result, 300);
    return result;
  }

  // Exclude jobs the user already applied to or saved
  const existingJobIds = new Set<string>();
  const [existingApps, existingSaved] = await Promise.all([
    prisma.application.findMany({ where: { userId }, select: { jobId: true } }),
    prisma.savedJob.findMany({ where: { userId }, select: { jobId: true } }),
  ]);
  existingApps.forEach((a) => existingJobIds.add(a.jobId));
  existingSaved.forEach((s) => existingJobIds.add(s.jobId));

  const matches = await matchJobs(resumeId);
  if (!matches) {
    throw new AppError(500, "Failed to compute job matches from AI service");
  }

  const topMatches = matches
    .filter((m) => !existingJobIds.has(m.job_id))
    .slice(0, limit);
  const jobIds = topMatches.map((m) => m.job_id);
  const jobs = await prisma.job.findMany({
    where: { id: { in: jobIds } },
  });

  const recommended = topMatches
    .map((match) => {
      const job = jobs.find((j) => j.id === match.job_id);
      if (!job) return null;
      return {
        ...job,
        matchScore: match.score,
        matchedSkills: match.matched_skills,
        missingSkills: match.missing_skills,
      };
    })
    .filter((item) => item !== null);

  await redis.setJson(cacheKey, recommended, 600);
  return recommended;
}

export async function matchSingleJob(userId: string, jobId: string) {
  const resumeId = await getActiveOrCreateResumeId(userId);

  const job = await prisma.job.findUnique({ where: { id: jobId } });
  if (!job) {
    throw new AppError(404, "Job not found");
  }

  // Check if user already applied or saved this job
  const [existingApp, existingSaved] = await Promise.all([
    prisma.application.findUnique({ where: { userId_jobId: { userId, jobId } } }),
    prisma.savedJob.findUnique({ where: { userId_jobId: { userId, jobId } } }),
  ]);
  if (existingApp) {
    throw new AppError(400, "You have already applied to this job");
  }

  const matches = await matchJobs(resumeId, [jobId]);
  if (!matches || matches.length === 0) {
    throw new AppError(500, "Failed to compute job match from AI service");
  }

  const match = matches[0]!;
  return {
    ...job,
    matchScore: match.score,
    matchedSkills: match.matched_skills,
    missingSkills: match.missing_skills,
    alreadySaved: !!existingSaved,
  };
}
