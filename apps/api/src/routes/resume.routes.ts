import { Router, type IRouter } from "express";
import multer from "multer";
import { requireAuth } from "../middleware/auth.middleware";
import {
  uploadResumeHandler,
  listResumesHandler,
  getResumeHandler,
  deleteResumeHandler,
  analyzeResumeHandler,
} from "../controllers/resume.controller";
import { validate } from "../middleware/validate.middleware";
import { analyzeResumeSchema } from "../utils/schemas";

const router: IRouter = Router();

// Memory storage — buffer goes straight to S3, nothing written to disk
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const ok =
      file.mimetype === "application/pdf" ||
      file.mimetype === "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
    cb(null, ok);
  },
});

router.post(  "/",           requireAuth, upload.single("resume"),          uploadResumeHandler);
router.get(   "/",           requireAuth,                                   listResumesHandler);
router.get(   "/:id",        requireAuth,                                   getResumeHandler);
router.delete("/:id",        requireAuth,                                   deleteResumeHandler);
router.post(  "/:id/analyze",requireAuth, validate(analyzeResumeSchema),    analyzeResumeHandler);

export default router;
