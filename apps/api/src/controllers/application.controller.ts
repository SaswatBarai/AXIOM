import type { Response, NextFunction } from "express";
import type { AuthRequest } from "../middleware/auth.middleware";
import { assertUserId } from "../middleware/auth.middleware";
import * as applicationService from "../services/application.service";
import type { ApplicationStatus } from "@axiom/database";

export async function createApplicationHandler(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const { jobId, status, note } = req.body;
    const application = await applicationService.createApplication(
      assertUserId(req),
      jobId,
      status,
      note
    );
    res.status(201).json({ application });
  } catch (err) {
    next(err);
  }
}

export async function listApplicationsHandler(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const query = (res.locals["validatedQuery"] || {}) as { status?: string; dateFrom?: string; dateTo?: string };
    const { status, dateFrom, dateTo } = query;
    const page = Math.max(1, Number(req.query.page) || 1);
    const pageSize = Math.min(50, Math.max(1, Number(req.query.pageSize) || 20));
    const result = await applicationService.listApplications(
      assertUserId(req),
      status as ApplicationStatus | undefined,
      dateFrom,
      dateTo,
      page,
      pageSize
    );
    res.json(result);
  } catch (err) {
    next(err);
  }
}

export async function getApplicationHandler(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const application = await applicationService.getApplication(
      req.params["id"] as string,
      assertUserId(req)
    );
    res.json({ application });
  } catch (err) {
    next(err);
  }
}

export async function updateApplicationHandler(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const application = await applicationService.updateApplication(
      req.params["id"] as string,
      assertUserId(req),
      req.body
    );
    res.json({ application });
  } catch (err) {
    next(err);
  }
}

export async function deleteApplicationHandler(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const result = await applicationService.deleteApplication(
      req.params["id"] as string,
      assertUserId(req)
    );
    res.json(result);
  } catch (err) {
    next(err);
  }
}

export async function getStatsHandler(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const stats = await applicationService.getStats(assertUserId(req));
    res.json({ stats });
  } catch (err) {
    next(err);
  }
}
