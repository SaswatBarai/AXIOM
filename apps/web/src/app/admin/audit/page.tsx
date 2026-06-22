"use client";

import { useEffect, useState, useCallback } from "react";
import { fetchAuditLogs, type AdminAuditLog, type PaginatedResult } from "@/hooks/useAdmin";

export default function AdminAuditPage() {
  const [result, setResult] = useState<PaginatedResult<AdminAuditLog> | null>(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [actionFilter, setActionFilter] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchAuditLogs(page, 20, actionFilter ? { action: actionFilter } : undefined);
      setResult(data);
    } catch {
    } finally {
      setLoading(false);
    }
  }, [page, actionFilter]);

  useEffect(() => {
    load();
  }, [load]);

  if (loading && !result) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-7 h-7 border-2 border-white/20 border-t-white rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-white">Audit Log</h1>
        <div className="flex items-center gap-3">
          <input
            value={actionFilter}
            onChange={(e) => { setActionFilter(e.target.value); setPage(1); }}
            placeholder="Filter by action..."
            className="h-9 px-3 rounded-md bg-zinc-900 border border-zinc-800 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:ring-1 focus:ring-brand/50 focus:border-brand/50 transition-colors w-52"
          />
          <button
            onClick={load}
            className="border border-zinc-700 bg-zinc-900/40 hover:bg-zinc-800/60 text-zinc-200 text-xs px-4 py-2 rounded-md transition-colors"
          >
            Refresh
          </button>
        </div>
      </div>

      <div className="border border-zinc-800/60 bg-zinc-900/20 rounded-2xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-zinc-800 text-zinc-500 text-xs uppercase tracking-wider">
              <th className="text-left py-3 px-4">Time</th>
              <th className="text-left py-3 px-4">Admin</th>
              <th className="text-left py-3 px-4">Action</th>
              <th className="text-left py-3 px-4">Target</th>
              <th className="text-left py-3 px-4">IP</th>
            </tr>
          </thead>
          <tbody>
            {result?.data.map((log) => (
              <tr
                key={log.id}
                className="border-b border-zinc-900 hover:bg-zinc-900/40 transition-colors"
              >
                <td className="py-3 px-4 text-zinc-500 text-xs whitespace-nowrap">
                  {new Date(log.createdAt).toLocaleString()}
                </td>
                <td className="py-3 px-4 text-white font-medium">
                  {log.admin?.name ?? log.adminId}
                </td>
                <td className="py-3 px-4">
                  <span className="inline-flex items-center text-xs font-medium text-brand bg-brand/10 rounded px-2 py-0.5">
                    {log.action}
                  </span>
                </td>
                <td className="py-3 px-4 text-zinc-400 text-xs">
                  {log.targetType} / {log.targetId.slice(0, 8)}...
                </td>
                <td className="py-3 px-4 text-zinc-600 text-xs font-mono">
                  {log.ipAddress ?? "-"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {result && result.pages > 1 && (
        <div className="flex items-center justify-center gap-4 mt-6">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="border border-zinc-700 bg-zinc-900/40 hover:bg-zinc-800/60 text-zinc-200 text-xs px-4 py-2 rounded-md disabled:opacity-40 transition-colors"
          >
            Previous
          </button>
          <span className="text-xs text-zinc-500">
            Page {page} of {result.pages}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(result.pages, p + 1))}
            disabled={page === result.pages}
            className="border border-zinc-700 bg-zinc-900/40 hover:bg-zinc-800/60 text-zinc-200 text-xs px-4 py-2 rounded-md disabled:opacity-40 transition-colors"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
