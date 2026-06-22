import { Router, type IRouter } from "express";
import { requireAuth } from "../middleware/auth.middleware";
import { validate } from "../middleware/validate.middleware";
import {
  updateProfileSchema,
  changePasswordSchema,
  updatePreferencesSchema,
} from "../utils/schemas";
import {
  getProfileHandler,
  updateProfileHandler,
  changePasswordHandler,
  deleteAccountHandler,
  exportDataHandler,
  getPreferencesHandler,
  updatePreferencesHandler,
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

export default router;
