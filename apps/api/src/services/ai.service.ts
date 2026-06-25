import axios from "axios";
import type { ParsedResume, ATSScore } from "@axiom/shared-types";
import { logger } from "../utils/logger";
import { requireEnv } from "../utils/env";

const AI_URL    = process.env.AI_SERVICE_URL    ?? "http://localhost:8000";
const AI_SECRET = requireEnv("AI_SERVICE_SECRET");
/** Worst-case AI match (role inference + batched LLM scoring) — must exceed observed ~90s runs. */
const MATCH_TIMEOUT_MS = 300_000;

const aiClient = axios.create({
  baseURL: AI_URL,
  timeout: MATCH_TIMEOUT_MS,
  headers: { "x-internal-secret": AI_SECRET },
});

export async function parseResume(
  fileUrl: string,
  fileType: string,
): Promise<ParsedResume | null> {
  try {
    const { data } = await aiClient.post<{ success: boolean; data: ParsedResume }>(
      "/api/resume/parse",
      { file_url: fileUrl, file_type: fileType },
    );
    return data.data ?? null;
  } catch (err) {
    // Build a descriptive message that survives serialization into parsingError
    let detail: string;
    if (axios.isAxiosError(err)) {
      const status = err.response?.status;
      const body   = (err.response?.data as { detail?: string } | undefined)?.detail;
      detail = status
        ? `AI service HTTP ${status}${body ? `: ${body}` : ""}`
        : `AI service unreachable: ${err.message}`;
    } else {
      detail = (err as Error).message ?? "unknown error";
    }
    logger.error({ err, fileUrl }, `AI parsing failed — ${detail}`);
    throw new Error(detail);
  }
}

export async function analyzeResumeATS(
  parsedData: ParsedResume,
  jobDescription: string,
): Promise<ATSScore | null> {
  try {
    const { data } = await aiClient.post<{ success: boolean; data: ATSScore }>(
      "/api/resume/analyze",
      { parsed_data: parsedData, job_description: jobDescription },
    );
    return data.data;
  } catch (err) {
    logger.warn(`ATS analysis failed: ${(err as Error).message}`);
    return null;
  }
}

export interface MatchReason {
  semantic_score:    number;
  skill_score:       number;
  seniority_score:   number;
  title_score:       number;
  profile_seniority: string;
  job_seniority:     string;
  confidence:        "high" | "medium" | "low";
}

export interface MatchResult {
  job_id:          string;
  score:           number;
  matched_skills:  string[];
  missing_skills:  string[];
  match_reason?:   MatchReason;
}

export async function matchJobs(
  resumeId: string,
  jobIds?: string[],
): Promise<MatchResult[] | null> {
  try {
    const { data } = await aiClient.post<{ success: boolean; data: MatchResult[] }>(
      "/api/resume/match",
      { resume_id: resumeId, job_ids: jobIds || [] },
      { timeout: MATCH_TIMEOUT_MS },
    );
    return data.data;
  } catch (err) {
    let detail: string;
    if (axios.isAxiosError(err)) {
      const status = err.response?.status;
      const body   = (err.response?.data as { detail?: string } | undefined)?.detail;
      detail = status
        ? `AI service HTTP ${status}${body ? `: ${body}` : ""}`
        : `AI service unreachable: ${err.message}`;
    } else {
      detail = (err as Error).message ?? "unknown error";
    }
    logger.error({ err, resumeId }, `AI matching failed — ${detail}`);
    throw new Error(detail);
  }
}
