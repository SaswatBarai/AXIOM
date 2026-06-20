import { Router, type IRouter } from "express";
import { requireAuth, requireRole } from "../middleware/auth.middleware";
import { validate } from "../middleware/validate.middleware";
import {
  updateProfileSchema,
  changePasswordSchema,
  updatePreferencesSchema,
  changeRoleSchema,
} from "../utils/schemas";
import {
  getProfileHandler,
  updateProfileHandler,
  changePasswordHandler,
  deleteAccountHandler,
  exportDataHandler,
  getPreferencesHandler,
  updatePreferencesHandler,
  listUsersHandler,
  changeRoleHandler,
} from "../controllers/user.controller";

const router: IRouter = Router();

// ── Own profile ───────────────────────────────────────────────────────────────
router.get(  "/me",                 requireAuth,                                           getProfileHandler);
router.put(  "/me",                 requireAuth, validate(updateProfileSchema),            updateProfileHandler);
router.patch("/me/password",        requireAuth, validate(changePasswordSchema),           changePasswordHandler);
router.delete("/me",                requireAuth,                                           deleteAccountHandler);
router.get(  "/me/export",          requireAuth,                                           exportDataHandler);

// ── Preferences ───────────────────────────────────────────────────────────────
router.get(  "/me/preferences",     requireAuth,                                           getPreferencesHandler);
router.put(  "/me/preferences",     requireAuth, validate(updatePreferencesSchema),        updatePreferencesHandler);

// ── Admin ─────────────────────────────────────────────────────────────────────
router.get(  "/",                   requireAuth, requireRole("ADMIN"),                     listUsersHandler);
router.patch("/:id/role",           requireAuth, requireRole("ADMIN"), validate(changeRoleSchema), changeRoleHandler);

export default router;
