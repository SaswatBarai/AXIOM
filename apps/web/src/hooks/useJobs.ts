"use client";

import { useCallback, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import type { RootState } from "@/store";
import { setJobs, toggleSavedJob } from "@/store/jobsSlice";
import { api } from "@/lib/api";
import type { Job } from "@axiom/shared-types";

export interface JobFilters {
  q?: string;
  location?: string;
  remote?: boolean;
  jobType?: "FULL_TIME" | "PART_TIME" | "CONTRACT" | "INTERNSHIP" | "FREELANCE";
  experienceLevel?: "ENTRY" | "MID" | "SENIOR" | "LEAD" | "EXECUTIVE";
  source?: "internshala" | "unstop" | "naukri" | "manual";
  salaryMin?: number;
  salaryMax?: number;
  skills?: string[];
  page?: number;
  pageSize?: number;
  sortBy?: "date" | "match";
}

interface SearchResponse {
  jobs: Job[];
  total: number;
  page: number;
  pageSize: number;
}

export function useJobs() {
  const dispatch = useDispatch();
  const { jobs, savedJobIds } = useSelector((s: RootState) => s.jobs);

  const [total, setTotal]         = useState(0);
  const [page, setPage]           = useState(1);
  const [pageSize, setPageSize]   = useState(20);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError]         = useState<string | null>(null);
  const [filters, setFilters]     = useState<JobFilters>({ sortBy: "match" });

  const search = useCallback(async (next: JobFilters = {}) => {
    setIsLoading(true);
    setError(null);
    const merged: JobFilters = { ...filters, ...next };
    setFilters(merged);

    const params = new URLSearchParams();
    Object.entries(merged).forEach(([k, v]) => {
      if (v === undefined || v === null || v === "") return;
      if (Array.isArray(v)) params.set(k, v.join(","));
      else params.set(k, String(v));
    });

    try {
      const { data } = await api.get<SearchResponse>(`/jobs?${params.toString()}`);
      dispatch(setJobs({ jobs: data.jobs, total: data.total }));
      setTotal(data.total);
      setPage(data.page);
      setPageSize(data.pageSize);
    } catch {
      setError("Failed to load jobs");
    } finally {
      setIsLoading(false);
    }
  }, [dispatch, filters]);

  useEffect(() => {
    if (jobs.length === 0) {
      void search();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function toggleSave(jobId: string) {
    const isSaved = savedJobIds.includes(jobId);
    // Optimistic toggle
    dispatch(toggleSavedJob(jobId));
    try {
      if (isSaved) {
        await api.delete(`/jobs/${jobId}/save`);
      } else {
        await api.post(`/jobs/${jobId}/save`);
      }
    } catch {
      // Revert on failure
      dispatch(toggleSavedJob(jobId));
      setError("Failed to update saved jobs");
    }
  }

  async function loadSaved() {
    try {
      const { data } = await api.get<SearchResponse>("/jobs/saved");
      // Reflect in Redux so the UI can show what's saved server-side
      data.jobs.forEach((j) => {
        if (!savedJobIds.includes(j.id)) dispatch(toggleSavedJob(j.id));
      });
      return data.jobs;
    } catch {
      setError("Failed to load saved jobs");
      return [];
    }
  }

  return {
    jobs,
    savedJobIds,
    total,
    page,
    pageSize,
    isLoading,
    error,
    filters,
    search,
    toggleSave,
    loadSaved,
  };
}
