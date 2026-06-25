import bcrypt from "bcryptjs";
import crypto from "node:crypto";
import { prisma } from "@axiom/database";
import { AppError } from "../middleware/errorHandler.middleware";
import { redis } from "./redis.service";
import { signAccessToken, signRefreshToken, verifyRefreshToken, extractJti } from "../utils/jwt";
import { CacheKey, TTL } from "../utils/constants";
import { sendEmail } from "./email.service";
import { logger } from "../utils/logger";
import type {
  RegisterInput,
  LoginInput,
  ForgotPasswordInput,
  ResetPasswordInput,
  VerifyEmailInput,
} from "../utils/schemas";

function generateOtp(): string {
  return crypto.randomInt(100000, 999999).toString();
}

// ── Register ──────────────────────────────────────────────────────────────────

export async function register(input: RegisterInput) {
  const existing = await prisma.user.findUnique({ where: { email: input.email } });
  if (existing) {
    if (existing.emailVerified) {
      throw new AppError(409, "Email already in use");
    }
    const hashed = await bcrypt.hash(input.password, 10);
    const user = await prisma.user.update({
      where: { email: input.email },
      data: {
        name: input.name,
        password: hashed,
      },
      select: { id: true, email: true, name: true, role: true },
    });

    const otp = generateOtp();
    await redis.set(CacheKey.otp(input.email), otp, TTL.OTP);

    if (process.env.NODE_ENV !== "production") {
      console.warn(`[AUTH] OTP for ${input.email}: ${otp}`);
    }

    sendEmail({ to: input.email, template: "otp-verify", data: { name: input.name, otp } })
      .catch((err) => logger.warn("Failed to send OTP email", err));

    return { message: "Account created. Check your email for the verification code.", userId: user.id };
  }

  const hashed = await bcrypt.hash(input.password, 10);
  const user = await prisma.user.create({
    data: {
      name: input.name,
      email: input.email,
      password: hashed,
      preferences: { create: { theme: "dark" } },
    },
    select: { id: true, email: true, name: true, role: true },
  });

  const otp = generateOtp();
  await redis.set(CacheKey.otp(input.email), otp, TTL.OTP);

  if (process.env.NODE_ENV !== "production") {
    console.warn(`[AUTH] OTP for ${input.email}: ${otp}`);
  }

  sendEmail({ to: input.email, template: "otp-verify", data: { name: input.name, otp } })
    .catch((err) => logger.warn("Failed to send OTP email", err));

  return { message: "Account created. Check your email for the verification code.", userId: user.id };
}

function constantTimeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  const bufA = Buffer.from(a, "utf8");
  const bufB = Buffer.from(b, "utf8");
  return crypto.timingSafeEqual(bufA, bufB);
}

// ── Verify Email ──────────────────────────────────────────────────────────────

export async function verifyEmail(input: VerifyEmailInput) {
  const stored = await redis.get(CacheKey.otp(input.email));
  if (!stored || !constantTimeEqual(stored, input.otp)) throw new AppError(400, "Invalid or expired OTP");

  await prisma.user.update({ where: { email: input.email }, data: { emailVerified: true } });
  await redis.del(CacheKey.otp(input.email));

  return { message: "Email verified successfully" };
}

export async function resendVerification(email: string) {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) throw new AppError(404, "User not found");
  if (user.emailVerified) throw new AppError(400, "Email is already verified");

  const otp = generateOtp();
  await redis.set(CacheKey.otp(email), otp, TTL.OTP);

  if (process.env.NODE_ENV !== "production") {
    console.warn(`[AUTH] Resent OTP for ${email}: ${otp}`);
  }

  sendEmail({ to: email, template: "otp-verify", data: { name: user.name, otp } })
    .catch((err) => logger.warn("Failed to send OTP email", err));

  return { message: "Verification code resent successfully" };
}

// ── Login ─────────────────────────────────────────────────────────────────────

export async function login(input: LoginInput) {
  const user = await prisma.user.findUnique({ where: { email: input.email } });

  const dummyHash = "$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy";
  const passwordToCompare = user?.password ?? dummyHash;
  const valid = await bcrypt.compare(input.password, passwordToCompare);

  if (!user || !user.password || !valid) throw new AppError(401, "Invalid credentials");
  if (!user.emailVerified) throw new AppError(403, "Please verify your email before logging in");

  const accessToken = signAccessToken(user.id, user.role);
  const refreshToken = signRefreshToken(user.id);

  await redis.set(CacheKey.refreshToken(user.id), refreshToken, TTL.REFRESH_TOKEN);

  return {
    accessToken,
    refreshToken,
    user: { id: user.id, email: user.email, name: user.name, role: user.role, avatarUrl: user.avatarUrl },
  };
}

// ── Refresh ───────────────────────────────────────────────────────────────────

interface TokenPayload { userId: string; role?: string; iat?: number; exp?: number; }

export async function refresh(token: string) {
  let payload: TokenPayload;
  try {
    const decoded = verifyRefreshToken(token);
    if (!decoded || typeof decoded !== "object" || !decoded.userId) {
      throw new AppError(401, "Invalid refresh token");
    }
    payload = decoded as TokenPayload;
  } catch (err) {
    if (err instanceof AppError) throw err;
    throw new AppError(401, "Invalid refresh token");
  }

  // Atomic get+delete — if null, token was already rotated (replay detected)
  const stored = await redis.getdel(CacheKey.refreshToken(payload.userId));
  if (!stored || stored !== token) {
    // Replay detected — do NOT delete the current token (that belongs to the legitimate user)
    logger.warn({ userId: payload.userId }, "Refresh token replay detected");
    throw new AppError(401, "Refresh token revoked — possible token reuse detected");
  }

  const user = await prisma.user.findUnique({
    where: { id: payload.userId },
    select: { id: true, role: true, emailVerified: true, suspendedAt: true },
  });
  if (!user) throw new AppError(401, "User not found");
  if (user.suspendedAt) throw new AppError(403, "Account suspended");
  if (!user.emailVerified) throw new AppError(403, "Email not verified");

  const newAccess = signAccessToken(user.id, user.role);
  const newRefresh = signRefreshToken(user.id);
  await redis.set(CacheKey.refreshToken(user.id), newRefresh, TTL.REFRESH_TOKEN);

  return { accessToken: newAccess, refreshToken: newRefresh };
}

// ── Logout ────────────────────────────────────────────────────────────────────

export async function logout(userId: string, accessToken: string) {
  await redis.del(CacheKey.refreshToken(userId));
  // Blacklist by jti to keep Redis keys short
  const jti = extractJti(accessToken);
  if (jti) {
    await redis.set(CacheKey.blacklist(jti), "1", TTL.ACCESS_TOKEN);
  }
  return { message: "Logged out successfully" };
}

// ── Forgot Password ───────────────────────────────────────────────────────────

export async function forgotPassword(input: ForgotPasswordInput) {
  const user = await prisma.user.findUnique({ where: { email: input.email } });
  // Always return success to prevent email enumeration
  if (!user || !user.emailVerified) return { message: "If that email exists, a reset code was sent." };

  const otp = generateOtp();
  await redis.set(CacheKey.resetOtp(input.email), otp, TTL.OTP);

  if (process.env.NODE_ENV !== "production") {
    console.warn(`[AUTH] Password reset OTP for ${input.email}: ${otp}`);
  }

  sendEmail({ to: input.email, template: "otp-reset", data: { name: user.name, otp } })
    .catch((err) => logger.warn("Failed to send OTP email", err));

  return { message: "If that email exists, a reset code was sent." };
}

// ── Reset Password ────────────────────────────────────────────────────────────

export async function resetPassword(input: ResetPasswordInput) {
  const stored = await redis.get(CacheKey.resetOtp(input.email));
  if (!stored || !constantTimeEqual(stored, input.otp)) throw new AppError(400, "Invalid or expired OTP");

  const user = await prisma.user.findUnique({
    where: { email: input.email },
    select: { id: true },
  });
  if (!user) throw new AppError(404, "User not found");

  const hashed = await bcrypt.hash(input.newPassword, 10);
  await prisma.user.update({ where: { email: input.email }, data: { password: hashed } });
  await redis.del(CacheKey.resetOtp(input.email));
  // Invalidate all existing sessions so stolen tokens no longer work
  await redis.del(CacheKey.refreshToken(user.id));

  return { message: "Password reset successfully" };
}
