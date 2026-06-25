import type { Request, Response, NextFunction } from "express";
import type { AuthRequest } from "./auth.middleware";
import { redis } from "../services/redis.service";
import { PLAN_ENTITLEMENTS, type Entitlements } from "../config/plan-entitlements";
import { getUserPlan } from "../services/subscription.service";

// ── Generic rate limiter (auth/payment routes — not plan-aware) ──────────────

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

// ── Plan-aware rate limiter (premium feature routes) ─────────────────────────

const FEATURE_LABEL: Partial<Record<keyof Entitlements, string>> = {
  chatMessagesPerHour:      "AI chat messages",
  coverLettersPerHour:      "cover letter exports",
  interviewSessionsPerHour: "interview sessions",
  roadmapsPerHour:          "career roadmaps",
  skillGapsPerHour:         "skill gap analyses",
};

export function planRateLimit(
  entitlementKey: keyof Entitlements,
  windowSeconds: number = 3600,
) {
  return async (req: Request, res: Response, next: NextFunction) => {
    const userId = (req as AuthRequest).userId;
    if (!userId) return next();

    const plan    = await getUserPlan(userId);
    const limit   = PLAN_ENTITLEMENTS[plan][entitlementKey] as number;

    if (limit === 0) {
      return res.status(403).json({
        error: "This feature requires a Premium subscription.",
        code:  "PREMIUM_REQUIRED",
      });
    }

    if (limit === -1) return next();

    const windowHour = Math.floor(Date.now() / (windowSeconds * 1000));
    const key = `rate_limit:${entitlementKey}:${userId}:${windowHour}`;

    const count = await redis.incr(key);
    if (count === 1) await redis.pexpire(key, windowSeconds * 1000);

    if (count > limit) {
      const feature = FEATURE_LABEL[entitlementKey] ?? String(entitlementKey);
      return res.status(429).json({
        error: `Your ${plan} plan allows ${limit} ${feature}/hour. Upgrade for more.`,
        code:  "RATE_LIMIT_EXCEEDED",
        limit,
        plan,
      });
    }

    next();
  };
}
