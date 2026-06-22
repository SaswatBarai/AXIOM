'use client';

import { cn } from "@/lib/utils";

import { useEffect, useState } from "react";
import { UserPlus, Crown, FileText, Clock } from "lucide-react";
import { timeAgo } from "@/lib/utils";
import { fetchAuditLogs, generateActivityFromOverview, type AdminOverview, type RecentActivityItem } from "@/hooks/useAdmin";

interface RecentActivityProps {
  overview: AdminOverview;
}

const iconMap = {
  new_user: { icon: UserPlus, color: "text-blue-400 bg-blue-500/10" },
  premium_upgrade: { icon: Crown, color: "text-yellow-400 bg-yellow-500/10" },
  application: { icon: FileText, color: "text-emerald-400 bg-emerald-500/10" },
} as const;

export function RecentActivity({ overview }: RecentActivityProps) {
  const [items, setItems] = useState<RecentActivityItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const audit = await fetchAuditLogs(1, 5);
        if (audit.data.length > 0) {
          const mapped: RecentActivityItem[] = audit.data.map((a) => ({
            id: a.id,
            type: a.action.includes("CREATE") ? "new_user" as const : "application" as const,
            label: a.action,
            timestamp: a.createdAt,
          }));
          setItems(mapped);
        } else {
          setItems(generateActivityFromOverview(overview));
        }
      } catch {
        setItems(generateActivityFromOverview(overview));
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [overview]);

  if (loading) {
    return (
      <div className="border border-zinc-800/60 bg-zinc-900/20 rounded-xl p-4">
        <div className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider mb-3">Recent Activity</div>
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center gap-3 animate-pulse">
              <div className="w-7 h-7 rounded-full bg-zinc-800" />
              <div className="flex-1 space-y-1">
                <div className="h-3 bg-zinc-800 rounded w-2/3" />
                <div className="h-2 bg-zinc-800 rounded w-1/3" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="border border-zinc-800/60 bg-zinc-900/20 rounded-xl p-4">
        <div className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider mb-3">Recent Activity</div>
        <p className="text-xs text-zinc-600 text-center py-4">No recent activity</p>
      </div>
    );
  }

  return (
    <div className="border border-zinc-800/60 bg-zinc-900/20 rounded-xl p-4">
      <div className="flex items-center gap-2 mb-3">
        <Clock size={13} className="text-zinc-500" />
        <span className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider">Recent Activity</span>
      </div>
      <div className="space-y-2">
        {items.map((item, idx) => {
          const meta = iconMap[item.type] ?? iconMap.application;
          const Icon = meta.icon;
          return (
            <div key={item.id} className="flex items-center gap-3">
              <div className="relative">
                <div className={cn("w-7 h-7 rounded-full flex items-center justify-center", meta.color)}>
                  <Icon size={13} />
                </div>
                {idx < items.length - 1 && (
                  <div className="absolute top-7 left-1/2 -translate-x-1/2 w-px h-3 bg-zinc-800" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-xs text-zinc-300 truncate">{item.label}</div>
                <div className="text-[10px] text-zinc-600">{timeAgo(item.timestamp)}</div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

