import axios from "axios";
import { prisma } from "@axiom/database";
import { redis } from "./redis.service";
import { AppError } from "../middleware/errorHandler.middleware";
import { logger } from "../utils/logger";
import { requireEnv } from "../utils/env";

const AI_URL    = process.env.AI_SERVICE_URL    ?? "http://localhost:8000";
const AI_SECRET = requireEnv("AI_SERVICE_SECRET");
const CACHE_TTL = 86_400; // 24h per spec

const aiClient = axios.create({
  baseURL: AI_URL,
  timeout: 30_000,
  headers: { "x-internal-secret": AI_SECRET },
});

export type Tone = "formal" | "friendly" | "direct";

// ── Cache key ──────────────────────────────────────────────────────────────────

function cacheKey(resumeId: string, jobId: string, tone: Tone) {
  return `cover-letter:${resumeId}:${jobId}:${tone}`;
}

// ── Generate ───────────────────────────────────────────────────────────────────

export async function generateCoverLetter(
  userId: string,
  resumeId: string,
  applicationId: string,
  jobDescription: string,
  companyName: string,
  jobTitle: string,
  tone: Tone = "formal",
): Promise<{ letter: string; tone: Tone; cached: boolean }> {
  // Fetch resume + verify ownership
  const resume = await prisma.resume.findUnique({ where: { id: resumeId } });
  if (!resume) throw new AppError(404, "Resume not found");
  if (resume.userId !== userId) throw new AppError(403, "Forbidden");
  if (!resume.parsedData) throw new AppError(422, "Resume has not been parsed yet");

  // Fetch application + verify ownership
  const application = await prisma.application.findUnique({ where: { id: applicationId } });
  if (!application) throw new AppError(404, "Application not found");
  if (application.userId !== userId) throw new AppError(403, "Forbidden");

  // Check 24h cache
  const key = cacheKey(resumeId, applicationId, tone);
  const cached = await redis.get(key);
  if (cached) {
    return { letter: cached, tone, cached: true };
  }

  // Call AI service
  let letter: string;
  try {
    const { data } = await aiClient.post<{ letter: string }>("/api/genai/cover-letter/generate", {
      parsed_resume:   resume.parsedData,
      job_description: jobDescription,
      company_name:    companyName,
      job_title:       jobTitle,
      tone,
    });
    letter = data.letter;
  } catch (err) {
    logger.error(`Cover letter AI call failed: ${(err as Error).message}`);
    throw new AppError(503, "Cover letter service unavailable — please retry");
  }

  // Cache + persist on application
  await Promise.all([
    redis.set(key, letter, CACHE_TTL),
    prisma.application.update({
      where: { id: applicationId },
      data:  { coverLetter: letter },
    }),
  ]);

  return { letter, tone, cached: false };
}

// ── Export helpers (proxy binary response) ────────────────────────────────────

async function proxyExport(
  endpoint: string,
  body: object,
): Promise<Buffer> {
  const resp = await axios.post(`${AI_URL}${endpoint}`, body, {
    headers: { "x-internal-secret": AI_SECRET },
    responseType: "arraybuffer",
    timeout: 20_000,
  });
  return Buffer.from(resp.data as ArrayBuffer);
}

export async function exportPdf(
  letterBody:    string,
  candidateName: string,
  jobTitle:      string,
  companyName:   string,
): Promise<Buffer> {
  try {
    return await proxyExport("/api/genai/cover-letter/export/pdf", {
      letter_body:    letterBody,
      candidate_name: candidateName,
      job_title:      jobTitle,
      company_name:   companyName,
    });
  } catch (err) {
    logger.error(`PDF export failed: ${(err as Error).message}`);
    throw new AppError(500, "PDF export failed");
  }
}

export async function exportDocx(
  letterBody:    string,
  candidateName: string,
  jobTitle:      string,
  companyName:   string,
): Promise<Buffer> {
  try {
    return await proxyExport("/api/genai/cover-letter/export/docx", {
      letter_body:    letterBody,
      candidate_name: candidateName,
      job_title:      jobTitle,
      company_name:   companyName,
    });
  } catch (err) {
    logger.error(`DOCX export failed: ${(err as Error).message}`);
    throw new AppError(500, "DOCX export failed");
  }
}

// ── Fetch saved letter ─────────────────────────────────────────────────────────

export async function getSavedLetter(
  userId: string,
  applicationId: string,
): Promise<string | null> {
  const app = await prisma.application.findUnique({ where: { id: applicationId } });
  if (!app) throw new AppError(404, "Application not found");
  if (app.userId !== userId) throw new AppError(403, "Forbidden");
  return app.coverLetter ?? null;
}

// ── Save edited letter ────────────────────────────────────────────────────────

export async function saveLetter(
  userId: string,
  applicationId: string,
  letter: string,
): Promise<void> {
  const app = await prisma.application.findUnique({ where: { id: applicationId } });
  if (!app) throw new AppError(404, "Application not found");
  if (app.userId !== userId) throw new AppError(403, "Forbidden");
  await prisma.application.update({
    where: { id: applicationId },
    data:  { coverLetter: letter },
  });
}
