import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { AppError } from "./errorHandler.middleware";
import { redis } from "../services/redis.service";
import { prisma } from "@axiom/database";
import { CacheKey } from "../utils/constants";

export interface AuthRequest extends Request {
  userId?: string;
  userRole?: string;
}

const JWT_SECRET = process.env.JWT_SECRET_KEY;
if (!JWT_SECRET) {
  throw new Error("Missing required environment variable: JWT_SECRET_KEY");
}
const SECRET: string = JWT_SECRET;

export function requireAuth(req: AuthRequest, _res: Response, next: NextFunction) {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) throw new AppError(401, "No token provided");

  (async () => {
    try {
      const payload = jwt.verify(token, SECRET) as unknown as {
        userId: string;
        role: string;
      };

      // Check blacklist (token was invalidated via logout)
      const blacklisted = await redis.get(CacheKey.blacklist(token));
      if (blacklisted) throw new AppError(401, "Token revoked");

      req.userId = payload.userId;
      req.userRole = payload.role;

      // ── Suspend check (skip for admins) ──────────────────────────────
      if (payload.role !== "ADMIN") {
        const cacheKey = `user:suspended:${payload.userId}`;
        const suspendedFlag = await redis.get(cacheKey);
        if (suspendedFlag !== null) {
          if (suspendedFlag === "true") {
            throw new Error("SUSPENDED");
          }
        } else {
          const user = await prisma.user.findUnique({
            where: { id: payload.userId },
            select: { suspendedAt: true },
          });
          if (user?.suspendedAt) {
            await redis.set(cacheKey, "true", 300);
            throw new Error("SUSPENDED");
          }
          await redis.set(cacheKey, "false", 300);
        }
      }

      next();
    } catch (err: any) {
      if (err.message === "SUSPENDED") {
        _res.status(403).json({ error: "Your account has been suspended. Contact support.", code: "ACCOUNT_SUSPENDED" });
        return;
      }
      _res.status(401).json({ error: "Invalid or expired token" });
    }
  })();
}

export function requireRole(...roles: string[]) {
  return (req: AuthRequest, _res: Response, next: NextFunction) => {
    if (!req.userRole || !roles.includes(req.userRole)) {
      throw new AppError(403, "Insufficient permissions");
    }
    next();
  };
}