import crypto from "node:crypto";
import jwt from "jsonwebtoken";
import { requireEnv } from "./env";

const ACCESS_SECRET_VAL  = requireEnv("JWT_SECRET_KEY");
const REFRESH_SECRET_VAL = requireEnv("JWT_REFRESH_SECRET");

if (ACCESS_SECRET_VAL.length < 32) {
  throw new Error("JWT_SECRET_KEY must be at least 32 characters");
}
if (REFRESH_SECRET_VAL.length < 32) {
  throw new Error("JWT_REFRESH_SECRET must be at least 32 characters");
}

const ACCESS_SECRET  = ACCESS_SECRET_VAL;
const REFRESH_SECRET = REFRESH_SECRET_VAL;

export function signAccessToken(userId: string, role: string): string {
  const jti = crypto.randomUUID();
  return jwt.sign({ userId, role, jti }, ACCESS_SECRET, { expiresIn: "15m" });
}

export function signRefreshToken(userId: string): string {
  const jti = crypto.randomUUID();
  return jwt.sign({ userId, jti }, REFRESH_SECRET, { expiresIn: "7d" });
}

export function verifyToken(token: string, isRefresh = false): jwt.JwtPayload {
  const secret = isRefresh ? REFRESH_SECRET : ACCESS_SECRET;
  return jwt.verify(token, secret, { algorithms: ["HS256"] }) as jwt.JwtPayload;
}

export function verifyRefreshToken(token: string): jwt.JwtPayload {
  return verifyToken(token, true);
}

export function extractJti(token: string): string | null {
  try {
    const payload = jwt.verify(token, ACCESS_SECRET, { algorithms: ["HS256"], ignoreExpiration: true }) as jwt.JwtPayload;
    return payload.jti ?? null;
  } catch {
    return null;
  }
}
