import { api } from "@/lib/api";

export interface AdminOverview {
  totalUsers: number;
  premiumUsers: number;
  todaySignups: number;
  weekSignups: number;
  monthSignups: number;
  activeUsers: number;
  totalJobs: number;
  totalApplications: number;
}

export interface AdminUser {
  id: string;
  email: string;
  name: string;
  role: string;
  avatarUrl?: string;
  suspendedAt?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface AdminAuditLog {
  id: string;
  adminId: string;
  admin?: { name: string; email: string };
  action: string;
  targetType: string;
  targetId: string;
  before: unknown;
  after: unknown;
  ipAddress?: string;
  createdAt: string;
}

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  pages: number;
}

export async function fetchOverview(): Promise<AdminOverview> {
  const { data } = await api.get("/admin/analytics/overview");
  return data;
}

export async function fetchUsers(
  page = 1,
  limit = 20
): Promise<PaginatedResult<AdminUser>> {
  const { data } = await api.get("/admin/users", { params: { page, limit } });
  return data;
}

export async function fetchUser(id: string): Promise<{ user: AdminUser }> {
  const { data } = await api.get(`/admin/users/${id}`);
  return data;
}

export async function changeUserRole(id: string, role: string): Promise<{ user: AdminUser }> {
  const { data } = await api.patch(`/admin/users/${id}/role`, { role });
  return data;
}

export async function suspendUser(id: string): Promise<{ user: AdminUser }> {
  const { data } = await api.patch(`/admin/users/${id}/suspend`);
  return data;
}

export async function unsuspendUser(id: string): Promise<{ user: AdminUser }> {
  const { data } = await api.patch(`/admin/users/${id}/unsuspend`);
  return data;
}

export async function deleteUser(id: string): Promise<{ success: boolean }> {
  const { data } = await api.delete(`/admin/users/${id}`);
  return data;
}

export interface SystemHealth {
  status: string;
  uptime: number;
  db: string;
  redis: string;
}

export interface RecentActivityItem {
  id: string;
  type: "new_user" | "premium_upgrade" | "application";
  label: string;
  timestamp: string;
}

export async function fetchSystemHealth(): Promise<SystemHealth> {
  const { data } = await api.get("/health");
  return data;
}

export function generateTrendData(days: number, peak: number): { day: string; value: number }[] {
  const data: { day: string; value: number }[] = [];
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const day = d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
    const variance = 0.6 + Math.random() * 0.8;
    const value = Math.max(0, Math.round((peak / days) * variance * (1 + (days - i) / days)));
    data.push({ day, value });
  }
  return data;
}

export function generateActivityFromOverview(overview: AdminOverview): RecentActivityItem[] {
  const items: RecentActivityItem[] = [];
  const now = Date.now();
  for (let i = 0; i < Math.min(overview.todaySignups, 5); i++) {
    items.push({
      id: `new-user-${i}`,
      type: "new_user",
      label: "New user registered",
      timestamp: new Date(now - i * 60000 * 30).toISOString(),
    });
  }
  for (let i = 0; i < Math.min(Math.round(overview.premiumUsers * 0.1), 3); i++) {
    items.push({
      id: `upgrade-${i}`,
      type: "premium_upgrade",
      label: "User upgraded to Premium",
      timestamp: new Date(now - i * 60000 * 120).toISOString(),
    });
  }
  const apps = Math.min(overview.totalApplications - overview.totalApplications * 0.9, 4);
  for (let i = 0; i < Math.max(0, Math.round(apps)); i++) {
    items.push({
      id: `app-${i}`,
      type: "application",
      label: "New application submitted",
      timestamp: new Date(now - i * 60000 * 60).toISOString(),
    });
  }
  return items.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
}

export async function fetchAuditLogs(
  page = 1,
  limit = 20,
  filters?: { adminId?: string; action?: string; targetType?: string; dateFrom?: string; dateTo?: string }
): Promise<PaginatedResult<AdminAuditLog>> {
  const { data } = await api.get("/admin/audit", { params: { page, limit, ...filters } });
  return data;
}
