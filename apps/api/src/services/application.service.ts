import { prisma } from "@axiom/database";
import { AppError } from "../middleware/errorHandler.middleware";
import { logger } from "../utils/logger";
import { redis } from "./redis.service";
import type { ApplicationStatus } from "@axiom/database";

const ALLOWED_TRANSITIONS: Record<ApplicationStatus, ApplicationStatus[]> = {
  SAVED: ["APPLIED", "WITHDRAWN", "REJECTED"],
  APPLIED: ["OA_RECEIVED", "INTERVIEW_SCHEDULED", "OFFER_RECEIVED", "REJECTED", "WITHDRAWN"],
  OA_RECEIVED: ["INTERVIEW_SCHEDULED", "OFFER_RECEIVED", "REJECTED", "WITHDRAWN"],
  INTERVIEW_SCHEDULED: ["OFFER_RECEIVED", "REJECTED", "WITHDRAWN"],
  OFFER_RECEIVED: ["WITHDRAWN", "REJECTED"],
  REJECTED: ["SAVED", "APPLIED"],
  WITHDRAWN: ["SAVED", "APPLIED"],
};

export async function createApplication(
  userId: string,
  jobId: string,
  status: ApplicationStatus = "SAVED",
  note?: string
) {
  // Check if job exists
  const job = await prisma.job.findUnique({ where: { id: jobId } });
  if (!job) {
    throw new AppError(404, "Job not found");
  }

  // Check if already exists
  const existing = await prisma.application.findUnique({
    where: { userId_jobId: { userId, jobId } },
  });
  if (existing) {
    throw new AppError(400, "Application for this job already exists");
  }

  const now = new Date();
  const timelineEntry = {
    status,
    at: now.toISOString(),
    note: note || `Application created in ${status.toLowerCase()} status`,
  };

  const app = await prisma.application.create({
    data: {
      userId,
      jobId,
      status,
      appliedAt: status === "APPLIED" ? now : null,
      timeline: JSON.stringify([timelineEntry]),
    },
    include: { job: true },
  });

  // Invalidate stats cache
  await redis.del(`applications:stats:${userId}`);

  return app;
}

export async function listApplications(
  userId: string,
  status?: ApplicationStatus,
  dateFrom?: string,
  dateTo?: string
) {
  const where: any = { userId };

  if (status) {
    where.status = status;
  }

  if (dateFrom || dateTo) {
    where.createdAt = {};
    if (dateFrom) where.createdAt.gte = new Date(dateFrom);
    if (dateTo) where.createdAt.lte = new Date(dateTo);
  }

  return prisma.application.findMany({
    where,
    include: { job: true },
    orderBy: { updatedAt: "desc" },
  });
}

export async function getApplication(id: string, userId: string) {
  const app = await prisma.application.findUnique({
    where: { id },
    include: { job: true },
  });

  if (!app) {
    throw new AppError(404, "Application not found");
  }

  if (app.userId !== userId) {
    throw new AppError(403, "Forbidden");
  }

  return app;
}

export async function updateApplication(
  id: string,
  userId: string,
  data: {
    status?: ApplicationStatus;
    notes?: string;
    coverLetter?: string;
    note?: string;
  }
) {
  const app = await prisma.application.findUnique({
    where: { id },
  });

  if (!app) {
    throw new AppError(404, "Application not found");
  }

  if (app.userId !== userId) {
    throw new AppError(403, "Forbidden");
  }

  const updateData: any = {};
  if (data.notes !== undefined) updateData.notes = data.notes;
  if (data.coverLetter !== undefined) updateData.coverLetter = data.coverLetter;

  if (data.status !== undefined && data.status !== app.status) {
    const fromStatus = app.status;
    const toStatus = data.status;

    // Enforce transition limits
    const allowed = ALLOWED_TRANSITIONS[fromStatus] || [];
    if (!allowed.includes(toStatus)) {
      throw new AppError(
        422,
        `Invalid status transition from ${fromStatus} to ${toStatus}`
      );
    }

    updateData.status = toStatus;
    if (toStatus === "APPLIED" && !app.appliedAt) {
      updateData.appliedAt = new Date();
    }

    // Parse existing timeline
    let timelineList: any[] = [];
    try {
      timelineList = JSON.parse(app.timeline as string) || [];
      if (!Array.isArray(timelineList)) {
        timelineList = [];
      }
    } catch {
      timelineList = [];
    }

    // Append new transition entry
    timelineList.push({
      status: toStatus,
      at: new Date().toISOString(),
      note: data.note || `Status updated from ${fromStatus.toLowerCase()} to ${toStatus.toLowerCase()}`,
    });

    // Cap size at 50
    if (timelineList.length > 50) {
      timelineList = timelineList.slice(-50);
    }

    updateData.timeline = JSON.stringify(timelineList);
  }

  const updatedApp = await prisma.application.update({
    where: { id },
    data: updateData,
    include: { job: true },
  });

  // Invalidate stats cache
  await redis.del(`applications:stats:${userId}`);

  return updatedApp;
}

export async function deleteApplication(id: string, userId: string) {
  const app = await prisma.application.findUnique({
    where: { id },
  });

  if (!app) {
    throw new AppError(404, "Application not found");
  }

  if (app.userId !== userId) {
    throw new AppError(403, "Forbidden");
  }

  await prisma.application.delete({ where: { id } });

  // Invalidate stats cache
  await redis.del(`applications:stats:${userId}`);

  return { message: "Application deleted successfully", id };
}

export async function getStats(userId: string) {
  const cacheKey = `applications:stats:${userId}`;
  const cached = await redis.getJson<any>(cacheKey);
  if (cached) {
    return cached;
  }

  const apps = await prisma.application.findMany({
    where: { userId },
  });

  // Counts per status
  const counts: Record<ApplicationStatus, number> = {
    SAVED: 0,
    APPLIED: 0,
    OA_RECEIVED: 0,
    INTERVIEW_SCHEDULED: 0,
    OFFER_RECEIVED: 0,
    REJECTED: 0,
    WITHDRAWN: 0,
  };

  apps.forEach((app) => {
    counts[app.status] = (counts[app.status] || 0) + 1;
  });

  // Success rate: percentage of non-saved applications that reached OFFER_RECEIVED
  const nonSavedCount = apps.filter((app) => app.status !== "SAVED").length;
  const offerCount = counts.OFFER_RECEIVED;
  const successRate = nonSavedCount > 0 ? (offerCount / nonSavedCount) * 100 : 0;

  // Average time to interview
  let totalTimeMs = 0;
  let interviewCount = 0;

  apps.forEach((app) => {
    let timelineList: any[] = [];
    try {
      timelineList = JSON.parse(app.timeline as string) || [];
    } catch {
      timelineList = [];
    }

    if (Array.isArray(timelineList)) {
      const appliedEntry = timelineList.find((entry) => entry.status === "APPLIED");
      const interviewEntry = timelineList.find((entry) => entry.status === "INTERVIEW_SCHEDULED");

      if (appliedEntry && interviewEntry) {
        const appliedTime = new Date(appliedEntry.at).getTime();
        const interviewTime = new Date(interviewEntry.at).getTime();
        if (interviewTime > appliedTime) {
          totalTimeMs += interviewTime - appliedTime;
          interviewCount++;
        }
      }
    }
  });

  const avgTimeToInterviewDays =
    interviewCount > 0
      ? totalTimeMs / (1000 * 60 * 60 * 24 * interviewCount)
      : 0;

  const stats = {
    counts,
    successRate: Math.round(successRate * 10) / 10,
    avgTimeToInterviewDays: Math.round(avgTimeToInterviewDays * 10) / 10,
  };

  // Cache for 5 minutes
  await redis.setJson(cacheKey, stats, 300);

  return stats;
}
