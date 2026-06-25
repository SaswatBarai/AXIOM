'use client';

import { Activity } from "lucide-react";
import { cn } from "@/lib/utils";
import type { AdminOverview } from "@/hooks/useAdmin";

interface EngagementCardProps {
  data: AdminOverview;
}

function formatNumber(n: number): string {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + "M";
  if (n >= 1_000) return (n / 1_000).toFixed(1) + "K";
  return n.toLocaleString();
}

export function EngagementCard({ data }: EngagementCardProps) {
  const pct = data.totalUsers > 0 ? Math.round((data.activeUsers / data.totalUsers) * 100) : 0;

  return (
    <div className="mb-6">
      <div className="text-[10px] font-semibold text-text-muted uppercase tracking-wider mb-2.5">Engagement</div>
      <div className="border border-border-subtle bg-bg-card/25 rounded-xl p-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-center">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-emerald-500/10 flex items-center justify-center shrink-0">
              <Activity size={16} className="text-emerald-500" />
            </div>
            <div>
              <div className="text-lg font-bold text-text-primary">{formatNumber(data.activeUsers)}</div>
              <div className="text-[10px] text-text-muted">Active users (30d)</div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex-1 h-2 bg-bg-elevated rounded-full overflow-hidden">
              <div
                className="h-full bg-emerald-500 rounded-full transition-all duration-700"
                style={{ width: `${pct}%` }}
              />
            </div>
            <span className="text-xs font-bold text-emerald-500 w-10 text-right">{pct}%</span>
          </div>

          <div className="flex items-center justify-between sm:justify-end gap-4 text-[11px]">
            <div className="text-right">
              <div className="text-text-secondary font-medium">{formatNumber(data.activeUsers)}</div>
              <div className="text-text-muted">Active</div>
            </div>
            <div className="w-px h-8 bg-border-subtle" />
            <div className="text-right">
              <div className="text-text-secondary font-medium">{formatNumber(data.totalUsers - data.activeUsers)}</div>
              <div className="text-text-muted">Inactive</div>
            </div>
            <div className="w-px h-8 bg-border-subtle" />
            <div className="text-right">
              <div className={cn("font-medium", pct > 50 ? "text-emerald-500" : "text-amber-500")}>{pct}%</div>
              <div className="text-text-muted">Rate</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
