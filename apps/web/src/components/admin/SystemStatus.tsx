'use client';

import { useEffect, useState } from "react";
import { Server, Database, Wifi, HardDrive } from "lucide-react";
import { cn } from "@/lib/utils";
import { fetchSystemHealth } from "@/hooks/useAdmin";

const services = [
  { key: "status" as const, label: "API Server", icon: Server },
  { key: "db" as const, label: "Database", icon: Database },
  { key: "redis" as const, label: "Redis", icon: Wifi },
  { key: "storage" as const, label: "Storage", icon: HardDrive },
];

export function SystemStatus() {
  const [health, setHealth] = useState<{ status: string; db: string; redis: string } | null>(null);

  useEffect(() => {
    fetchSystemHealth()
      .then(setHealth)
      .catch(() => {});
  }, []);

  const getStatus = (key: string): "up" | "down" | "unknown" => {
    if (!health) return "unknown";
    if (key === "status") return health.status === "ok" ? "up" : "down";
    if (key === "db") return health.db as "up" | "down";
    if (key === "redis") return health.redis as "up" | "down";
    return "unknown";
  };

  return (
    <div className="mt-3">
      <div className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider mb-2.5">System Status</div>
      <div className="border border-zinc-800/60 bg-zinc-900/20 rounded-xl p-3 space-y-2">
        {services.map(({ key, label, icon: Icon }) => {
          const status = getStatus(key);
          return (
            <div key={key} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Icon size={12} className="text-zinc-500" />
                <span className="text-xs text-zinc-400">{label}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className={cn(
                  "inline-block w-1.5 h-1.5 rounded-full",
                  status === "up" ? "bg-emerald-400" : status === "down" ? "bg-red-400" : "bg-zinc-600"
                )} />
                <span className={cn(
                  "text-[10px] font-medium",
                  status === "up" ? "text-emerald-400" : status === "down" ? "text-red-400" : "text-zinc-600"
                )}>
                  {status === "up" ? "Healthy" : status === "down" ? "Down" : "N/A"}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
