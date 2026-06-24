import { Router, type IRouter } from "express";
import multer from "multer";
import { rateLimit } from "express-rate-limit";
import { requireAuth } from "../middleware/auth.middleware";
import {
  uploadResumeHandler,
  listResumesHandler,
  getResumeHandler,
  deleteResumeHandler,
  analyzeResumeHandler,
  setActiveResumeHandler,
  getDiscoveryStatusHandler,
  runDiscoveryHandler,
} from "../controllers/resume.controller";
import { validate } from "../middleware/validate.middleware";
import { analyzeResumeSchema } from "../utils/schemas";

const router: IRouter = Router();

const uploadLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: process.env.NODE_ENV === "development" ? 1000 : 10,
  message: { error: "Too many uploads. Please try again in an hour." },
  standardHeaders: true,
  legacyHeaders: false,
});

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

router.post(  "/",           requireAuth, uploadLimiter, upload.single("resume"), uploadResumeHandler);
router.get(   "/",           requireAuth,                                   listResumesHandler);
router.get(   "/:id",        requireAuth,                                   getResumeHandler);
router.delete("/:id",        requireAuth,                                   deleteResumeHandler);
router.post(  "/:id/analyze", requireAuth, validate(analyzeResumeSchema),    analyzeResumeHandler);
router.put(   "/:id/activate",  requireAuth,                                  setActiveResumeHandler);
router.get(   "/:id/discovery", requireAuth,                                  getDiscoveryStatusHandler);
router.post(  "/:id/discover",  requireAuth,                                  runDiscoveryHandler);

export default router;
