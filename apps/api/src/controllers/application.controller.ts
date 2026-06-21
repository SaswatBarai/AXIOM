import type { Response, NextFunction } from "express";
import type { AuthRequest } from "../middleware/auth.middleware";
import * as applicationService from "../services/application.service";

export async function createApplicationHandler(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const { jobId, status, note } = req.body;
    const application = await applicationService.createApplication(
      req.userId!,
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
    const query = res.locals["validatedQuery"] || {};
    const { status, dateFrom, dateTo } = query;
    const applications = await applicationService.listApplications(
      req.userId!,
      status,
      dateFrom,
      dateTo
    );
    res.json({ applications });
  } catch (err) {
    next(err);
  }
}

export async function getApplicationHandler(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const application = await applicationService.getApplication(
      req.params["id"] as string,
      req.userId!
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
      req.userId!,
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
      req.userId!
    );
    res.json(result);
  } catch (err) {
    next(err);
  }
}

export async function getStatsHandler(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const stats = await applicationService.getStats(req.userId!);
    res.json({ stats });
  } catch (err) {
    next(err);
  }
}
