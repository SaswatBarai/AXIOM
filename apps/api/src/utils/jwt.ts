import crypto from "node:crypto";
import jwt from "jsonwebtoken";
import { requireEnv } from "./env";

const ACCESS_SECRET  = requireEnv("JWT_SECRET_KEY");
const REFRESH_SECRET = requireEnv("JWT_REFRESH_SECRET");

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
    const decoded = jwt.decode(token);
    if (decoded && typeof decoded === "object" && "jti" in decoded) return decoded.jti as string;
    return null;
  } catch {
    return null;
  }
}
