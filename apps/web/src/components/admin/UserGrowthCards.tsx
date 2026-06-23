'use client';

import { Calendar, TrendingUp, TrendingDown } from "lucide-react";
import { cn } from "@/lib/utils";
import type { AdminOverview } from "@/hooks/useAdmin";

interface UserGrowthCardsProps {
  data: AdminOverview;
}

export function UserGrowthCards({ data }: UserGrowthCardsProps) {
  const items = [
    { key: "todaySignups" as const, label: "Today", sub: "New users in last 24h" },
    { key: "weekSignups" as const, label: "This Week", sub: "New users in last 7 days" },
    { key: "monthSignups" as const, label: "This Month", sub: "Since month start" },
  ];

  return (
    <div className="mb-6">
      <div className="flex items-center gap-2 mb-2.5">
        <Calendar size={13} className="text-text-muted" />
        <span className="text-[10px] font-semibold text-text-muted uppercase tracking-wider">User Growth</span>
      </div>
      <div className="grid grid-cols-3 gap-3">
        {items.map(({ key, label, sub }) => {
          const val = data[key];
          return (
            <div key={key} className="border border-border-subtle bg-bg-card/25 rounded-xl p-3.5">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[11px] font-medium text-text-secondary">{label}</span>
                <span className={cn(
                  "inline-flex items-center gap-0.5 text-[10px] font-medium px-1.5 py-0.5 rounded animate-none",
                  val > 0 ? "text-emerald-500 bg-emerald-500/10" : "text-text-muted bg-bg-hover"
                )}>
                  {val > 0 ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
                  {val > 0 ? "+" : ""}{val}
                </span>
              </div>
              <div className="text-lg font-bold text-text-primary tracking-tight">{val}</div>
              <div className="text-[10px] text-text-muted mt-0.5">{sub}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
