'use client';

import { BarChart3, Percent, Hash, Zap } from "lucide-react";
import { cn } from "@/lib/utils";
import type { AdminOverview } from "@/hooks/useAdmin";

interface QuickStatsProps {
  data: AdminOverview;
}

function fmt1(n: number): string {
  return n.toFixed(1);
}

export function QuickStats({ data }: QuickStatsProps) {
  const appsPerUser = data.totalUsers > 0 ? data.totalApplications / data.totalUsers : 0;
  const premiumRate = data.totalUsers > 0 ? (data.premiumUsers / data.totalUsers) * 100 : 0;
  const jobsPerUser = data.totalUsers > 0 ? data.totalJobs / data.totalUsers : 0;
  const engagementRate = data.totalUsers > 0 ? (data.activeUsers / data.totalUsers) * 100 : 0;

  const stats = [
    { icon: BarChart3, label: "Apps / User", value: fmt1(appsPerUser), color: "text-blue-500 bg-blue-500/10" },
    { icon: Percent, label: "Premium Rate", value: `${fmt1(premiumRate)}%`, color: "text-amber-500 bg-amber-500/10" },
    { icon: Hash, label: "Jobs / User", value: fmt1(jobsPerUser), color: "text-violet-500 bg-violet-500/10" },
    { icon: Zap, label: "Engagement", value: `${fmt1(engagementRate)}%`, color: "text-emerald-500 bg-emerald-500/10" },
  ];

  return (
    <div>
      <div className="text-[10px] font-semibold text-text-muted uppercase tracking-wider mb-2.5">Quick Stats</div>
      <div className="grid grid-cols-2 gap-2">
        {stats.map(({ icon: Icon, label, value, color }) => (
          <div key={label} className="border border-border-subtle bg-bg-card/25 rounded-xl p-3 flex items-center gap-2.5">
            <div className={cn("w-7 h-7 rounded-lg flex items-center justify-center shrink-0", color)}>
              <Icon size={13} />
            </div>
            <div className="min-w-0">
              <div className="text-sm font-bold text-text-primary">{value}</div>
              <div className="text-[10px] text-text-muted truncate">{label}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
