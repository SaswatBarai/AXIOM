"use client";

import { useEffect, useState } from "react";
import { fetchOverview, type AdminOverview } from "@/hooks/useAdmin";
import { StatCard } from "@/components/admin/StatCard";

export default function AdminOverviewPage() {
  const [overview, setOverview] = useState<AdminOverview | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOverview()
      .then(setOverview)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-7 h-7 border-2 border-white/20 border-t-white rounded-full animate-spin" />
      </div>
    );
  }

  if (!overview) {
    return <p className="text-zinc-500">Failed to load overview data.</p>;
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-white mb-6">Platform Overview</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <StatCard label="Total Users" value={overview.totalUsers} sublabel={`${overview.weekSignups} new in last 7 days`} />
        <StatCard label="Premium Users" value={overview.premiumUsers} />
        <StatCard label="Total Applications" value={overview.totalApplications} />
        <StatCard label="Total Jobs" value={overview.totalJobs} />
        <StatCard label="Signups This Week" value={overview.weekSignups} />
        <StatCard label="Active Users (30d)" value={overview.activeUsers} />
        <StatCard label="Signups Today" value={overview.todaySignups} />
        <StatCard label="Signups This Month" value={overview.monthSignups} />
      </div>
    </div>
  );
}
