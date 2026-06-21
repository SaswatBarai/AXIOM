import type { Response, NextFunction } from "express";
import type { AuthRequest } from "../middleware/auth.middleware";
import * as skillService from "../services/skill.service";

export async function getTargetRolesHandler(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const roles = await skillService.getTargetRoles();
    res.json({ roles });
  } catch (err) { next(err); }
}

export async function analyzeSkillGapHandler(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const report = await skillService.analyzeSkillGap(
      req.userId!,
      req.params["resumeId"] as string,
      req.body.roleId as string,
    );
    res.json({ report });
  } catch (err) { next(err); }
}
