import type { Request, Response, NextFunction } from "express";
import type { AuthRequest } from "./auth.middleware";

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

const store = new Map<string, RateLimitEntry>();

setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of store) {
    if (entry.resetAt <= now) store.delete(key);
  }
}, 5 * 60 * 1000);

export function rateLimit(maxRequests: number, windowHours: number) {
  return (req: Request, res: Response, next: NextFunction) => {
    const userId = (req as AuthRequest).userId;
    if (!userId) return next();

    const key = `${userId}`;
    const now = Date.now();
    const entry = store.get(key);

    if (!entry || entry.resetAt <= now) {
      store.set(key, { count: 1, resetAt: now + windowHours * 60 * 60 * 1000 });
      return next();
    }

    if (entry.count >= maxRequests) {
      return res.status(429).json({ error: "Rate limit exceeded. Try again later." });
    }

    entry.count++;
    next();
  };
}
