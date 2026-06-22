import bcrypt from "bcryptjs";
import { prisma } from "@axiom/database";
import { AppError } from "../middleware/errorHandler.middleware";
import { redis } from "./redis.service";
import { signAccessToken, signRefreshToken, verifyToken } from "../utils/jwt";
import { CacheKey, TTL } from "../utils/constants";
import type {
  RegisterInput,
  LoginInput,
  ForgotPasswordInput,
  ResetPasswordInput,
  VerifyEmailInput,
} from "../utils/schemas";

function generateOtp(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// ── Register ──────────────────────────────────────────────────────────────────

export async function register(input: RegisterInput) {
  const existing = await prisma.user.findUnique({ where: { email: input.email } });
  if (existing) throw new AppError(409, "Email already in use");

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

  // In dev, log OTP; in prod this is replaced by email.service.ts (Phase 17)
  console.warn(`[AUTH] OTP for ${input.email}: ${otp}`);

  return { message: "Account created. Check your email for the verification code.", userId: user.id };
}

// ── Verify Email ──────────────────────────────────────────────────────────────

export async function verifyEmail(input: VerifyEmailInput) {
  const stored = await redis.get(CacheKey.otp(input.email));
  if (!stored || stored !== input.otp) throw new AppError(400, "Invalid or expired OTP");

  await prisma.user.update({ where: { email: input.email }, data: { emailVerified: true } });
  await redis.del(CacheKey.otp(input.email));

  return { message: "Email verified successfully" };
}

// ── Login ─────────────────────────────────────────────────────────────────────

export async function login(input: LoginInput) {
  const user = await prisma.user.findUnique({ where: { email: input.email } });
  if (!user || !user.password) throw new AppError(401, "Invalid credentials");
  if (!user.emailVerified) throw new AppError(403, "Please verify your email before logging in");

  const valid = await bcrypt.compare(input.password, user.password);
  if (!valid) throw new AppError(401, "Invalid credentials");

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

export async function refresh(token: string) {
  let payload: { userId: string };
  try {
    payload = verifyToken(token) as { userId: string };
  } catch {
    throw new AppError(401, "Invalid refresh token");
  }

  const stored = await redis.get(CacheKey.refreshToken(payload.userId));
  if (!stored || stored !== token) throw new AppError(401, "Refresh token revoked");

  const user = await prisma.user.findUnique({
    where: { id: payload.userId },
    select: { id: true, role: true },
  });
  if (!user) throw new AppError(401, "User not found");

  const newAccess = signAccessToken(user.id, user.role);
  const newRefresh = signRefreshToken(user.id);
  await redis.set(CacheKey.refreshToken(user.id), newRefresh, TTL.REFRESH_TOKEN);

  return { accessToken: newAccess, refreshToken: newRefresh };
}

// ── Logout ────────────────────────────────────────────────────────────────────

export async function logout(userId: string, accessToken: string) {
  await redis.del(CacheKey.refreshToken(userId));
  // Blacklist the access token for its remaining TTL
  await redis.set(CacheKey.blacklist(accessToken), "1", TTL.ACCESS_TOKEN);
  return { message: "Logged out successfully" };
}

// ── Forgot Password ───────────────────────────────────────────────────────────

export async function forgotPassword(input: ForgotPasswordInput) {
  const user = await prisma.user.findUnique({ where: { email: input.email } });
  // Always return success to prevent email enumeration
  if (!user || !user.emailVerified) return { message: "If that email exists, a reset code was sent." };

  const otp = generateOtp();
  await redis.set(CacheKey.resetOtp(input.email), otp, TTL.OTP);

  console.warn(`[AUTH] Password reset OTP for ${input.email}: ${otp}`);

  return { message: "If that email exists, a reset code was sent." };
}

// ── Reset Password ────────────────────────────────────────────────────────────

export async function resetPassword(input: ResetPasswordInput) {
  const stored = await redis.get(CacheKey.resetOtp(input.email));
  if (!stored || stored !== input.otp) throw new AppError(400, "Invalid or expired OTP");

  const hashed = await bcrypt.hash(input.newPassword, 10);
  await prisma.user.update({ where: { email: input.email }, data: { password: hashed } });
  await redis.del(CacheKey.resetOtp(input.email));

  return { message: "Password reset successfully" };
}
