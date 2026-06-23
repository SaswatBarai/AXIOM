import type { Response, NextFunction } from "express";
import type { AuthRequest } from "../middleware/auth.middleware";
import { assertUserId } from "../middleware/auth.middleware";
import * as authService from "../services/auth.service";
import { prisma } from "@axiom/database";

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "strict" as const,
  path: "/",
};

const REFRESH_COOKIE_OPTIONS = {
  ...COOKIE_OPTIONS,
  path: "/api/auth/refresh",
  maxAge: 7 * 24 * 60 * 60 * 1000,
};

function setAuthCookies(res: Response, accessToken: string, refreshToken: string) {
  res.cookie("accessToken", accessToken, { ...COOKIE_OPTIONS, maxAge: 15 * 60 * 1000 });
  res.cookie("refreshToken", refreshToken, REFRESH_COOKIE_OPTIONS);
}

function clearAuthCookies(res: Response) {
  res.clearCookie("accessToken", { ...COOKIE_OPTIONS });
  res.clearCookie("refreshToken", { ...REFRESH_COOKIE_OPTIONS });
}

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
    setAuthCookies(res, result.accessToken, result.refreshToken);
    res.json(result);
  } catch (err) { next(err); }
}

export async function refreshHandler(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const refreshToken = req.cookies?.["refreshToken"] ?? req.body?.refreshToken;
    if (!refreshToken) return res.status(401).json({ error: "Refresh token required" });
    const result = await authService.refresh(refreshToken);
    setAuthCookies(res, result.accessToken, result.refreshToken);
    res.json(result);
  } catch (err) { next(err); }
}

export async function logoutHandler(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const token = req.headers.authorization?.split(" ")[1] ?? "";
    const result = await authService.logout(assertUserId(req), token);
    clearAuthCookies(res);
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
      where: { id: assertUserId(req) },
      select: { id: true, email: true, name: true, role: true, avatarUrl: true, emailVerified: true, createdAt: true },
    });
    if (!user) return res.status(404).json({ error: "User not found" });
    res.json({ user });
  } catch (err) { next(err); }
}
