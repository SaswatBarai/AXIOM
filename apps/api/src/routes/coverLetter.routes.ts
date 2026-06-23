import { Router } from "express";
import { requireAuth } from "../middleware/auth.middleware";
import { validate } from "../middleware/validate.middleware";
import { rateLimit } from "../middleware/rateLimit.middleware";
import { coverLetterGenerateSchema, coverLetterExportSchema, coverLetterSaveSchema } from "../utils/schemas";
import {
  generateHandler,
  exportPdfHandler,
  exportDocxHandler,
  getSavedHandler,
  saveHandler,
} from "../controllers/coverLetter.controller";

const router = Router();

router.post("/:applicationId/generate", requireAuth, rateLimit(10, 3600), validate(coverLetterGenerateSchema), generateHandler);
router.get("/:applicationId",           requireAuth, getSavedHandler);
router.put("/:applicationId",           requireAuth, validate(coverLetterSaveSchema), saveHandler);
router.post("/export/pdf",              requireAuth, rateLimit(10, 3600), validate(coverLetterExportSchema), exportPdfHandler);
router.post("/export/docx",             requireAuth, rateLimit(10, 3600), validate(coverLetterExportSchema), exportDocxHandler);

export default router;
