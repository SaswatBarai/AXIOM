'use client';

import { Users, Crown, Briefcase, ClipboardList } from "lucide-react";
import { MetricCard } from "./MetricCard";
import type { AdminOverview } from "@/hooks/useAdmin";

function formatNumber(n: number): string {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + "M";
  if (n >= 1_000) return (n / 1_000).toFixed(1) + "K";
  return n.toLocaleString();
}

interface KPICardsProps {
  data: AdminOverview;
}

export function KPICards({ data }: KPICardsProps) {
  const premiumRate = data.totalUsers > 0 ? Math.round((data.premiumUsers / data.totalUsers) * 100) : 0;

  return (
    <div className="mb-6">
      <div className="flex items-center gap-2 mb-3">
        <span className="text-[10px] font-semibold text-text-muted uppercase tracking-wider">Key Metrics</span>
        <div className="h-px flex-1 bg-gradient-to-r from-border-subtle/60 to-transparent" />
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <MetricCard
          icon={Users}
          label="Total Users"
          value={formatNumber(data.totalUsers)}
          trend={12}
          trendLabel="↑ 12% vs last month"
          iconColor="text-blue-500 bg-blue-500/10"
        />
        <MetricCard
          icon={Crown}
          label="Premium Users"
          value={formatNumber(data.premiumUsers)}
          trend={premiumRate}
          trendLabel={`${premiumRate}% of total users`}
          iconColor="text-amber-500 bg-amber-500/10"
        />
        <MetricCard
          icon={ClipboardList}
          label="Applications"
          value={formatNumber(data.totalApplications)}
          trend={8}
          trendLabel="↑ 8% vs last month"
          iconColor="text-emerald-500 bg-emerald-500/10"
        />
        <MetricCard
          icon={Briefcase}
          label="Jobs"
          value={formatNumber(data.totalJobs)}
          trend={-3}
          trendLabel="↓ 3% vs last month"
          iconColor="text-violet-500 bg-violet-500/10"
        />
      </div>
    </div>
  );
}
