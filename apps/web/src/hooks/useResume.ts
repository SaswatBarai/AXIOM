"use client";

import { useCallback, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import type { RootState } from "@/store";
import { setResumes, setActiveResume, setUploading } from "@/store/resumeSlice";
import { api } from "@/lib/api";
import type { Resume } from "@axiom/shared-types";

export function useResume() {
  const dispatch = useDispatch();
  const { resumes, activeResume, isUploading } = useSelector((s: RootState) => s.resume);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError]         = useState<string | null>(null);

  const fetchResumes = useCallback(async () => {
    try {
      setIsLoading(true);
      const { data } = await api.get("/resumes");
      dispatch(setResumes(data.resumes));
    } catch {
      setError("Failed to load resumes");
    } finally {
      setIsLoading(false);
    }
  }, [dispatch]);

  useEffect(() => { fetchResumes(); }, [fetchResumes]);

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
      dispatch(setActiveResume(data.resume));
      return data.resume;
    } finally {
      dispatch(setUploading(false));
    }
  }

  async function deleteResume(id: string) {
    await api.delete(`/resumes/${id}`);
    dispatch(setResumes(resumes.filter((r) => r.id !== id)));
    if (activeResume?.id === id) {
      const next = resumes.find((r) => r.id !== id);
      if (next) dispatch(setActiveResume(next));
    }
  }

  async function analyzeResume(id: string, jobDescription: string): Promise<Resume> {
    const { data } = await api.post(`/resumes/${id}/analyze`, { jobDescription });
    const updated = resumes.map((r) => r.id === id ? data.resume : r);
    dispatch(setResumes(updated));
    return data.resume;
  }

  return { resumes, activeResume, isLoading, isUploading, error, uploadResume, deleteResume, analyzeResume, refetch: fetchResumes };
}
