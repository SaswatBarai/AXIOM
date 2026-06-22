import type { Response, NextFunction } from "express";
import type { AuthRequest } from "../middleware/auth.middleware";
import * as notifService from "../services/notification.service";

export async function listHandler(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const notifications = await notifService.listNotifications(req.userId!);
    const count         = await notifService.unreadCount(req.userId!);
    res.json({ notifications, unreadCount: count });
  } catch (err) { next(err); }
}

export async function markReadHandler(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const id = req.params["id"] as string;
    const n  = await notifService.markRead(req.userId!, id);
    res.json({ notification: n });
  } catch (err) { next(err); }
}

export async function markAllReadHandler(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    await notifService.markAllRead(req.userId!);
    res.json({ message: "All notifications marked as read" });
  } catch (err) { next(err); }
}

// ── Job Alerts ────────────────────────────────────────────────────────────────

export async function createAlertHandler(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const { name, filters, frequency } = req.body as {
      name: string; filters: notifService.AlertFilters; frequency: "instant" | "daily" | "weekly";
    };
    const alert = await notifService.createAlert(req.userId!, name, filters ?? {}, frequency ?? "daily");
    res.status(201).json({ alert });
  } catch (err) { next(err); }
}

export async function listAlertsHandler(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const alerts = await notifService.listAlerts(req.userId!);
    res.json({ alerts });
  } catch (err) { next(err); }
}

export async function updateAlertHandler(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const id    = req.params["alertId"] as string;
    const alert = await notifService.updateAlert(req.userId!, id, req.body as Parameters<typeof notifService.updateAlert>[2]);
    res.json({ alert });
  } catch (err) { next(err); }
}

export async function deleteAlertHandler(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const id = req.params["alertId"] as string;
    await notifService.deleteAlert(req.userId!, id);
    res.json({ message: "Alert deleted" });
  } catch (err) { next(err); }
}
