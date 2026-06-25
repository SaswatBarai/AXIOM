"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";

interface AdminJob {
  id: string;
  title: string;
  company: string;
  location?: string;
  status: string;
  createdAt: string;
}

export default function AdminJobsPage() {
  const [jobs, setJobs] = useState<AdminJob[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get("/jobs?limit=50")
      .then(({ data }) => setJobs(data.jobs ?? data.data ?? []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-7 h-7 border-2 border-border-subtle border-t-brand rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-text-primary mb-6">Jobs</h1>
      <div className="border border-border-subtle bg-bg-card/25 rounded-2xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border-subtle text-text-secondary text-xs uppercase tracking-wider">
              <th className="text-left py-3 px-4">Title</th>
              <th className="text-left py-3 px-4">Company</th>
              <th className="text-left py-3 px-4">Location</th>
              <th className="text-left py-3 px-4">Status</th>
              <th className="text-left py-3 px-4">Posted</th>
            </tr>
          </thead>
          <tbody>
            {jobs.map((j) => (
              <tr key={j.id} className="border-b border-border-subtle/50 hover:bg-bg-hover transition-colors">
                <td className="py-3 px-4 text-text-primary font-medium">{j.title}</td>
                <td className="py-3 px-4 text-text-secondary">{j.company}</td>
                <td className="py-3 px-4 text-text-muted text-xs">{j.location ?? "-"}</td>
                <td className="py-3 px-4">
                  <span className="inline-flex items-center text-xs font-medium text-emerald-500 bg-emerald-500/10 rounded px-2 py-0.5">
                    {j.status}
                  </span>
                </td>
                <td className="py-3 px-4 text-text-muted text-xs">{new Date(j.createdAt).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
