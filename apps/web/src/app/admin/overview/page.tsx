"use client";

import { useEffect, useState, useCallback } from "react";
import { fetchOverview, type AdminOverview } from "@/hooks/useAdmin";
import { OverviewHeader } from "@/components/admin/OverviewHeader";
import { KPICards } from "@/components/admin/KPICards";
import { AnalyticsCharts } from "@/components/admin/AnalyticsCharts";
import { UserGrowthCards } from "@/components/admin/UserGrowthCards";
import { EngagementCard } from "@/components/admin/EngagementCard";
import { RecentActivity } from "@/components/admin/RecentActivity";
import { QuickStats } from "@/components/admin/QuickStats";
import { SystemStatus } from "@/components/admin/SystemStatus";

export default function AdminOverviewPage() {
  const [overview, setOverview] = useState<AdminOverview | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(false);

  const load = useCallback(async (silent = false) => {
    if (silent) setRefreshing(true);
    else setLoading(true);
    setError(false);
    try {
      const data = await fetchOverview();
      setOverview(data);
      setLastUpdated(new Date());
    } catch {
      setError(true);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-7 h-7 border-2 border-white/20 border-t-white rounded-full animate-spin" />
      </div>
    );
  }

  if (error || !overview) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-3">
        <div className="w-10 h-10 rounded-xl bg-red-500/10 flex items-center justify-center">
          <span className="text-red-400 text-lg font-bold">!</span>
        </div>
        <p className="text-sm text-zinc-500">Failed to load overview data</p>
        <button
          onClick={() => load()}
          className="border border-zinc-700 bg-zinc-900/40 hover:bg-zinc-800/60 text-zinc-200 text-xs px-4 py-2 rounded-md transition-colors cursor-pointer"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      <OverviewHeader onRefresh={() => load(true)} refreshing={refreshing} lastUpdated={lastUpdated} />

      <KPICards data={overview} />
      <AnalyticsCharts data={overview} />
      <UserGrowthCards data={overview} />
      <EngagementCard data={overview} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
        <div className="lg:col-span-2">
          <QuickStats data={overview} />
        </div>
        <div>
          <RecentActivity overview={overview} />
        </div>
      </div>

      <SystemStatus />
    </div>
  );
}
