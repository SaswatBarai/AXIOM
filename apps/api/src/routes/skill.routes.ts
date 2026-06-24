import { Router } from "express";
import { requireAuth, requireActiveSubscription } from "../middleware/auth.middleware";
import { validate } from "../middleware/validate.middleware";
import { rateLimit } from "../middleware/rateLimit.middleware";
import { skillGapSchema } from "../utils/schemas";
import { getTargetRolesHandler, analyzeSkillGapHandler } from "../controllers/skill.controller";

const router = Router();

router.get("/target-roles", requireAuth, getTargetRolesHandler);
router.post("/gap/:resumeId", requireAuth, requireActiveSubscription, rateLimit(30, 3600), validate(skillGapSchema), analyzeSkillGapHandler);

export default router;
