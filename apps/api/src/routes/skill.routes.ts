import { Router } from "express";
import { requireAuth } from "../middleware/auth.middleware";
import { validate } from "../middleware/validate.middleware";
import { skillGapSchema } from "../utils/schemas";
import { getTargetRolesHandler, analyzeSkillGapHandler } from "../controllers/skill.controller";

const router = Router();

router.get("/target-roles", requireAuth, getTargetRolesHandler);
router.post("/gap/:resumeId", requireAuth, validate(skillGapSchema), analyzeSkillGapHandler);

export default router;
