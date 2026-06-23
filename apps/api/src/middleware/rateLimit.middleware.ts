import type { Request, Response, NextFunction } from "express";
import type { AuthRequest } from "./auth.middleware";
import { redis } from "../services/redis.service";

export function rateLimit(maxRequests: number, windowSeconds: number) {
  return async (req: Request, res: Response, next: NextFunction) => {
    const userId = (req as AuthRequest).userId;
    if (!userId) return next();

    const key = `rate_limit:${userId}`;
    const count = await redis.incr(key);
    if (count === 1) await redis.pexpire(key, windowSeconds * 1000);

    if (count > maxRequests) {
      return res.status(429).json({ error: "Rate limit exceeded. Try again later." });
    }

    next();
  };
}
