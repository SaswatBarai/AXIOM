import type { Response, NextFunction } from "express";
import type { AuthRequest } from "../middleware/auth.middleware";
import { assertUserId } from "../middleware/auth.middleware";
import * as jobService from "../services/job.service";
import type { JobSearchInput, ScrapeRunInput } from "../utils/schemas";

export async function searchJobsHandler(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const input = res.locals["validatedQuery"] as JobSearchInput;
    const result = await jobService.searchJobs(input, req.userId);
    res.json(result);
  } catch (err) { next(err); }
}

export async function getJobHandler(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const job = await jobService.getJob(req.params["id"] as string);
    res.json({ job });
  } catch (err) { next(err); }
}

export async function saveJobHandler(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const result = await jobService.saveJob(assertUserId(req), req.params["id"] as string);
    res.status(201).json(result);
  } catch (err) { next(err); }
}

export async function unsaveJobHandler(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const result = await jobService.unsaveJob(assertUserId(req), req.params["id"] as string);
    res.json(result);
  } catch (err) { next(err); }
}

export async function listSavedJobsHandler(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const page     = Math.max(1, Number(req.query["page"])     || 1);
    const pageSize = Math.min(50, Math.max(1, Number(req.query["pageSize"]) || 20));
    const result = await jobService.listSavedJobs(assertUserId(req), page, pageSize);
    res.json(result);
  } catch (err) { next(err); }
}

export async function runScrapeHandler(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const input = req.body as ScrapeRunInput;
    const summary = await jobService.runScrape(input);
    res.json({ summary });
  } catch (err) { next(err); }
}

export async function getRecommendedJobsHandler(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const limit = Math.min(50, Math.max(1, Number(req.query["limit"]) || 20));
    const recommended = await jobService.getRecommendedJobs(assertUserId(req), limit);
    res.json(recommended);
  } catch (err) { next(err); }
}

export async function matchSingleJobHandler(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const match = await jobService.matchSingleJob(assertUserId(req), req.params["id"] as string);
    res.json(match);
  } catch (err) { next(err); }
}
