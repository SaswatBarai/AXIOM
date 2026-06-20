import axios from "axios";
import type { ParsedResume, ATSScore } from "@axiom/shared-types";
import { logger } from "../utils/logger";

const AI_URL    = process.env.AI_SERVICE_URL    ?? "http://localhost:8000";
const AI_SECRET = process.env.AI_SERVICE_SECRET ?? "internal-secret";

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
