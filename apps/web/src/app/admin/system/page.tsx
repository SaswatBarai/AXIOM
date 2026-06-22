"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";

interface SystemHealth {
  status: string;
  uptime: number;
  db: string;
  redis: string;
}

export default function AdminSystemPage() {
  const [health, setHealth] = useState<SystemHealth | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get("/health")
      .then(({ data }) => setHealth(data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-7 h-7 border-2 border-white/20 border-t-white rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-white mb-6">System Health</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="border border-zinc-800/60 bg-zinc-900/20 p-5 rounded-2xl">
          <div className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider">API Status</div>
          <div className="text-3xl font-extrabold text-emerald-400 mt-2">
            {health?.status ?? "Unknown"}
          </div>
        </div>
        <div className="border border-zinc-800/60 bg-zinc-900/20 p-5 rounded-2xl">
          <div className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider">Uptime</div>
          <div className="text-3xl font-extrabold text-white mt-2">
            {health?.uptime ? `${Math.floor(health.uptime / 3600)}h` : "-"}
          </div>
        </div>
        <div className="border border-zinc-800/60 bg-zinc-900/20 p-5 rounded-2xl">
          <div className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider">Database</div>
          <div className="text-3xl font-extrabold text-emerald-400 mt-2">
            {health?.db ?? "-"}
          </div>
        </div>
        <div className="border border-zinc-800/60 bg-zinc-900/20 p-5 rounded-2xl">
          <div className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider">Redis</div>
          <div className="text-3xl font-extrabold text-emerald-400 mt-2">
            {health?.redis ?? "-"}
          </div>
        </div>
      </div>
    </div>
  );
}
