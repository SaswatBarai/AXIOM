'use client';

import { RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";

interface OverviewHeaderProps {
  onRefresh: () => void;
  refreshing: boolean;
  lastUpdated: Date | null;
}

export function OverviewHeader({ onRefresh, refreshing, lastUpdated }: OverviewHeaderProps) {
  return (
    <div className="flex items-center justify-between mb-6">
      <div>
        <h1 className="text-xl font-bold text-white tracking-tight">Platform Overview</h1>
        <p className="text-sm text-zinc-500 mt-0.5">Key metrics and trends across your platform</p>
      </div>
      <div className="flex items-center gap-3">
        {lastUpdated && (
          <span className="text-[11px] text-zinc-600 hidden sm:block">
            Updated {lastUpdated.toLocaleTimeString()}
          </span>
        )}
        <button
          onClick={onRefresh}
          disabled={refreshing}
          className="flex items-center gap-1.5 border border-zinc-700 bg-zinc-900/40 hover:bg-zinc-800/60 text-zinc-200 text-xs px-3 py-1.5 rounded-md transition-colors disabled:opacity-50 cursor-pointer"
        >
          <RefreshCw size={13} className={cn(refreshing && "animate-spin")} />
          Refresh
        </button>
      </div>
    </div>
  );
}
