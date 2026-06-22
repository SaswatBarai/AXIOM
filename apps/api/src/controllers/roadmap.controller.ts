import type { Response, NextFunction } from "express";
import type { AuthRequest } from "../middleware/auth.middleware";
import * as roadmapService from "../services/roadmap.service";

export async function generateHandler(
  req: AuthRequest, res: Response, next: NextFunction,
): Promise<void> {
  try {
    const { targetRole, gapReport, weeks } = req.body as {
      targetRole: string;
      gapReport:  Record<string, unknown>;
      weeks:      number;
    };
    const result = await roadmapService.generateRoadmap(req.userId!, targetRole, gapReport ?? {}, weeks ?? 12);
    res.status(201).json(result);
  } catch (err) { next(err); }
}

export async function listHandler(
  req: AuthRequest, res: Response, next: NextFunction,
): Promise<void> {
  try {
    const roadmaps = await roadmapService.listRoadmaps(req.userId!);
    res.json({ roadmaps });
  } catch (err) { next(err); }
}

export async function getHandler(
  req: AuthRequest, res: Response, next: NextFunction,
): Promise<void> {
  try {
    const id      = req.params["roadmapId"] as string;
    const roadmap = await roadmapService.getRoadmap(req.userId!, id);
    res.json({ roadmap });
  } catch (err) { next(err); }
}

export async function markStepHandler(
  req: AuthRequest, res: Response, next: NextFunction,
): Promise<void> {
  try {
    const id   = req.params["roadmapId"] as string;
    const week = Number(req.params["week"]);
    const { done } = req.body as { done: boolean };
    const result = await roadmapService.markStep(req.userId!, id, week, done);
    res.json(result);
  } catch (err) { next(err); }
}

export async function deleteHandler(
  req: AuthRequest, res: Response, next: NextFunction,
): Promise<void> {
  try {
    const id = req.params["roadmapId"] as string;
    await roadmapService.deleteRoadmap(req.userId!, id);
    res.json({ message: "Roadmap deleted" });
  } catch (err) { next(err); }
}
