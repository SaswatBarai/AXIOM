import { Router } from "express";
import { requireAuth } from "../middleware/auth.middleware";
import { validate } from "../middleware/validate.middleware";
import { coverLetterGenerateSchema, coverLetterExportSchema, coverLetterSaveSchema } from "../utils/schemas";
import {
  generateHandler,
  exportPdfHandler,
  exportDocxHandler,
  getSavedHandler,
  saveHandler,
} from "../controllers/coverLetter.controller";

const router = Router();

router.post("/:applicationId/generate", requireAuth, validate(coverLetterGenerateSchema), generateHandler);
router.get("/:applicationId",           requireAuth, getSavedHandler);
router.put("/:applicationId",           requireAuth, validate(coverLetterSaveSchema), saveHandler);
router.post("/export/pdf",              requireAuth, validate(coverLetterExportSchema), exportPdfHandler);
router.post("/export/docx",             requireAuth, validate(coverLetterExportSchema), exportDocxHandler);

export default router;
