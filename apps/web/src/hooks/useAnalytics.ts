"use client";

import { useCallback, useState } from "react";
import { api } from "@/lib/api";

export type DateRange = 30 | 90 | 0; // 0 = all time

export interface OverviewData {
  totalApplications: number;
  interviews:        number;
  offers:            number;
  successRate:       number;
  avgAtsScore:       number | null;
  savedJobs:         number;
  roadmaps:          number;
}

export interface AtsTrendPoint  { version: number; score: number; date: string }
export interface MonthlyPoint   { month: string; applied: number; interviewed: number; offered: number }
export interface SkillPoint     { skill: string; count: number }
export interface FunnelStage    { stage: string; count: number }

export interface AnalyticsData {
  overview: OverviewData | null;
  atsTrend: AtsTrendPoint[];
  monthly:  MonthlyPoint[];
  skills:   SkillPoint[];
  funnel:   FunnelStage[];
}

const EMPTY: AnalyticsData = {
  overview: null, atsTrend: [], monthly: [], skills: [], funnel: [],
};

export function useAnalytics() {
  const [data, setData]       = useState<AnalyticsData>(EMPTY);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState<string | null>(null);
  const [range, setRange]     = useState<DateRange>(30);

  const fetchAll = useCallback(async (r: DateRange = range) => {
    setLoading(true);
    setError(null);
    try {
      const q = r === 0 ? "" : `?range=${r}`;
      const [ov, ats, mon, sk, fn] = await Promise.all([
        api.get<OverviewData>(`/analytics/overview${q}`),
        api.get<{ trend: AtsTrendPoint[] }>("/analytics/ats-trend"),
        api.get<{ monthly: MonthlyPoint[] }>(`/analytics/applications-monthly${q}`),
        api.get<{ skills: SkillPoint[] }>("/analytics/skills-demand"),
        api.get<{ funnel: FunnelStage[] }>("/analytics/funnel"),
      ]);
      setData({
        overview: ov.data,
        atsTrend: ats.data.trend,
        monthly:  mon.data.monthly,
        skills:   sk.data.skills,
        funnel:   fn.data.funnel,
      });
    } catch {
      setError("Failed to load analytics data");
    } finally {
      setLoading(false);
    }
  }, [range]);

  const changeRange = useCallback((r: DateRange) => {
    setRange(r);
    fetchAll(r);
  }, [fetchAll]);

  return { data, loading, error, range, fetchAll, changeRange };
}
