import { Router } from "express";
import { requireAuth } from "../middleware/auth.middleware";
import { validate } from "../middleware/validate.middleware";
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

roadmapRoutes.post("/generate",                         validate(roadmapGenerateSchema), generateHandler);
roadmapRoutes.get("/",                                  listHandler);
roadmapRoutes.get("/:roadmapId",                        getHandler);
roadmapRoutes.patch("/:roadmapId/steps/:week",          validate(roadmapMarkStepSchema), markStepHandler);
roadmapRoutes.delete("/:roadmapId",                     deleteHandler);
