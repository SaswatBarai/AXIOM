import { prisma, Prisma } from "@axiom/database";
import { AppError } from "../middleware/errorHandler.middleware";
import type { Server as SocketServer } from "socket.io";

let io: SocketServer | null = null;

export function setSocketServer(server: SocketServer) {
  io = server;
}

// ── Create ────────────────────────────────────────────────────────────────────

export async function createNotification(
  userId:  string,
  type:    string,
  payload: Record<string, unknown> = {},
) {
  const notification = await prisma.notification.create({
    data: { userId, type, payload: payload as Prisma.InputJsonValue },
  });
  // Push to user's Socket.IO room
  io?.to(`user:${userId}`).emit("notification", notification);
  return notification;
}

// ── List (unread-first, max 50) ───────────────────────────────────────────────

export async function listNotifications(userId: string) {
  return prisma.notification.findMany({
    where:   { userId },
    orderBy: [{ readAt: "asc" }, { createdAt: "desc" }],
    take:    50,
  });
}

// ── Retention: delete read notifications older than 90 days ──────────────────

export async function deleteStaleNotifications(): Promise<number> {
  const cutoff = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);
  const result = await prisma.notification.deleteMany({
    where: {
      readAt: { not: null },
      createdAt: { lt: cutoff },
    },
  });
  return result.count;
}

// ── Mark read ─────────────────────────────────────────────────────────────────

export async function markRead(userId: string, notificationId: string) {
  const n = await prisma.notification.findUnique({ where: { id: notificationId } });
  if (!n || n.userId !== userId) throw new AppError(404, "Notification not found");
  return prisma.notification.update({
    where: { id: notificationId },
    data:  { readAt: new Date() },
  });
}

export async function markAllRead(userId: string) {
  await prisma.notification.updateMany({
    where: { userId, readAt: null },
    data:  { readAt: new Date() },
  });
}

export async function unreadCount(userId: string): Promise<number> {
  return prisma.notification.count({ where: { userId, readAt: null } });
}

// ── Job Alerts ────────────────────────────────────────────────────────────────

export interface AlertFilters {
  keywords?: string;
  location?: string;
  jobType?:  string;
  remote?:   boolean;
}

export async function createAlert(
  userId:    string,
  name:      string,
  filters:   AlertFilters,
  frequency: "instant" | "daily" | "weekly" = "daily",
) {
  return prisma.jobAlert.create({ data: { userId, name, filters: filters as Prisma.InputJsonValue, frequency } });
}

export async function listAlerts(userId: string) {
  return prisma.jobAlert.findMany({ where: { userId }, orderBy: { createdAt: "desc" } });
}

export async function updateAlert(
  userId:  string,
  alertId: string,
  patch:   Partial<{ name: string; filters: AlertFilters; frequency: string; active: boolean }>,
) {
  const alert = await prisma.jobAlert.findUnique({ where: { id: alertId } });
  if (!alert || alert.userId !== userId) throw new AppError(404, "Alert not found");
  const { filters: f, ...rest } = patch;
  return prisma.jobAlert.update({
    where: { id: alertId },
    data:  f !== undefined ? { ...rest, filters: f as Prisma.InputJsonValue } : rest,
  });
}

export async function deleteAlert(userId: string, alertId: string) {
  const alert = await prisma.jobAlert.findUnique({ where: { id: alertId } });
  if (!alert || alert.userId !== userId) throw new AppError(404, "Alert not found");
  await prisma.jobAlert.delete({ where: { id: alertId } });
}

// dispatchJobAlerts lives in queue.service to avoid a circular import
// (queue.service already imports notification.service for createNotification)
