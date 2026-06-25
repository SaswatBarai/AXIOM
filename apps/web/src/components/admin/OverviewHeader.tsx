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
        <h1 className="text-xl font-bold text-text-primary tracking-tight">Platform Overview</h1>
        <p className="text-sm text-text-secondary mt-0.5">Key metrics and trends across your platform</p>
      </div>
      <div className="flex items-center gap-3">
        {lastUpdated && (
          <span className="text-[11px] text-text-muted hidden sm:block">
            Updated {lastUpdated.toLocaleTimeString()}
          </span>
        )}
        <button
          onClick={onRefresh}
          disabled={refreshing}
          className="flex items-center gap-1.5 border border-border-subtle bg-bg-card/40 hover:bg-bg-hover text-text-primary text-xs px-3 py-1.5 rounded-md transition-colors disabled:opacity-50 cursor-pointer"
        >
          <RefreshCw size={13} className={cn(refreshing && "animate-spin")} />
          Refresh
        </button>
      </div>
    </div>
  );
}
