import { Router } from "express";
import { requireAuth, requireActiveSubscription } from "../middleware/auth.middleware";
import { validate } from "../middleware/validate.middleware";
import { planRateLimit } from "../middleware/rateLimit.middleware";
import { coverLetterGenerateSchema, coverLetterExportSchema, coverLetterSaveSchema } from "../utils/schemas";
import {
  generateHandler,
  exportPdfHandler,
  exportDocxHandler,
  getSavedHandler,
  saveHandler,
} from "../controllers/coverLetter.controller";

const router = Router();

router.post("/:applicationId/generate", requireAuth, requireActiveSubscription, planRateLimit("coverLettersPerHour"), validate(coverLetterGenerateSchema), generateHandler);
router.get("/:applicationId",           requireAuth, getSavedHandler);
router.put("/:applicationId",           requireAuth, validate(coverLetterSaveSchema), saveHandler);
router.post("/export/pdf",              requireAuth, requireActiveSubscription, planRateLimit("coverLettersPerHour"), validate(coverLetterExportSchema), exportPdfHandler);
router.post("/export/docx",             requireAuth, requireActiveSubscription, planRateLimit("coverLettersPerHour"), validate(coverLetterExportSchema), exportDocxHandler);

export default router;
