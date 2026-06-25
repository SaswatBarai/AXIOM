import { prisma } from "@axiom/database";
import { redis } from "./redis.service";
import axios from "axios";
import { AppError } from "../middleware/errorHandler.middleware";
import { requireEnv } from "../utils/env";

const AI_URL    = process.env.AI_SERVICE_URL    ?? "http://localhost:8000";
const AI_SECRET = requireEnv("AI_SERVICE_SECRET");

const aiClient = axios.create({
  baseURL: AI_URL,
  headers: { "x-internal-secret": AI_SECRET },
});

export interface RoadmapStep {
  week:            number;
  skill:           string;
  tier:            string;
  resources:       string[];
  estimated_hours: number;
}

// ── Generation ────────────────────────────────────────────────────────────────

export async function generateRoadmap(
  userId:     string,
  targetRole: string,
  gapReport:  Record<string, unknown>,
  weeks:      number,
): Promise<{ roadmap: object; isNew: boolean }> {
  const cacheKey = `roadmap:${userId}:${targetRole}:${weeks}`;
  const cached   = await redis.get(cacheKey);

  let steps: RoadmapStep[];
  if (cached) {
    steps = JSON.parse(cached) as RoadmapStep[];
  } else {
    const resp = await aiClient.post<{ steps: RoadmapStep[] }>("/api/roadmap/generate", {
      target_role: targetRole,
      gap_report:  gapReport,
      weeks,
    });
    steps = resp.data.steps;
    await redis.set(cacheKey, JSON.stringify(steps), 3600);
  }

  const roadmap = await prisma.$transaction(async (tx) => {
    const latest = await tx.careerRoadmap.findFirst({
      where:   { userId, targetRole },
      orderBy: { version: "desc" },
      select:  { version: true },
    });
    const nextVersion = (latest?.version ?? 0) + 1;

    return tx.careerRoadmap.create({
      data: {
        userId,
        title:      `${targetRole} — ${weeks}-week roadmap`,
        targetRole,
        weeks,
        version:    nextVersion,
        content:    steps as object,
        progress:   {},
      },
    });
  });

  return { roadmap, isNew: true };
}

// ── List ──────────────────────────────────────────────────────────────────────

export async function listRoadmaps(userId: string) {
  const roadmaps = await prisma.careerRoadmap.findMany({
    where:   { userId },
    orderBy: { createdAt: "desc" },
    select: {
      id: true, title: true, targetRole: true,
      weeks: true, version: true, createdAt: true,
      progress: true, content: true,
    },
  });
  return roadmaps.map((r) => {
    const steps   = (r.content as unknown as RoadmapStep[]) ?? [];
    const progress = (r.progress as unknown as Record<string, boolean>) ?? {};
    const done    = steps.filter((s) => progress[String(s.week)]).length;
    return {
      ...r,
      content:  undefined,
      progress: undefined,
      stepCount:  steps.length,
      doneCount:  done,
      pct:        steps.length > 0 ? Math.round((done / steps.length) * 100) : 0,
    };
  });
}

// ── Get ───────────────────────────────────────────────────────────────────────

export async function getRoadmap(userId: string, roadmapId: string) {
  const roadmap = await prisma.careerRoadmap.findUnique({ where: { id: roadmapId } });
  if (!roadmap || roadmap.userId !== userId) throw new AppError(404, "Roadmap not found");
  return roadmap;
}

// ── Mark step ─────────────────────────────────────────────────────────────────

export async function markStep(
  userId:    string,
  roadmapId: string,
  week:      number,
  done:      boolean,
): Promise<object> {
  const roadmap = await prisma.careerRoadmap.findUnique({ where: { id: roadmapId } });
  if (!roadmap || roadmap.userId !== userId) throw new AppError(404, "Roadmap not found");

  const progress = (roadmap.progress as Record<string, boolean>) ?? {};
  if (done) {
    progress[String(week)] = true;
  } else {
    delete progress[String(week)];
  }

  const updated = await prisma.careerRoadmap.update({
    where: { id: roadmapId },
    data:  { progress },
  });

  const steps = (updated.content as unknown as RoadmapStep[]) ?? [];
  const total = steps.length;
  const completedWeeks = steps.filter((s) => progress[String(s.week)]).length;
  return {
    progress,
    stats: {
      completedWeeks,
      totalWeeks: total,
      pct:        total > 0 ? Math.round((completedWeeks / total) * 100) : 0,
      etaWeeks:   total - completedWeeks,
    },
  };
}

// ── Delete ────────────────────────────────────────────────────────────────────

export async function deleteRoadmap(userId: string, roadmapId: string): Promise<void> {
  const roadmap = await prisma.careerRoadmap.findUnique({ where: { id: roadmapId } });
  if (!roadmap || roadmap.userId !== userId) throw new AppError(404, "Roadmap not found");
  await prisma.careerRoadmap.delete({ where: { id: roadmapId } });
}
