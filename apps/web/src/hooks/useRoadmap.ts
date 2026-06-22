"use client";

import { useCallback, useState } from "react";
import { api } from "@/lib/api";

export interface RoadmapStep {
  week:            number;
  skill:           string;
  tier:            string;
  resources:       string[];
  estimated_hours: number;
}

export interface RoadmapSummary {
  id:         string;
  title:      string;
  targetRole: string;
  weeks:      number;
  version:    number;
  createdAt:  string;
  stepCount:  number;
  doneCount:  number;
  pct:        number;
}

export interface RoadmapDetail {
  id:         string;
  title:      string;
  targetRole: string;
  weeks:      number;
  version:    number;
  createdAt:  string;
  content:    RoadmapStep[];
  progress:   Record<string, boolean>;
}

export interface ProgressStats {
  completedWeeks: number;
  totalWeeks:     number;
  pct:            number;
  etaWeeks:       number;
}

export function useRoadmap() {
  const [roadmaps, setRoadmaps]   = useState<RoadmapSummary[]>([]);
  const [current, setCurrent]     = useState<RoadmapDetail | null>(null);
  const [stats, setStats]         = useState<ProgressStats | null>(null);
  const [loading, setLoading]     = useState(false);
  const [error, setError]         = useState<string | null>(null);

  // ── Generate ─────────────────────────────────────────────────────────────────
  const generate = useCallback(async (
    targetRole: string,
    gapReport:  Record<string, unknown>,
    weeks:      number,
  ) => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await api.post<{ roadmap: RoadmapDetail }>("/roadmap/generate", {
        targetRole, gapReport, weeks,
      });
      setCurrent(data.roadmap);
      setStats(computeStats(data.roadmap));
      fetchRoadmaps();
    } catch {
      setError("Failed to generate roadmap — please try again");
    } finally {
      setLoading(false);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ── List ──────────────────────────────────────────────────────────────────────
  const fetchRoadmaps = useCallback(async () => {
    try {
      const { data } = await api.get<{ roadmaps: RoadmapSummary[] }>("/roadmap");
      setRoadmaps(data.roadmaps);
    } catch {
      setError("Failed to load roadmaps");
    }
  }, []);

  // ── Load detail ───────────────────────────────────────────────────────────────
  const loadRoadmap = useCallback(async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await api.get<{ roadmap: RoadmapDetail }>(`/roadmap/${id}`);
      setCurrent(data.roadmap);
      setStats(computeStats(data.roadmap));
    } catch {
      setError("Failed to load roadmap");
    } finally {
      setLoading(false);
    }
  }, []);

  // ── Mark step done / undone ───────────────────────────────────────────────────
  const markStep = useCallback(async (week: number, done: boolean) => {
    if (!current) return;
    // Optimistic update
    const updatedProgress = { ...current.progress };
    if (done) updatedProgress[String(week)] = true;
    else delete updatedProgress[String(week)];
    const optimistic = { ...current, progress: updatedProgress };
    setCurrent(optimistic);
    setStats(computeStats(optimistic));

    try {
      const { data } = await api.patch<{ progress: Record<string, boolean>; stats: ProgressStats }>(
        `/roadmap/${current.id}/steps/${week}`,
        { done },
      );
      setCurrent((prev) => prev ? { ...prev, progress: data.progress } : prev);
      setStats(data.stats);
    } catch {
      // Revert on failure
      setCurrent(current);
      setStats(computeStats(current));
      setError("Failed to save progress");
    }
  }, [current]);

  // ── Delete ─────────────────────────────────────────────────────────────────────
  const deleteRoadmap = useCallback(async (id: string) => {
    try {
      await api.delete(`/roadmap/${id}`);
      setRoadmaps((prev) => prev.filter((r) => r.id !== id));
      if (current?.id === id) { setCurrent(null); setStats(null); }
    } catch {
      setError("Failed to delete roadmap");
    }
  }, [current]);

  const clearCurrent = useCallback(() => {
    setCurrent(null);
    setStats(null);
    setError(null);
  }, []);

  return {
    roadmaps, current, stats, loading, error,
    generate, fetchRoadmaps, loadRoadmap, markStep, deleteRoadmap, clearCurrent,
  };
}

function computeStats(r: RoadmapDetail): ProgressStats {
  const total     = r.content?.length ?? 0;
  const completed = r.content?.filter((s) => r.progress?.[String(s.week)]).length ?? 0;
  return {
    completedWeeks: completed,
    totalWeeks:     total,
    pct:            total > 0 ? Math.round((completed / total) * 100) : 0,
    etaWeeks:       total - completed,
  };
}
