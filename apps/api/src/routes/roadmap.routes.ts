import { Router } from "express";
import { requireAuth } from "../middleware/auth.middleware";
import { validate } from "../middleware/validate.middleware";
import { rateLimit } from "../middleware/rateLimit.middleware";
import { roadmapGenerateSchema, roadmapMarkStepSchema } from "../utils/schemas";
import {
  generateHandler,
  listHandler,
  getHandler,
  markStepHandler,
  deleteHandler,
} from "../controllers/roadmap.controller";

export const roadmapRoutes = Router();

roadmapRoutes.use(requireAuth);

roadmapRoutes.post("/generate",                         rateLimit(10, 3600), validate(roadmapGenerateSchema), generateHandler);
roadmapRoutes.get("/",                                  listHandler);
roadmapRoutes.get("/:roadmapId",                        getHandler);
roadmapRoutes.patch("/:roadmapId/steps/:week",          validate(roadmapMarkStepSchema), markStepHandler);
roadmapRoutes.delete("/:roadmapId",                     deleteHandler);
