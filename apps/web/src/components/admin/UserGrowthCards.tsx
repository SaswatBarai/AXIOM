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
        <Calendar size={13} className="text-zinc-500" />
        <span className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider">User Growth</span>
      </div>
      <div className="grid grid-cols-3 gap-3">
        {items.map(({ key, label, sub }) => {
          const val = data[key];
          return (
            <div key={key} className="border border-zinc-800/60 bg-zinc-900/20 rounded-xl p-3.5">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[11px] font-medium text-zinc-400">{label}</span>
                <span className={cn(
                  "inline-flex items-center gap-0.5 text-[10px] font-medium px-1.5 py-0.5 rounded",
                  val > 0 ? "text-emerald-400 bg-emerald-500/10" : "text-zinc-600 bg-zinc-800/30"
                )}>
                  {val > 0 ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
                  {val > 0 ? "+" : ""}{val}
                </span>
              </div>
              <div className="text-lg font-bold text-white tracking-tight">{val}</div>
              <div className="text-[10px] text-zinc-600 mt-0.5">{sub}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
