import Bull from "bull";
import { prisma } from "@axiom/database";
import { sendEmail } from "./email.service";
import { createNotification, type AlertFilters } from "./notification.service";
import { logger } from "../utils/logger";

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
    if (alert.frequency === "daily" && alert.lastSentAt) {
      if (alert.lastSentAt.toDateString() === now.toDateString()) continue;
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
    await prisma.jobAlert.update({ where: { id: alert.id }, data: { lastSentAt: now } });
  }
}
