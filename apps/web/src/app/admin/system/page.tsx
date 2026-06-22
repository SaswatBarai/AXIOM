"use client";

import { useEffect, useState, useCallback } from "react";
import { RefreshCw, Activity, Database, Server, Clock, Wifi } from "lucide-react";
import { api } from "@/lib/api";
import { cn } from "@/lib/utils";

interface SystemHealth {
  status: string;
  uptime: number;
  db: string;
  redis: string;
}

function StatusDot({ status }: { status: string }) {
  return (
    <span
      className={cn(
        "inline-block w-2 h-2 rounded-full",
        status === "up" || status === "ok" ? "bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.4)]" : "bg-red-400 shadow-[0_0_6px_rgba(248,113,113,0.4)]"
      )}
    />
  );
}

function formatUptime(seconds: number): string {
  const d = Math.floor(seconds / 86400);
  const h = Math.floor((seconds % 86400) / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const parts: string[] = [];
  if (d > 0) parts.push(`${d}d`);
  if (h > 0) parts.push(`${h}h`);
  parts.push(`${m}m`);
  return parts.join(" ");
}

const services = [
  { key: "status" as const, label: "API", icon: Server, desc: "Application server status" },
  { key: "db" as const,     label: "Database", icon: Database, desc: "PostgreSQL connection" },
  { key: "redis" as const,  label: "Redis", icon: Wifi, desc: "Cache & session store" },
];

export default function AdminSystemPage() {
  const [health, setHealth] = useState<SystemHealth | null>(null);
  const [loading, setLoading] = useState(true);

  const fetch = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/health");
      setHealth(data);
    } catch {
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetch(); }, [fetch]);

  return (
    <div className="max-w-4xl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white">System Health</h1>
          <p className="text-sm text-zinc-500 mt-1">Monitor platform services and uptime</p>
        </div>
        <button
          onClick={fetch}
          disabled={loading}
          className="flex items-center gap-2 border border-zinc-700 bg-zinc-900/40 hover:bg-zinc-800/60 text-zinc-200 text-xs px-4 py-2 rounded-md transition-colors disabled:opacity-50"
        >
          <RefreshCw size={14} className={cn(loading && "animate-spin")} />
          Refresh
        </button>
      </div>

      {/* Overall status banner */}
      <div
        className={cn(
          "border rounded-2xl p-5 mb-6 flex items-center gap-4",
          health?.status === "ok"
            ? "border-emerald-500/20 bg-emerald-500/5"
            : "border-red-500/20 bg-red-500/5"
        )}
      >
        <div
          className={cn(
            "w-10 h-10 rounded-xl flex items-center justify-center shrink-0",
            health?.status === "ok" ? "bg-emerald-500/10 text-emerald-400" : "bg-red-500/10 text-red-400"
          )}
        >
          <Activity size={20} />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-white">
              {health ? (health.status === "ok" ? "All Systems Operational" : "Degraded") : "Loading..."}
            </span>
            {health && <StatusDot status={health.status} />}
          </div>
          <p className="text-xs text-zinc-500 mt-0.5">
            {health
              ? health.status === "ok"
                ? "All services are running normally"
                : "One or more services are experiencing issues"
              : "Checking service status..."}
          </p>
        </div>
        {health?.uptime && (
          <div className="ml-auto text-right hidden sm:block">
            <div className="text-xs text-zinc-500 font-medium uppercase tracking-wider">Uptime</div>
            <div className="text-sm text-white font-semibold mt-0.5">
              <Clock size={13} className="inline mr-1 text-zinc-500" />
              {formatUptime(health.uptime)}
            </div>
          </div>
        )}
      </div>

      {/* Service cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {services.map(({ key, label, icon: Icon, desc }) => {
          const val = health?.[key];
          const up = val === "up" || val === "ok";
          return (
            <div
              key={key}
              className="border border-zinc-800/60 bg-zinc-900/20 p-5 rounded-2xl hover:bg-zinc-900/30 transition-colors"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="w-9 h-9 rounded-lg bg-zinc-800/50 border border-zinc-700/30 flex items-center justify-center">
                  <Icon size={16} className="text-zinc-400" />
                </div>
                <span
                  className={cn(
                    "inline-flex items-center gap-1.5 text-[11px] font-medium px-2.5 py-1 rounded-full",
                    up ? "text-emerald-400 bg-emerald-500/10" : "text-red-400 bg-red-500/10"
                  )}
                >
                  <StatusDot status={val ?? ""} />
                  {up ? "Online" : "Offline"}
                </span>
              </div>
              <h3 className="text-sm font-semibold text-white">{label}</h3>
              <p className="text-xs text-zinc-500 mt-1">{desc}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
