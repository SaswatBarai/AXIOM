import Bull from "bull";
import { prisma } from "@axiom/database";
import { sendEmail } from "./email.service";
import { createNotification, type AlertFilters } from "./notification.service";
import { logger } from "../utils/logger";
import { getPresignedUrl, keyFromUrl } from "./s3.service";
import { parseResume as aiParseResume } from "./ai.service";
import { runJobDiscovery, checkStuckDiscoveries } from "./discovery.service";

const REDIS_URL = process.env["REDIS_URL"] ?? "redis://localhost:6379";

const QUEUE_OPTS: Bull.QueueOptions = {
  redis:            REDIS_URL as string,
  defaultJobOptions: {
    attempts:    3,
    backoff:     { type: "exponential", delay: 2000 },
    removeOnComplete: 100,
    removeOnFail:     50,
  },
};

// ── Queues ────────────────────────────────────────────────────────────────────

export const emailQueue        = new Bull("email",        QUEUE_OPTS);
export const notificationQueue = new Bull("notification", QUEUE_OPTS);
export const digestQueue       = new Bull("digest",       QUEUE_OPTS);
export const resumeParsingQueue = new Bull("resume-parsing", QUEUE_OPTS);
export const jobDiscoveryQueue  = new Bull("job-discovery",  QUEUE_OPTS);

// ── Frequency caps ─────────────────────────────────────────────────────────────
// Stored in Redis: "freq:alert:{userId}" → count, TTL = end of day
// "freq:digest:{userId}" → count, TTL = end of day

// ── Email worker ──────────────────────────────────────────────────────────────

emailQueue.process(async (job) => {
  const { to, template, data } = job.data as { to: string; template: string; data: Record<string, string | number> };
  await sendEmail({ to, template, data });
  logger.info(`Email sent: template=${template} to=${to}`);
});

emailQueue.on("failed", (job, err) => {
  logger.error(`Email job ${job.id} failed (attempt ${job.attemptsMade}): ${err.message}`);
  if (job.attemptsMade >= (job.opts.attempts ?? 3)) {
    logger.error(`DLQ: email job ${job.id} exhausted retries. Data: ${JSON.stringify(job.data)}`);
  }
});

// ── Notification worker ───────────────────────────────────────────────────────

notificationQueue.process(async (job) => {
  const { userId, type, payload } = job.data as { userId: string; type: string; payload: Record<string, unknown> };
  await createNotification(userId, type, payload);
});

notificationQueue.on("failed", (job, err) => {
  logger.error(`Notification job ${job.id} failed: ${err.message}`);
});

// ── Digest worker ─────────────────────────────────────────────────────────────

digestQueue.process(async (job) => {
  const { userId, email, name, stats } = job.data as {
    userId: string; email: string; name: string;
    stats: { applications: number; interviews: number; newJobs: number };
  };
  const week = new Date().toLocaleDateString("en-US", { month: "short", day: "numeric" });
  await emailQueue.add({
    to:       email,
    template: "weekly-digest",
    data:     {
      name,
      week,
      applications:    stats.applications,
      interviews:      stats.interviews,
      newJobs:         stats.newJobs,
      url:             `${process.env["FRONTEND_URL"] ?? "http://localhost:3000"}/dashboard`,
      unsubscribeUrl:  `${process.env["FRONTEND_URL"] ?? "http://localhost:3000"}/dashboard/settings`,
    },
  });
  // Also create in-app notification
  await notificationQueue.add({ userId, type: "WEEKLY_DIGEST", payload: stats });
});

digestQueue.on("failed", (job, err) => {
  logger.error(`Digest job ${job.id} failed: ${err.message}`);
});

// ── Weekly digest cron (every Monday at 09:00) ────────────────────────────────

export async function scheduleWeeklyDigest(): Promise<void> {
  // Remove existing repeatable jobs to avoid duplicates on restart
  const repeatables = await digestQueue.getRepeatableJobs();
  for (const r of repeatables) {
    if (r.name === "weekly-digest-trigger") {
      await digestQueue.removeRepeatableByKey(r.key);
    }
  }
  // Sentinel job — actual per-user digest jobs are enqueued by the digest trigger
  await digestQueue.add(
    "weekly-digest-trigger",
    { trigger: true },
    { repeat: { cron: "0 9 * * 1" } },  // Every Monday 09:00
  );
  logger.info("Weekly digest cron scheduled: every Monday 09:00");
}

// ── Enqueue helpers ───────────────────────────────────────────────────────────

export async function enqueueEmail(opts: {
  to: string; template: string; data: Record<string, string | number>;
}): Promise<void> {
  await emailQueue.add(opts);
}

export async function enqueueNotification(opts: {
  userId: string; type: string; payload: Record<string, unknown>;
}): Promise<void> {
  await notificationQueue.add(opts);
}

// ── Dispatch job alerts (called after job ingestion) ──────────────────────────
// Lives here to avoid a circular import: notification.service ↔ queue.service

export async function dispatchJobAlerts(jobId: string, jobTitle: string, jobLocation: string) {
  const alerts = await prisma.jobAlert.findMany({
    where:   { active: true },
    include: { user: { select: { id: true, email: true, name: true } } },
  });

  const now = new Date();
  for (const alert of alerts) {
    const filters = alert.filters as AlertFilters;
    if (filters.keywords) {
      const kw = filters.keywords.toLowerCase();
      if (!jobTitle.toLowerCase().includes(kw) && !jobLocation.toLowerCase().includes(kw)) continue;
    }
    await prisma.$transaction(async (tx) => {
      const current = await tx.jobAlert.findUnique({ where: { id: alert.id } });
      if (!current) return;
      if (current.frequency === "daily" && current.lastSentAt) {
        if (current.lastSentAt.toDateString() === now.toDateString()) return;
      }
      await enqueueEmail({
        to:       alert.user.email,
        template: "job-alert",
        data: {
          name:           alert.user.name ?? "there",
          alertName:      alert.name,
          count:          1,
          url:            `${process.env["FRONTEND_URL"] ?? "http://localhost:3000"}/dashboard/jobs`,
          unsubscribeUrl: `${process.env["FRONTEND_URL"] ?? "http://localhost:3000"}/dashboard/settings`,
        },
      });
      await enqueueNotification({
        userId:  alert.user.id,
        type:    "JOB_ALERT",
        payload: { jobId, jobTitle, alertId: alert.id, alertName: alert.name },
      });
      await tx.jobAlert.update({ where: { id: alert.id }, data: { lastSentAt: now } });
    });
  }
}

// ── Resume Parsing worker ─────────────────────────────────────────────────────

resumeParsingQueue.process(async (job) => {
  const { resumeId } = job.data as { resumeId: string };
  const resume = await prisma.resume.findUnique({
    where: { id: resumeId },
  });

  if (!resume) {
    logger.error({ resumeId }, "Parsing job failed: resume not found in database");
    return;
  }

  await prisma.resume.update({
    where: { id: resumeId },
    data:  { status: "PARSING" },
  });

  try {
    const presignedUrl = await getPresignedUrl(keyFromUrl(resume.fileUrl), 3600);
    const parsed = await aiParseResume(presignedUrl, resume.fileType);

    if (!parsed) {
      // AI returned a 200 but empty data — surface it clearly and let Bull retry
      throw new Error("AI service returned empty parsed data");
    }

    await prisma.resume.update({
      where: { id: resumeId },
      data:  { status: "COMPLETED", parsedData: parsed as object },
    });

    logger.info({ resumeId }, "Resume parsing completed successfully");
    // Discovery is enqueued on resume activation — not here — to avoid duplicate runs.
  } catch (err) {
    const message = (err as Error).message ?? "Unknown parse error";
    logger.error({ err, resumeId }, `Resume parse job failed: ${message}`);
    await prisma.resume.update({
      where: { id: resumeId },
      data:  { status: "FAILED", parsingError: message },
    });
    // Re-throw so Bull marks this attempt as failed and applies backoff/retries
    throw err;
  }
});

resumeParsingQueue.on("failed", (job, err) => {
  logger.error(`Resume parsing job ${job.id} failed: ${err.message}`);
});

// ── Job Discovery worker ──────────────────────────────────────────────────────

jobDiscoveryQueue.process(async (job) => {
  const { resumeId } = job.data as { resumeId: string };
  try {
    await runJobDiscovery(resumeId);
  } catch (err) {
    // Retry when another worker is already running this resume's discovery.
    if ((err as Error).message === "DISCOVERY_IN_PROGRESS") {
      throw err;
    }
    // runJobDiscovery handles FAILED status internally; don't exhaust Bull retries.
  }
});

jobDiscoveryQueue.on("failed", (job, err) => {
  logger.error(`Job discovery job ${job.id} failed (attempt ${job.attemptsMade}): ${err.message}`);
});

// ── Stuck Discovery checker (repeatable every 5 minutes) ────────────────────

const discoveryTimeoutQueue = new Bull("discovery-timeout", QUEUE_OPTS);

discoveryTimeoutQueue.process(async () => {
  const count = await checkStuckDiscoveries();
  if (count > 0) {
    logger.info({ count }, "Stuck discovery timeout check completed");
  }
});

export async function scheduleDiscoveryTimeoutCheck(): Promise<void> {
  const repeatables = await discoveryTimeoutQueue.getRepeatableJobs();
  for (const r of repeatables) {
    if (r.name === "discovery-timeout-trigger") {
      await discoveryTimeoutQueue.removeRepeatableByKey(r.key);
    }
  }
  await discoveryTimeoutQueue.add(
    "discovery-timeout-trigger",
    { trigger: true },
    { repeat: { cron: "*/5 * * * *" } },  // Every 5 minutes
  );
  logger.info("Discovery timeout checker scheduled: every 5 minutes");
}
