"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { api } from "@/lib/api";

export type Difficulty = "easy" | "medium" | "hard";
export type Mark = "correct" | "review" | null;

export interface InterviewQuestion {
  category:             string;
  question:             string;
  expected_answer_hint: string;
  difficulty:           string;
}

export interface InterviewSession {
  id:         string;
  jobTitle:   string;
  difficulty: string;
  sections:   string[];
  createdAt:  string;
}

export interface GenerateResult {
  session:   { id: string };
  questions: InterviewQuestion[];
  cached:    boolean;
}

export function useInterview() {
  const [questions, setQuestions]   = useState<InterviewQuestion[]>([]);
  const [sessions, setSessions]     = useState<InterviewSession[]>([]);
  const [sessionId, setSessionId]   = useState<string | null>(null);
  const [marks, setMarks]           = useState<Record<number, Mark>>({});
  const [loading, setLoading]       = useState(false);
  const [error, setError]           = useState<string | null>(null);
  const marksRef = useRef(marks);
  marksRef.current = marks;
  useEffect(() => {
    if (sessionId && Object.keys(marks).length > 0) {
      persistMarks(sessionId, marks);
    }
  }, [marks, sessionId]);

  const generate = useCallback(async (
    jobTitle:       string,
    jobDescription: string,
    difficulty:     Difficulty,
    sections:       string[],
    count:          number,
  ): Promise<GenerateResult | null> => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await api.post<GenerateResult>("/interview/generate", {
        jobTitle, jobDescription, difficulty, sections, count,
      });
      setQuestions(data.questions);
      setSessionId(data.session.id);
      setMarks({});
      return data;
    } catch {
      setError("Failed to generate questions — please try again");
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchSessions = useCallback(async () => {
    try {
      const { data } = await api.get<{ sessions: InterviewSession[] }>("/interview/sessions");
      setSessions(data.sessions);
    } catch {
      setError("Failed to load sessions");
    }
  }, []);

  const loadSession = useCallback(async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await api.get<{
        session: { id: string; questions: InterviewQuestion[]; marks: Record<string, Mark> };
      }>(`/interview/sessions/${id}`);
      setQuestions(data.session.questions as InterviewQuestion[]);
      setSessionId(data.session.id);
      // Convert string-keyed marks from DB back to number-keyed
      const restored: Record<number, Mark> = {};
      for (const [k, v] of Object.entries(data.session.marks ?? {})) {
        restored[Number(k)] = v;
      }
      setMarks(restored);
    } catch {
      setError("Failed to load session");
    } finally {
      setLoading(false);
    }
  }, []);

  const persistMarks = useCallback(async (
    sid: string,
    updatedMarks: Record<number, Mark>,
  ) => {
    try {
      // Convert number keys to strings for JSON serialization
      const payload: Record<string, Mark> = {};
      for (const [k, v] of Object.entries(updatedMarks)) {
        payload[k] = v;
      }
      await api.patch(`/interview/sessions/${sid}/marks`, { marks: payload });
    } catch {
      // non-blocking — marks are still in local state
    }
  }, []);

  const setMark = useCallback((idx: number, mark: Mark) => {
    setMarks((prev) => ({ ...prev, [idx]: mark }));
  }, []);

  const resetMarks = useCallback(() => {
    setMarks({});
  }, []);

  const deleteSession = useCallback(async (id: string) => {
    try {
      await api.delete(`/interview/sessions/${id}`);
      setSessions((prev) => prev.filter((s) => s.id !== id));
      if (sessionId === id) { setQuestions([]); setSessionId(null); setMarks({}); }
    } catch {
      setError("Failed to delete session");
    }
  }, [sessionId]);

  const clearQuestions = useCallback(() => {
    setQuestions([]);
    setSessionId(null);
    setMarks({});
    setError(null);
  }, []);

  return {
    questions, sessions, sessionId, marks, loading, error,
    generate, fetchSessions, loadSession, deleteSession,
    clearQuestions, setMark, resetMarks,
  };
}
