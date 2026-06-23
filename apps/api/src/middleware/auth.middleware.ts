import type { Request, Response, NextFunction } from "express";
import { AppError } from "./errorHandler.middleware";
import { redis } from "../services/redis.service";
import { prisma } from "@axiom/database";
import { CacheKey } from "../utils/constants";
import { verifyToken, extractJti } from "../utils/jwt";

export interface AuthRequest extends Request {
  userId?: string;
  userRole?: string;
}

/** Asserts that the request has a valid userId set by requireAuth middleware */
export function assertUserId(req: AuthRequest): string {
  if (!req.userId) throw new AppError(401, "Not authenticated");
  return req.userId;
}

export function requireAuth(req: AuthRequest, res: Response, next: NextFunction) {
  const token = req.headers.authorization?.split(" ")[1] ?? req.cookies?.["accessToken"];
  if (!token) return next(new AppError(401, "No token provided"));

  (async () => {
    try {
      const payload = verifyToken(token) as unknown as {
        userId: string;
        role: string;
        jti?: string;
      };

      // Check blacklist by jti
      const jti = payload.jti ?? extractJti(token);
      if (jti) {
        const blacklisted = await redis.get(CacheKey.blacklist(jti));
        if (blacklisted) return next(new AppError(401, "Token revoked"));
      }

      req.userId = payload.userId;
      req.userRole = payload.role;

      // ── Account check (deleted + suspended) ────────────────────────
      const cacheKey = CacheKey.suspension(payload.userId);
      const suspendedFlag = await redis.get(cacheKey);
      if (suspendedFlag !== null) {
        if (suspendedFlag === "true") {
          return res.status(403).json({ error: "Your account has been suspended. Contact support.", code: "ACCOUNT_SUSPENDED" });
        }
      } else {
        const user = await prisma.user.findUnique({
          where: { id: payload.userId },
          select: { suspendedAt: true },
        });
        if (!user) {
          return res.status(401).json({ error: "User not found" });
        }
        if (user.suspendedAt) {
          await redis.set(cacheKey, "true", 30);
          return res.status(403).json({ error: "Your account has been suspended. Contact support.", code: "ACCOUNT_SUSPENDED" });
        }
        await redis.set(cacheKey, "false", 30);
      }

      next();
    } catch {
      return res.status(401).json({ error: "Invalid or expired token" });
    }
  })();
}

export function requireRole(...roles: string[]) {
  return (req: AuthRequest, _res: Response, next: NextFunction) => {
    if (!req.userRole || !roles.includes(req.userRole)) {
      return next(new AppError(403, "Insufficient permissions"));
    }
    next();
  };
}