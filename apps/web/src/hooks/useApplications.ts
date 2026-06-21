"use client";

import { useCallback, useState } from "react";
import { api } from "@/lib/api";

export interface ApplicationFilters {
  status?: string;
  dateFrom?: string;
  dateTo?: string;
}

export interface TimelineEntry {
  status: string;
  at: string;
  note: string;
}

export interface Application {
  id: string;
  userId: string;
  jobId: string;
  status: string;
  coverLetter: string | null;
  notes: string | null;
  appliedAt: string | null;
  timeline: string | TimelineEntry[];
  createdAt: string;
  updatedAt: string;
  job: {
    id: string;
    title: string;
    company: string;
    companyLogoUrl: string | null;
    location: string;
    remote: boolean;
    jobType: string;
    experienceLevel: string;
    salaryMin: number | null;
    salaryMax: number | null;
    currency: string | null;
    description: string;
    requiredSkills: string[];
    niceToHaveSkills: string[];
    source: string;
    sourceUrl: string;
    postedAt: string;
  };
}

export interface ApplicationStats {
  counts: Record<string, number>;
  successRate: number;
  avgTimeToInterviewDays: number;
}

export function useApplications() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [stats, setStats] = useState<ApplicationStats | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingStats, setLoadingStats] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [statsError, setStatsError] = useState<string | null>(null);

  const fetchApplications = useCallback(async (filters: ApplicationFilters = {}) => {
    setIsLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([k, v]) => {
        if (v) params.set(k, v);
      });

      const { data } = await api.get(`/applications?${params.toString()}`);
      setApplications(data.applications || []);
    } catch (err: any) {
      setError(err.response?.data?.error || "Failed to load applications");
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchStats = useCallback(async () => {
    setLoadingStats(true);
    setStatsError(null);
    try {
      const { data } = await api.get("/applications/stats");
      setStats(data.stats);
    } catch (err: any) {
      setStatsError(err.response?.data?.error || "Failed to load application statistics");
    } finally {
      setLoadingStats(false);
    }
  }, []);

  const createApplication = async (
    jobId: string,
    status?: string,
    note?: string
  ): Promise<Application> => {
    setError(null);
    try {
      const { data } = await api.post("/applications", { jobId, status, note });
      setApplications((prev) => [data.application, ...prev]);
      // Refetch stats asynchronously since database changed
      void fetchStats();
      return data.application;
    } catch (err: any) {
      const msg = err.response?.data?.error || "Failed to create application";
      setError(msg);
      throw new Error(msg);
    }
  };

  const updateApplication = async (
    id: string,
    updateData: {
      status?: string;
      notes?: string;
      coverLetter?: string;
      note?: string;
    }
  ): Promise<Application> => {
    setError(null);

    // Optimistic UI updates for status change
    let previousApps: Application[] = [];
    if (updateData.status) {
      setApplications((prev) => {
        previousApps = prev;
        return prev.map((app) => {
          if (app.id === id) {
            return {
              ...app,
              status: updateData.status!,
              updatedAt: new Date().toISOString(),
            };
          }
          return app;
        });
      });
    }

    try {
      const { data } = await api.patch(`/applications/${id}`, updateData);
      setApplications((prev) => prev.map((app) => (app.id === id ? data.application : app)));
      void fetchStats();
      return data.application;
    } catch (err: any) {
      // Revert if request fails
      if (updateData.status && previousApps.length > 0) {
        setApplications(previousApps);
      }
      const msg =
        err.response?.data?.error ||
        err.response?.data?.details?.[0]?.message ||
        "Failed to update application";
      setError(msg);
      throw new Error(msg);
    }
  };

  const deleteApplication = async (id: string) => {
    setError(null);
    const previousApps = applications;
    // Optimistic delete
    setApplications((prev) => prev.filter((app) => app.id !== id));
    try {
      await api.delete(`/applications/${id}`);
      void fetchStats();
    } catch (err: any) {
      // Revert on failure
      setApplications(previousApps);
      const msg = err.response?.data?.error || "Failed to delete application";
      setError(msg);
      throw new Error(msg);
    }
  };

  return {
    applications,
    stats,
    isLoading,
    loadingStats,
    error,
    statsError,
    fetchApplications,
    fetchStats,
    createApplication,
    updateApplication,
    deleteApplication,
  };
}
