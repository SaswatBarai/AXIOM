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
      <div className="text-[10px] font-semibold text-text-muted uppercase tracking-wider mb-2.5">System Status</div>
      <div className="border border-border-subtle bg-bg-card/25 rounded-xl p-3 space-y-2">
        {services.map(({ key, label, icon: Icon }) => {
          const status = getStatus(key);
          return (
            <div key={key} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Icon size={12} className="text-text-muted" />
                <span className="text-xs text-text-secondary">{label}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className={cn(
                  "inline-block w-1.5 h-1.5 rounded-full",
                  status === "up" ? "bg-emerald-500" : status === "down" ? "bg-red-500" : "bg-text-muted"
                )} />
                <span className={cn(
                  "text-[10px] font-medium",
                  status === "up" ? "text-emerald-500" : status === "down" ? "text-red-500" : "text-text-muted"
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
