"use client";

import { useCallback, useState } from "react";
import { api } from "@/lib/api";

export interface TargetRole {
  id: string;
  label: string;
  description: string;
}

export interface GapRecommendation {
  skill: string;
  tier: "must_have" | "should_have" | "nice_to_have";
  tierLabel: string;
  priority: number;
}

export interface GapReport {
  roleId: string;
  roleLabel: string;
  version: string;
  matched: { must_have: string[]; should_have: string[]; nice_to_have: string[] };
  missing:  { must_have: string[]; should_have: string[]; nice_to_have: string[] };
  recommendations: GapRecommendation[];
  summary: {
    total: number;
    matchedCount: number;
    missingCount: number;
    readinessPct: number;
    mustHaveGap: number;
    skillsAway: number;
  };
}

export function useSkillGap() {
  const [roles, setRoles]   = useState<TargetRole[]>([]);
  const [report, setReport] = useState<GapReport | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError]   = useState<string | null>(null);

  const fetchRoles = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await api.get<{ roles: TargetRole[] }>("skills/target-roles");
      setRoles(data.roles);
    } catch {
      setError("Failed to load target roles");
    } finally {
      setLoading(false);
    }
  }, []);

  const analyzeGap = useCallback(async (resumeId: string, roleId: string) => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await api.post<{ report: GapReport }>(
        `skills/gap/${resumeId}`,
        { roleId },
      );
      setReport(data.report);
      return data.report;
    } catch {
      setError("Skill gap analysis failed — please try again");
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  return { roles, report, loading, error, fetchRoles, analyzeGap };
}
