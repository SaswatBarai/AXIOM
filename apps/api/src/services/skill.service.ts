import axios from "axios";
import { prisma } from "@axiom/database";
import { AppError } from "../middleware/errorHandler.middleware";
import { logger } from "../utils/logger";
import { requireEnv } from "../utils/env";

const AI_URL    = process.env.AI_SERVICE_URL    ?? "http://localhost:8000";
const AI_SECRET = requireEnv("AI_SERVICE_SECRET");

const aiClient = axios.create({
  baseURL: AI_URL,
  timeout: 15_000,
  headers: { "x-internal-secret": AI_SECRET },
});

export interface TargetRole {
  id: string;
  label: string;
  description: string;
}

export interface GapReport {
  roleId: string;
  roleLabel: string;
  version: string;
  matched: Record<string, string[]>;
  missing: Record<string, string[]>;
  recommendations: Array<{ skill: string; tier: string; tierLabel: string; priority: number }>;
  summary: {
    total: number;
    matchedCount: number;
    missingCount: number;
    readinessPct: number;
    mustHaveGap: number;
    skillsAway: number;
  };
}

export async function getTargetRoles(): Promise<TargetRole[]> {
  const { data } = await aiClient.get<{ roles: TargetRole[] }>("/api/skills/target-roles");
  return data.roles;
}

export async function analyzeSkillGap(
  userId: string,
  resumeId: string,
  roleId: string,
): Promise<GapReport> {
  // Fetch resume + verify ownership
  const resume = await prisma.resume.findUnique({ where: { id: resumeId } });
  if (!resume) throw new AppError(404, "Resume not found");
  if (resume.userId !== userId) throw new AppError(403, "Forbidden");
  if (!resume.parsedData) throw new AppError(422, "Resume has not been parsed yet — try again in a moment");

  // Call AI service (stateless — we send parsed data, not resume ID)
  let report: GapReport;
  try {
    const { data } = await aiClient.post<{ success: boolean; data: GapReport }>("/api/skills/gap", {
      parsed_data: resume.parsedData,
      role_id: roleId,
    });
    report = data.data;
  } catch (err) {
    logger.error(`Skill gap AI call failed: ${(err as Error).message}`);
    throw new AppError(503, "Skill gap service unavailable — try again later");
  }

  // Persist most-recent gap report on the user
  await prisma.user.update({
    where: { id: userId },
    data: { latestGapReport: report as object },
  });

  return report;
}
