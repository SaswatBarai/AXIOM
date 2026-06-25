"use client";

import { useCallback, useState } from "react";
import { api } from "@/lib/api";

export type Tone = "formal" | "friendly" | "direct";

export interface GenerateResult {
  letter: string;
  tone: Tone;
  cached: boolean;
}

export function useCoverLetter() {
  const [letter, setLetter]   = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState<string | null>(null);

  const generate = useCallback(async (
    applicationId: string,
    resumeId: string,
    jobDescription: string,
    companyName: string,
    jobTitle: string,
    tone: Tone = "formal",
  ): Promise<GenerateResult | null> => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await api.post<GenerateResult>(
        `/api/cover-letter/${applicationId}/generate`,
        { resumeId, jobDescription, companyName, jobTitle, tone },
      );
      setLetter(data.letter);
      return data;
    } catch {
      setError("Failed to generate cover letter — please try again");
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const save = useCallback(async (applicationId: string, text: string) => {
    setLoading(true);
    try {
      await api.put(`/api/cover-letter/${applicationId}`, { letter: text });
      setLetter(text);
    } catch {
      setError("Failed to save cover letter");
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchSaved = useCallback(async (applicationId: string) => {
    setLoading(true);
    try {
      const { data } = await api.get<{ letter: string | null }>(
        `/api/cover-letter/${applicationId}`,
      );
      if (data.letter) setLetter(data.letter);
    } catch {
      setError("Failed to load cover letter");
    } finally {
      setLoading(false);
    }
  }, []);

  const exportFile = useCallback(async (
    format: "pdf" | "docx",
    letterBody: string,
    candidateName: string,
    jobTitle: string,
    companyName: string,
  ) => {
    try {
      const resp = await api.post(
        `/api/cover-letter/export/${format}`,
        { letterBody, candidateName, jobTitle, companyName },
        { responseType: "blob" },
      );
      const ext  = format === "pdf" ? "pdf" : "docx";
      const mime = format === "pdf"
        ? "application/pdf"
        : "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
      const blob = new Blob([resp.data as BlobPart], { type: mime });
      const url  = URL.createObjectURL(blob);
      const a    = document.createElement("a");
      a.href     = url;
      a.download = `cover_letter.${ext}`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      setError(`Failed to export ${format.toUpperCase()}`);
    }
  }, []);

  return { letter, setLetter, loading, error, generate, save, fetchSaved, exportFile };
}
