"use client";

import { useCallback, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import type { RootState } from "@/store";
import { setResumes, setActiveResumeId, setUploading } from "@/store/resumeSlice";
import { api } from "@/lib/api";
import type { Resume } from "@axiom/shared-types";

export function useResume() {
  const dispatch = useDispatch();
  const { resumes, activeResumeId, isUploading } = useSelector((s: RootState) => s.resume);
  const [isLoading, setIsLoading] = useState(() => resumes.length === 0);
  const [error, setError]         = useState<string | null>(null);

  const fetchResumes = useCallback(async () => {
    const hasCache = resumes.length > 0;
    try {
      if (!hasCache) setIsLoading(true);
      const { data } = await api.get("/resumes");
      dispatch(setResumes(data.resumes));
      dispatch(setActiveResumeId(data.activeResumeId));
    } catch {
      setError("Failed to load resumes");
    } finally {
      setIsLoading(false);
    }
  }, [dispatch, resumes.length]);

  useEffect(() => { fetchResumes(); }, [fetchResumes]);

  // Track discovery status of the active resume locally
  const [activeDiscoveryStatus, setActiveDiscoveryStatus] = useState<string | null>(null);

  async function uploadResume(file: File): Promise<Resume> {
    dispatch(setUploading(true));
    try {
      const form = new FormData();
      form.append("resume", file);
      const { data } = await api.post("/resumes", form, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      const updated = [data.resume, ...resumes];
      dispatch(setResumes(updated));
      return data.resume;
    } finally {
      dispatch(setUploading(false));
    }
  }

  async function deleteResume(id: string) {
    const prev = resumes;
    dispatch(setResumes(resumes.filter((r) => r.id !== id)));
    try {
      const { data } = await api.delete(`/resumes/${id}`);
      dispatch(setActiveResumeId(data.activeResumeId));
    } catch {
      dispatch(setResumes(prev));
      setError("Failed to delete resume");
    }
  }

  async function setActiveResume(id: string): Promise<{
    discoveryStatus?: string;
    existingJobs?: boolean;
  }> {
    const { data } = await api.put(`/resumes/${id}/activate`);
    dispatch(setActiveResumeId(id));
    setActiveDiscoveryStatus(data.discoveryStatus ?? null);
    return data;
  }

  async function analyzeResume(id: string, jobDescription: string): Promise<Resume> {
    const { data } = await api.post(`/resumes/${id}/analyze`, { jobDescription });
    const updated = resumes.map((r) => r.id === id ? data.resume : r);
    dispatch(setResumes(updated));
    return data.resume;
  }

  return {
    resumes, activeResumeId, activeDiscoveryStatus,
    isLoading, isUploading, error,
    uploadResume, deleteResume, setActiveResume, analyzeResume,
    refetch: fetchResumes,
  };
}
