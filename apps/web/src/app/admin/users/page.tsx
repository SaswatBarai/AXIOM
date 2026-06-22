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
        <div className="w-7 h-7 border-2 border-white/20 border-t-white rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-white mb-6">Users</h1>

      <div className="border border-zinc-800/60 bg-zinc-900/20 rounded-2xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-zinc-800 text-zinc-500 text-xs uppercase tracking-wider">
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
                className="border-b border-zinc-900 hover:bg-zinc-900/40 transition-colors"
              >
                <td className="py-3 px-4 text-white font-medium">{u.name}</td>
                <td className="py-3 px-4 text-zinc-400">{u.email}</td>
                <td className="py-3 px-4">
                  <select
                    value={u.role}
                    onChange={(e) => handleRoleChange(u.id, e.target.value)}
                    className="bg-zinc-900 border border-zinc-800 rounded-md text-xs text-white px-2 py-1 focus:outline-none focus:ring-1 focus:ring-brand/50"
                  >
                    <option value="USER">USER</option>
                    <option value="PREMIUM">PREMIUM</option>
                    <option value="ADMIN">ADMIN</option>
                  </select>
                </td>
                <td className="py-3 px-4">
                  {u.suspendedAt ? (
                    <span className="inline-flex items-center text-xs font-medium text-red-400 bg-red-500/10 rounded px-2 py-0.5">
                      Suspended
                    </span>
                  ) : (
                    <span className="inline-flex items-center text-xs font-medium text-emerald-400 bg-emerald-500/10 rounded px-2 py-0.5">
                      Active
                    </span>
                  )}
                </td>
                <td className="py-3 px-4 text-zinc-500 text-xs">
                  {new Date(u.createdAt).toLocaleDateString()}
                </td>
                <td className="py-3 px-4 text-right">
                  <div className="flex items-center justify-end gap-2">
                    {u.suspendedAt ? (
                      <button
                        onClick={() => handleUnsuspend(u.id)}
                        className="text-xs text-emerald-400 hover:text-emerald-300 transition-colors"
                      >
                        Unsuspend
                      </button>
                    ) : (
                      <button
                        onClick={() => handleSuspend(u.id)}
                        className="text-xs text-orange-400 hover:text-orange-300 transition-colors"
                      >
                        Suspend
                      </button>
                    )}
                    <button
                      onClick={() => handleDelete(u.id)}
                      className="text-xs text-red-400 hover:text-red-300 transition-colors"
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
