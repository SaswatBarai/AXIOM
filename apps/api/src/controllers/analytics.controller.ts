import type { Response, NextFunction } from "express";
import type { AuthRequest } from "../middleware/auth.middleware";
import * as analyticsService from "../services/analytics.service";

function parseRange(raw: unknown): number {
  const n = Number(raw);
  if ([30, 90].includes(n)) return n;
  return 0; // 0 = all time
}

export async function overviewHandler(
  req: AuthRequest, res: Response, next: NextFunction,
): Promise<void> {
  try {
    const data = await analyticsService.getOverview(req.userId!, parseRange(req.query["range"]));
    res.json(data);
  } catch (err) { next(err); }
}

export async function atsTrendHandler(
  req: AuthRequest, res: Response, next: NextFunction,
): Promise<void> {
  try {
    const data = await analyticsService.getAtsTrend(req.userId!);
    res.json({ trend: data });
  } catch (err) { next(err); }
}

export async function applicationsMonthlyHandler(
  req: AuthRequest, res: Response, next: NextFunction,
): Promise<void> {
  try {
    const data = await analyticsService.getApplicationsMonthly(req.userId!, parseRange(req.query["range"]));
    res.json({ monthly: data });
  } catch (err) { next(err); }
}

export async function skillsDemandHandler(
  req: AuthRequest, res: Response, next: NextFunction,
): Promise<void> {
  try {
    const data = await analyticsService.getSkillsDemand(req.userId!);
    res.json({ skills: data });
  } catch (err) { next(err); }
}

export async function funnelHandler(
  req: AuthRequest, res: Response, next: NextFunction,
): Promise<void> {
  try {
    const data = await analyticsService.getApplicationFunnel(req.userId!);
    res.json({ funnel: data });
  } catch (err) { next(err); }
}
