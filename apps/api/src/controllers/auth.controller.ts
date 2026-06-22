import type { Response, NextFunction } from "express";
import type { AuthRequest } from "../middleware/auth.middleware";
import * as authService from "../services/auth.service";
import { prisma } from "@axiom/database";

export async function registerHandler(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const result = await authService.register(req.body);
    res.status(201).json(result);
  } catch (err) { next(err); }
}

export async function verifyEmailHandler(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const result = await authService.verifyEmail(req.body);
    res.json(result);
  } catch (err) { next(err); }
}

export async function loginHandler(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const result = await authService.login(req.body);
    res.json(result);
  } catch (err) { next(err); }
}

export async function refreshHandler(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const { refreshToken } = req.body;
    const result = await authService.refresh(refreshToken);
    res.json(result);
  } catch (err) { next(err); }
}

export async function logoutHandler(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const token = req.headers.authorization?.split(" ")[1] ?? "";
    const result = await authService.logout(req.userId!, token);
    res.json(result);
  } catch (err) { next(err); }
}

export async function forgotPasswordHandler(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const result = await authService.forgotPassword(req.body);
    res.json(result);
  } catch (err) { next(err); }
}

export async function resetPasswordHandler(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const result = await authService.resetPassword(req.body);
    res.json(result);
  } catch (err) { next(err); }
}

export async function meHandler(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.userId },
      select: { id: true, email: true, name: true, role: true, avatarUrl: true, emailVerified: true, createdAt: true },
    });
    if (!user) return res.status(404).json({ error: "User not found" });
    res.json({ user });
  } catch (err) { next(err); }
}
