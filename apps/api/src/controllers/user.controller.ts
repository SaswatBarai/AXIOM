import type { Response, NextFunction } from "express";
import type { AuthRequest } from "../middleware/auth.middleware";
import { assertUserId } from "../middleware/auth.middleware";
import * as userService from "../services/user.service";

export async function getProfileHandler(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const profile = await userService.getProfile(assertUserId(req));
    res.json({ user: profile });
  } catch (err) { next(err); }
}

export async function updateProfileHandler(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const profile = await userService.updateProfile(assertUserId(req), req.body);
    res.json({ user: profile });
  } catch (err) { next(err); }
}

export async function changePasswordHandler(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const result = await userService.changePassword(assertUserId(req), req.body);
    res.json(result);
  } catch (err) { next(err); }
}

export async function deleteAccountHandler(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const result = await userService.deleteAccount(assertUserId(req));
    res.json(result);
  } catch (err) { next(err); }
}

export async function exportDataHandler(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const data = await userService.exportData(assertUserId(req));
    res
      .header("Content-Disposition", `attachment; filename="axiom-data-export.json"`)
      .json(data);
  } catch (err) { next(err); }
}

export async function getPreferencesHandler(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const prefs = await userService.getPreferences(assertUserId(req));
    res.json({ preferences: prefs });
  } catch (err) { next(err); }
}

export async function updatePreferencesHandler(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const prefs = await userService.updatePreferences(assertUserId(req), req.body);
    res.json({ preferences: prefs });
  } catch (err) { next(err); }
}
