'use client';

import { TrendingUp, TrendingDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface MetricCardProps {
  icon: React.ElementType;
  label: string;
  value: string;
  trend: number;
  trendLabel: string;
  iconColor: string;
}

export function MetricCard({ icon: Icon, label, value, trend, trendLabel, iconColor }: MetricCardProps) {
  const up = trend >= 0;
  return (
    <div className="border border-zinc-800/60 bg-zinc-900/20 rounded-xl p-3.5 hover:bg-zinc-900/30 transition-colors flex flex-col">
      <div className="flex items-center justify-between mb-3">
        <div className={cn("w-7 h-7 rounded-lg flex items-center justify-center", iconColor)}>
          <Icon size={14} />
        </div>
        <span
          className={cn(
            "inline-flex items-center gap-1 text-[11px] font-semibold px-1.5 py-0.5 rounded",
            up ? "text-emerald-400 bg-emerald-500/10" : "text-red-400 bg-red-500/10"
          )}
        >
          {up ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
          {trend > 0 ? "+" : ""}{trend}%
        </span>
      </div>

      <div className="mt-auto">
        <div className="text-2xl font-bold text-white tracking-tight leading-none">{value}</div>
        <div className="text-[11px] text-zinc-500 font-medium mt-1">{label}</div>
      </div>

      <div className="text-[10px] text-zinc-600 mt-2 pt-2 border-t border-zinc-800/40">{trendLabel}</div>
    </div>
  );
}
