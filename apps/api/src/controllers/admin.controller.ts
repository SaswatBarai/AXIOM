import type { Response, NextFunction } from "express";
import type { AuthRequest } from "../middleware/auth.middleware";
import { assertUserId } from "../middleware/auth.middleware";
import * as adminService from "../services/admin.service";
import { auditLog } from "../services/admin.service";
import { listUsers } from "../services/user.service";

function param(req: AuthRequest, name: string): string {
  const v = req.params[name];
  if (Array.isArray(v)) return v[0] ?? "";
  return v ?? "";
}

export async function listUsersHandler(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const page = Math.max(1, Number(req.query.page ?? 1));
    const limit = Math.min(100, Math.max(1, Number(req.query.limit ?? 20)));
    const result = await listUsers(page, limit);
    res.json({ data: result.users, total: result.total, page: result.page, limit: result.limit, pages: result.totalPages });
  } catch (err) { next(err); }
}

export async function getUserHandler(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const user = await adminService.getUserById(param(req, "id"));
    res.json({ user });
  } catch (err) { next(err); }
}

export async function changeRoleHandler(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const id = param(req, "id");
    const beforeUser = await adminService.getUserById(id);
    const user = await adminService.updateUserRole(id, req.body.role, assertUserId(req));
    await auditLog(assertUserId(req), "CHANGE_ROLE", "USER", id, { role: beforeUser.role }, { role: user.role }, req);
    res.json({ user });
  } catch (err) { next(err); }
}

export async function suspendUserHandler(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const id = param(req, "id");
    const user = await adminService.suspendUser(id);
    await auditLog(assertUserId(req), "SUSPEND_USER", "USER", id, { suspendedAt: null }, { suspendedAt: user.suspendedAt }, req);
    res.json({ user });
  } catch (err) { next(err); }
}

export async function unsuspendUserHandler(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const id = param(req, "id");
    const beforeUser = await adminService.getUserById(id);
    const user = await adminService.unsuspendUser(id);
    await auditLog(assertUserId(req), "UNSUSPEND_USER", "USER", id, { suspendedAt: beforeUser.suspendedAt }, { suspendedAt: null }, req);
    res.json({ user });
  } catch (err) { next(err); }
}

export async function deleteUserHandler(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const id = param(req, "id");
    const beforeUser = await adminService.getUserById(id);
    await adminService.deleteUser(id, assertUserId(req));
    await auditLog(assertUserId(req), "DELETE_USER", "USER", id, beforeUser, null, req);
    res.json({ success: true });
  } catch (err) { next(err); }
}

export async function getOverviewHandler(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const data = await adminService.getPlatformOverview();
    res.json(data);
  } catch (err) { next(err); }
}

export async function listAuditLogsHandler(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const page = Math.max(1, Number(req.query.page ?? 1));
    const limit = Math.min(100, Math.max(1, Number(req.query.limit ?? 20)));
    const result = await adminService.listAuditLogs(page, limit, {
      adminId: req.query.adminId as string | undefined,
      action: req.query.action as string | undefined,
      targetType: req.query.targetType as string | undefined,
      dateFrom: req.query.dateFrom as string | undefined,
      dateTo: req.query.dateTo as string | undefined,
    });
    res.json({ data: result.entries, total: result.total, page: result.page, limit: result.limit, pages: result.totalPages });
  } catch (err) { next(err); }
}
