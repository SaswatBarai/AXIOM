import { prisma } from "@axiom/database";
import { redis } from "./redis.service";
import { AppError } from "../middleware/errorHandler.middleware";
import type { Request } from "express";
import type { UserRole } from "@prisma/client";

export interface PaginatedAuditLog {
  entries: any[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export async function auditLog(
  adminId: string,
  action: string,
  targetType: string,
  targetId: string | undefined,
  before: any,
  after: any,
  req: Request | undefined
) {
  await prisma.auditLog.create({
    data: {
      adminId,
      action,
      targetType,
      targetId: targetId || null,
      before: before as any,
      after: after as any,
      ipAddress: (req as any)?.ip,
      userAgent: (req as any)?.headers?.["user-agent"],
    },
  });
}

export async function listAuditLogs(page: number, limit: number, filters?: any) {
  const skip = (page - 1) * limit;
  const where: any = {};

  if (filters?.adminId) where.adminId = filters.adminId;
  if (filters?.action) where.action = filters.action;
  if (filters?.targetType) where.targetType = filters.targetType;
  if (filters?.dateFrom || filters?.dateTo) {
    where.createdAt = {};
    if (filters.dateFrom) where.createdAt.gte = new Date(filters.dateFrom);
    if (filters.dateTo) where.createdAt.lte = new Date(filters.dateTo);
  }

  const [entries, total] = await Promise.all([
    prisma.auditLog.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
      include: { admin: { select: { id: true, name: true, email: true } } },
    }),
    prisma.auditLog.count({ where }),
  ]);

  return { entries, total, page, limit, totalPages: Math.ceil(total / limit) };
}

export async function getUserById(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true, email: true, name: true, role: true, avatarUrl: true,
      bio: true, location: true, currentTitle: true, yearsOfExp: true,
      emailVerified: true, suspendedAt: true, createdAt: true, updatedAt: true,
      preferences: true,
      resumes: { select: { id: true, fileName: true, version: true, createdAt: true } },
    },
  });
  if (!user) throw new AppError(404, "User not found");
  return user;
}

export async function updateUserRole(userId: string, role: string, adminId: string) {
  if (userId === adminId) throw new AppError(400, "Cannot change your own role");

  const targetUser = await prisma.user.findUnique({ where: { id: userId }, select: { role: true } });
  if (!targetUser) throw new AppError(404, "User not found");
  if (targetUser.role === "ADMIN" && role !== "ADMIN") {
    const adminCount = await prisma.user.count({ where: { role: "ADMIN" } });
    if (adminCount <= 1) throw new AppError(400, "Cannot demote the last admin");
  }

  return prisma.user.update({
    where: { id: userId },
    data: { role: role as UserRole },
    select: { id: true, email: true, name: true, role: true },
  });
}

export async function suspendUser(userId: string) {
  const existingUser = await prisma.user.findUnique({ where: { id: userId } });
  if (!existingUser) throw new AppError(404, "User not found");
  const user = await prisma.user.update({
    where: { id: userId },
    data: { suspendedAt: new Date() },
    select: { id: true, email: true, name: true, suspendedAt: true },
  });
  await redis.del("user:suspended:" + userId);
  return user;
}

export async function unsuspendUser(userId: string) {
  const existingUser = await prisma.user.findUnique({ where: { id: userId } });
  if (!existingUser) throw new AppError(404, "User not found");
  const user = await prisma.user.update({
    where: { id: userId },
    data: { suspendedAt: null },
    select: { id: true, email: true, name: true, suspendedAt: true },
  });
  await redis.del("user:suspended:" + userId);
  return user;
}

export async function deleteUser(userId: string, adminId: string) {
  if (userId === adminId) throw new AppError(400, "Cannot delete your own account");
  const user = await prisma.user.findUnique({ where: { id: userId }, select: { role: true } });
  if (!user) throw new AppError(404, "User not found");
  if (user.role === "ADMIN") throw new AppError(400, "Cannot delete an admin account");

  await prisma.user.delete({ where: { id: userId } });
  await redis.del("user:suspended:" + userId);
  return { success: true };
}

export async function getPlatformOverview() {
  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const weekStart = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

  const [totalUsers] = await Promise.all([
    prisma.user.count(),
  ]);

  const [
    premiumUsers, todaySignups, weekSignups, monthSignups, activeUsers,
    totalJobs, totalApplications
  ] = await Promise.all([
    prisma.user.count({ where: { role: "PREMIUM" } }),
    prisma.user.count({ where: { createdAt: { gte: todayStart } } }),
    prisma.user.count({ where: { createdAt: { gte: weekStart } } }),
    prisma.user.count({ where: { createdAt: { gte: monthStart } } }),
    prisma.user.count({ where: { updatedAt: { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } } }),
    prisma.job.count(),
    prisma.application.count(),
  ]);

  return {
    totalUsers,
    premiumUsers,
    todaySignups,
    weekSignups,
    monthSignups,
    activeUsers,
    totalJobs,
    totalApplications,
  };
}
