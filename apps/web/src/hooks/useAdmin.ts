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

export async function fetchAuditLogs(
  page = 1,
  limit = 20,
  filters?: { adminId?: string; action?: string; targetType?: string; dateFrom?: string; dateTo?: string }
): Promise<PaginatedResult<AdminAuditLog>> {
  const { data } = await api.get("/admin/audit", { params: { page, limit, ...filters } });
  return data;
}
