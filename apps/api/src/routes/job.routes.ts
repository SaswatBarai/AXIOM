import { Router, type IRouter } from "express";
import { requireAuth, requireRole } from "../middleware/auth.middleware";
import { validate, validateQuery } from "../middleware/validate.middleware";
import { jobSearchSchema, scrapeRunSchema } from "../utils/schemas";
import {
  searchJobsHandler,
  getJobHandler,
  saveJobHandler,
  unsaveJobHandler,
  listSavedJobsHandler,
  runScrapeHandler,
  getRecommendedJobsHandler,
  matchSingleJobHandler,
} from "../controllers/job.controller";

const router: IRouter = Router();

// Listing / detail — auth required (so user can be served personalised data later)
router.get(   "/",           requireAuth, validateQuery(jobSearchSchema), searchJobsHandler);
router.get(   "/recommended", requireAuth,                                  getRecommendedJobsHandler);
router.get(   "/saved",      requireAuth,                                  listSavedJobsHandler);
router.get(   "/:id/match",   requireAuth,                                  matchSingleJobHandler);
router.get(   "/:id",        requireAuth,                                  getJobHandler);

// Save / unsave
router.post(  "/:id/save",   requireAuth, saveJobHandler);
router.delete("/:id/save",   requireAuth, unsaveJobHandler);

// Admin-only scrape trigger
router.post(  "/scrape", requireAuth, requireRole("ADMIN"), validate(scrapeRunSchema), runScrapeHandler);

export default router;
