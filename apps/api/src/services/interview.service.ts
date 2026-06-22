import axios from "axios";
import { prisma } from "@axiom/database";
import { redis } from "./redis.service";
import { AppError } from "../middleware/errorHandler.middleware";
import { logger } from "../utils/logger";

const AI_URL    = process.env.AI_SERVICE_URL    ?? "http://localhost:8000";
const AI_SECRET = process.env.AI_SERVICE_SECRET ?? "internal-secret";
const CACHE_TTL = 3_600; // 1h — questions are deterministic per (title+difficulty+sections)

const aiClient = axios.create({
  baseURL: AI_URL,
  timeout: 60_000,
  headers: { "x-internal-secret": AI_SECRET },
});

export type Difficulty = "easy" | "medium" | "hard";

export interface InterviewQuestion {
  category:             string;
  question:             string;
  expected_answer_hint: string;
  difficulty:           string;
}

export interface GenerateResult {
  questions: InterviewQuestion[];
  count:     number;
  sections:  string[];
}

// ── Cache key ─────────────────────────────────────────────────────────────────

function cacheKey(jobTitle: string, difficulty: string, sections: string[], count: number) {
  const secKey = [...sections].sort().join(",");
  return `interview:${jobTitle.toLowerCase().replace(/\s+/g, "-")}:${difficulty}:${secKey}:${count}`;
}

// ── Generate questions ─────────────────────────────────────────────────────────

export async function generateInterviewQuestions(
  userId:         string,
  jobTitle:       string,
  jobDescription: string,
  difficulty:     Difficulty,
  sections:       string[],
  count:          number,
): Promise<{ session: { id: string }; questions: InterviewQuestion[]; cached: boolean }> {
  const key    = cacheKey(jobTitle, difficulty, sections, count);
  const cached = await redis.get(key);

  let questions: InterviewQuestion[];
  let fromCache = false;

  if (cached) {
    questions = JSON.parse(cached) as InterviewQuestion[];
    fromCache = true;
    logger.info({ key }, "interview questions cache hit");
  } else {
    try {
      const { data } = await aiClient.post<GenerateResult>("/api/interview/generate", {
        job_title:       jobTitle,
        job_description: jobDescription,
        difficulty,
        sections: sections.length ? sections : null,
        count,
      });
      questions = data.questions;
      await redis.set(key, JSON.stringify(questions), CACHE_TTL);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      logger.error({ err: msg }, "AI interview generation failed");
      throw new AppError(502, "Interview question generation failed — AI service error");
    }
  }

  // Persist session to DB
  const session = await prisma.interviewSession.create({
    data: {
      userId,
      jobTitle,
      difficulty,
      sections: sections.length ? sections : [],
      questions: questions as object[],
    },
    select: { id: true },
  });

  return { session, questions, cached: fromCache };
}

// ── List sessions ──────────────────────────────────────────────────────────────

export async function listSessions(userId: string) {
  return prisma.interviewSession.findMany({
    where:   { userId },
    orderBy: { createdAt: "desc" },
    take:    20,
    select:  { id: true, jobTitle: true, difficulty: true, sections: true, createdAt: true },
  });
}

// ── Get session ────────────────────────────────────────────────────────────────

export async function getSession(userId: string, sessionId: string) {
  const session = await prisma.interviewSession.findFirst({
    where: { id: sessionId, userId },
  });
  if (!session) throw new AppError(404, "Session not found");
  return session;
}

// ── Delete session ─────────────────────────────────────────────────────────────

export async function deleteSession(userId: string, sessionId: string) {
  const session = await prisma.interviewSession.findFirst({
    where: { id: sessionId, userId },
  });
  if (!session) throw new AppError(404, "Session not found");
  await prisma.interviewSession.delete({ where: { id: sessionId } });
}

// ── Save marks ────────────────────────────────────────────────────────────────

export async function saveMarks(
  userId:    string,
  sessionId: string,
  marks:     Record<string, "correct" | "review" | null>,
) {
  const session = await prisma.interviewSession.findFirst({
    where: { id: sessionId, userId },
  });
  if (!session) throw new AppError(404, "Session not found");

  return prisma.interviewSession.update({
    where: { id: sessionId },
    data:  { marks: marks as object },
    select: { id: true, marks: true },
  });
}

// ── List categories ───────────────────────────────────────────────────────────

export async function listCategories() {
  try {
    const { data } = await aiClient.get("/api/interview/categories");
    return data;
  } catch {
    throw new AppError(502, "Failed to fetch interview categories");
  }
}
