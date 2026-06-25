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
        <div className="w-7 h-7 border-2 border-border-subtle border-t-brand rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-text-primary">Audit Log</h1>
        <div className="flex items-center gap-3">
          <input
            value={actionFilter}
            onChange={(e) => { setActionFilter(e.target.value); setPage(1); }}
            placeholder="Filter by action..."
            className="h-9 px-3 rounded-md bg-bg-card border border-border-subtle text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-1 focus:ring-brand/50 focus:border-brand/50 transition-colors w-52"
          />
          <button
            onClick={load}
            className="border border-border-subtle bg-bg-card/40 hover:bg-bg-hover text-text-primary text-xs px-4 py-2 rounded-md transition-colors cursor-pointer"
          >
            Refresh
          </button>
        </div>
      </div>

      <div className="border border-border-subtle bg-bg-card/25 rounded-2xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border-subtle text-text-secondary text-xs uppercase tracking-wider">
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
                className="border-b border-border-subtle/50 hover:bg-bg-hover transition-colors"
              >
                <td className="py-3 px-4 text-text-muted text-xs whitespace-nowrap">
                  {new Date(log.createdAt).toLocaleString()}
                </td>
                <td className="py-3 px-4 text-text-primary font-medium">
                  {log.admin?.name ?? log.adminId}
                </td>
                <td className="py-3 px-4">
                  <span className="inline-flex items-center text-xs font-medium text-brand bg-brand/10 rounded px-2 py-0.5 border border-brand/20">
                    {log.action}
                  </span>
                </td>
                <td className="py-3 px-4 text-text-secondary text-xs">
                  {log.targetType} / {log.targetId.slice(0, 8)}...
                </td>
                <td className="py-3 px-4 text-text-muted text-xs font-mono">
                  {log.ipAddress ?? "-"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {result && result.pages > 1 && (
        <div className="flex items-center justify-center gap-4 mt-6 animate-none">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="border border-border-subtle bg-bg-card/40 hover:bg-bg-hover text-text-primary text-xs px-4 py-2 rounded-md disabled:opacity-40 transition-colors cursor-pointer"
          >
            Previous
          </button>
          <span className="text-xs text-text-muted">
            Page {page} of {result.pages}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(result.pages, p + 1))}
            disabled={page === result.pages}
            className="border border-border-subtle bg-bg-card/40 hover:bg-bg-hover text-text-primary text-xs px-4 py-2 rounded-md disabled:opacity-40 transition-colors cursor-pointer"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
