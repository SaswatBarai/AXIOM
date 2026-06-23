import axios from "axios";
import type { ParsedResume, ATSScore } from "@axiom/shared-types";
import { logger } from "../utils/logger";
import { requireEnv } from "../utils/env";

const AI_URL    = process.env.AI_SERVICE_URL    ?? "http://localhost:8000";
const AI_SECRET = requireEnv("AI_SERVICE_SECRET");

const aiClient = axios.create({
  baseURL: AI_URL,
  timeout: 60_000,
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
    return data.data;
  } catch (err) {
    logger.warn(`AI parsing failed for ${fileUrl}: ${(err as Error).message}`);
    return null;
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

export interface MatchResult {
  job_id: string;
  score: number;
  matched_skills: string[];
  missing_skills: string[];
}

export async function matchJobs(
  resumeId: string,
  jobIds?: string[],
): Promise<MatchResult[] | null> {
  try {
    const { data } = await aiClient.post<{ success: boolean; data: MatchResult[] }>(
      "/api/resume/match",
      { resume_id: resumeId, job_ids: jobIds || [] },
    );
    return data.data;
  } catch (err) {
    logger.warn(`AI matching failed for resume ${resumeId}: ${(err as Error).message}`);
    return null;
  }
}
