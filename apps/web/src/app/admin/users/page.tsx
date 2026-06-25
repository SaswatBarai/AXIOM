"use client";

import { useEffect, useState, useCallback } from "react";
import {
  fetchUsers,
  changeUserRole,
  suspendUser,
  unsuspendUser,
  deleteUser,
  type AdminUser,
  type PaginatedResult,
} from "@/hooks/useAdmin";

export default function AdminUsersPage() {
  const [result, setResult] = useState<PaginatedResult<AdminUser> | null>(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchUsers(page, 20);
      setResult(data);
    } catch {
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => {
    load();
  }, [load]);

  async function handleRoleChange(id: string, role: string) {
    try {
      await changeUserRole(id, role);
      load();
    } catch {
      alert("Failed to change role");
    }
  }

  async function handleSuspend(id: string) {
    if (!confirm("Suspend this user?")) return;
    try {
      await suspendUser(id);
      load();
    } catch {
      alert("Failed to suspend user");
    }
  }

  async function handleUnsuspend(id: string) {
    try {
      await unsuspendUser(id);
      load();
    } catch {
      alert("Failed to unsuspend user");
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Permanently delete this user? This cannot be undone.")) return;
    try {
      await deleteUser(id);
      load();
    } catch {
      alert("Failed to delete user");
    }
  }

  if (loading && !result) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-7 h-7 border-2 border-border-subtle border-t-brand rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-text-primary mb-6">Users</h1>

      <div className="border border-border-subtle bg-bg-card/25 rounded-2xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border-subtle text-text-secondary text-xs uppercase tracking-wider">
              <th className="text-left py-3 px-4">Name</th>
              <th className="text-left py-3 px-4">Email</th>
              <th className="text-left py-3 px-4">Role</th>
              <th className="text-left py-3 px-4">Status</th>
              <th className="text-left py-3 px-4">Joined</th>
              <th className="text-right py-3 px-4">Actions</th>
            </tr>
          </thead>
          <tbody>
            {result?.data.map((u) => (
              <tr
                key={u.id}
                className="border-b border-border-subtle/50 hover:bg-bg-hover transition-colors"
              >
                <td className="py-3 px-4 text-text-primary font-medium">{u.name}</td>
                <td className="py-3 px-4 text-text-secondary">{u.email}</td>
                <td className="py-3 px-4">
                  <select
                    value={u.role}
                    onChange={(e) => handleRoleChange(u.id, e.target.value)}
                    className="bg-bg-card border border-border-subtle rounded-md text-xs text-text-primary px-2 py-1 focus:outline-none focus:ring-1 focus:ring-brand/50 cursor-pointer"
                  >
                    <option value="USER" className="bg-bg-card text-text-primary">USER</option>
                    <option value="PREMIUM" className="bg-bg-card text-text-primary">PREMIUM</option>
                    <option value="ADMIN" className="bg-bg-card text-text-primary">ADMIN</option>
                  </select>
                </td>
                <td className="py-3 px-4">
                  {u.suspendedAt ? (
                    <span className="inline-flex items-center text-xs font-medium text-red-500 bg-red-500/10 rounded px-2 py-0.5">
                      Suspended
                    </span>
                  ) : (
                    <span className="inline-flex items-center text-xs font-medium text-emerald-500 bg-emerald-500/10 rounded px-2 py-0.5">
                      Active
                    </span>
                  )}
                </td>
                <td className="py-3 px-4 text-text-muted text-xs">
                  {new Date(u.createdAt).toLocaleDateString()}
                </td>
                <td className="py-3 px-4 text-right">
                  <div className="flex items-center justify-end gap-2">
                    {u.suspendedAt ? (
                      <button
                        onClick={() => handleUnsuspend(u.id)}
                        className="text-xs text-emerald-500 hover:text-emerald-500/80 transition-colors cursor-pointer"
                      >
                        Unsuspend
                      </button>
                    ) : (
                      <button
                        onClick={() => handleSuspend(u.id)}
                        className="text-xs text-amber-500 hover:text-amber-500/80 transition-colors cursor-pointer"
                      >
                        Suspend
                      </button>
                    )}
                    <button
                      onClick={() => handleDelete(u.id)}
                      className="text-xs text-red-500 hover:text-red-500/80 transition-colors cursor-pointer"
                    >
                      Delete
                    </button>
                  </div>
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
