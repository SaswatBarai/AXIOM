import { Router } from "express";
import { requireAuth } from "../middleware/auth.middleware";
import { validate } from "../middleware/validate.middleware";
import { interviewGenerateSchema, interviewMarksSchema } from "../utils/schemas";
import {
  generateHandler,
  listSessionsHandler,
  getSessionHandler,
  deleteSessionHandler,
  saveMarksHandler,
  listCategoriesHandler,
} from "../controllers/interview.controller";

const router = Router();

router.use(requireAuth);

router.get("/categories",                                        listCategoriesHandler);
router.post("/generate",      validate(interviewGenerateSchema), generateHandler);
router.get("/sessions",                                          listSessionsHandler);
router.get("/sessions/:sessionId",                               getSessionHandler);
router.patch("/sessions/:sessionId/marks", validate(interviewMarksSchema), saveMarksHandler);
router.delete("/sessions/:sessionId",                            deleteSessionHandler);

export { router as interviewRoutes };
