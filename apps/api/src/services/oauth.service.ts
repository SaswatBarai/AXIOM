import crypto from "node:crypto";
import axios from "axios";
import { prisma } from "@axiom/database";
import { AppError } from "../middleware/errorHandler.middleware";
import { redis } from "./redis.service";
import { signAccessToken, signRefreshToken } from "../utils/jwt";
import { CacheKey, TTL } from "../utils/constants";
import { logger } from "../utils/logger";

export type OAuthProvider = "google" | "github";

export interface OAuthProfile {
  providerId: string;
  email: string;
  name: string;
  avatarUrl?: string;
  githubLogin?: string;
}

function apiPublicUrl(): string {
  return (
    process.env.API_PUBLIC_URL ??
    process.env.API_URL ??
    `http://localhost:${process.env.API_PORT ?? 4000}`
  ).replace(/\/$/, "");
}

function frontendUrl(): string {
  return (process.env.FRONTEND_URL ?? "http://localhost:3000").replace(/\/$/, "");
}

function oauthCallbackUrl(provider: OAuthProvider): string {
  return `${apiPublicUrl()}/api/auth/${provider}/callback`;
}

function requireOAuthEnv(provider: OAuthProvider): void {
  if (provider === "google") {
    if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
      throw new AppError(503, "Google sign-in is not configured");
    }
    return;
  }
  if (!process.env.GITHUB_CLIENT_ID || !process.env.GITHUB_CLIENT_SECRET) {
    throw new AppError(503, "GitHub sign-in is not configured");
  }
}

export function isOAuthConfigured(provider: OAuthProvider): boolean {
  if (provider === "google") {
    return Boolean(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET);
  }
  return Boolean(process.env.GITHUB_CLIENT_ID && process.env.GITHUB_CLIENT_SECRET);
}

export async function createOAuthState(provider: OAuthProvider, returnTo?: string): Promise<string> {
  const state = crypto.randomBytes(32).toString("hex");
  const payload = JSON.stringify({ provider, returnTo: returnTo ?? "/dashboard" });
  await redis.set(CacheKey.oauthState(state), payload, TTL.OAUTH_STATE);
  return state;
}

export async function consumeOAuthState(state: string, provider: OAuthProvider): Promise<string> {
  const raw = await redis.getdel(CacheKey.oauthState(state));
  if (!raw) throw new AppError(400, "Invalid or expired OAuth state");

  let parsed: { provider?: string; returnTo?: string };
  try {
    parsed = JSON.parse(raw) as { provider?: string; returnTo?: string };
  } catch {
    throw new AppError(400, "Invalid OAuth state");
  }

  if (parsed.provider !== provider) throw new AppError(400, "OAuth provider mismatch");
  return parsed.returnTo ?? "/dashboard";
}

export function getGoogleAuthUrl(state: string): string {
  requireOAuthEnv("google");
  const params = new URLSearchParams({
    client_id: process.env.GOOGLE_CLIENT_ID!,
    redirect_uri: oauthCallbackUrl("google"),
    response_type: "code",
    scope: "openid email profile",
    state,
    access_type: "online",
    prompt: "select_account",
  });
  return `https://accounts.google.com/o/oauth2/v2/auth?${params}`;
}

export function getGitHubAuthUrl(state: string): string {
  requireOAuthEnv("github");
  const params = new URLSearchParams({
    client_id: process.env.GITHUB_CLIENT_ID!,
    redirect_uri: oauthCallbackUrl("github"),
    scope: "read:user user:email",
    state,
  });
  return `https://github.com/login/oauth/authorize?${params}`;
}

export async function exchangeGoogleCode(code: string): Promise<OAuthProfile> {
  requireOAuthEnv("google");
  const redirectUri = oauthCallbackUrl("google");

  const tokenRes = await axios.post(
    "https://oauth2.googleapis.com/token",
    new URLSearchParams({
      code,
      client_id: process.env.GOOGLE_CLIENT_ID!,
      client_secret: process.env.GOOGLE_CLIENT_SECRET!,
      redirect_uri: redirectUri,
      grant_type: "authorization_code",
    }),
    { headers: { "Content-Type": "application/x-www-form-urlencoded" } },
  );

  const accessToken = tokenRes.data?.access_token as string | undefined;
  if (!accessToken) throw new AppError(401, "Google authentication failed");

  const profileRes = await axios.get("https://www.googleapis.com/oauth2/v3/userinfo", {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  const data = profileRes.data as {
    sub?: string;
    email?: string;
    email_verified?: boolean;
    name?: string;
    picture?: string;
  };

  if (!data.sub || !data.email) throw new AppError(401, "Google account missing required profile fields");
  if (data.email_verified === false) throw new AppError(403, "Google email is not verified");

  return {
    providerId: data.sub,
    email: data.email.toLowerCase(),
    name: data.name?.trim() || data.email.split("@")[0]!,
    avatarUrl: normalizeAvatarUrl("google", data.picture),
  };
}

export async function exchangeGitHubCode(code: string): Promise<OAuthProfile> {
  requireOAuthEnv("github");
  const redirectUri = oauthCallbackUrl("github");

  const tokenRes = await axios.post(
    "https://github.com/login/oauth/access_token",
    {
      client_id: process.env.GITHUB_CLIENT_ID,
      client_secret: process.env.GITHUB_CLIENT_SECRET,
      code,
      redirect_uri: redirectUri,
    },
    { headers: { Accept: "application/json" } },
  );

  const accessToken = tokenRes.data?.access_token as string | undefined;
  if (!accessToken) throw new AppError(401, "GitHub authentication failed");

  const [userRes, emailsRes] = await Promise.all([
    axios.get("https://api.github.com/user", {
      headers: { Authorization: `Bearer ${accessToken}`, Accept: "application/json" },
    }),
    axios.get<Array<{ email: string; primary: boolean; verified: boolean }>>(
      "https://api.github.com/user/emails",
      { headers: { Authorization: `Bearer ${accessToken}`, Accept: "application/json" } },
    ),
  ]);

  const ghUser = userRes.data as { id?: number; login?: string; name?: string | null; avatar_url?: string };
  if (!ghUser.id) throw new AppError(401, "GitHub account missing required profile fields");

  const emails = emailsRes.data ?? [];
  const primary = emails.find((e) => e.primary && e.verified) ?? emails.find((e) => e.verified);
  if (!primary?.email) {
    throw new AppError(403, "GitHub account has no verified email. Make your email public or verify it on GitHub.");
  }

  return {
    providerId: String(ghUser.id),
    email: primary.email.toLowerCase(),
    name: ghUser.name?.trim() || ghUser.login || primary.email.split("@")[0]!,
    avatarUrl: normalizeAvatarUrl("github", ghUser.avatar_url),
    githubLogin: ghUser.login,
  };
}

function normalizeAvatarUrl(provider: OAuthProvider, url?: string | null): string | undefined {
  if (!url) return undefined;
  if (provider === "google" && url.includes("googleusercontent.com")) {
    return url.replace(/=s\d+-c$/, "=s256-c").replace(/=s\d+$/, "=s256");
  }
  return url;
}

function buildOAuthProfileData(provider: OAuthProvider, profile: OAuthProfile) {
  return {
    emailVerified: true,
    name: profile.name,
    ...(profile.avatarUrl ? { avatarUrl: profile.avatarUrl } : {}),
    ...(provider === "github" && profile.githubLogin
      ? { githubUrl: `https://github.com/${profile.githubLogin}` }
      : {}),
  };
}

async function syncOAuthProfile(
  userId: string,
  provider: OAuthProvider,
  profile: OAuthProfile,
  extra?: Record<string, string>,
) {
  return prisma.user.update({
    where: { id: userId },
    data: { ...buildOAuthProfileData(provider, profile), ...extra },
    select: { id: true, email: true, name: true, role: true, avatarUrl: true, suspendedAt: true },
  });
}

async function linkProviderId(
  userId: string,
  provider: OAuthProvider,
  providerId: string,
  profile: OAuthProfile,
) {
  const idField = provider === "google" ? "googleId" : "githubId";
  const existingWithProvider = await prisma.user.findFirst({
    where: { [idField]: providerId, NOT: { id: userId } },
    select: { id: true },
  });
  if (existingWithProvider) {
    throw new AppError(409, "This social account is already linked to another user");
  }

  return syncOAuthProfile(userId, provider, profile, { [idField]: providerId });
}

export async function findOrCreateOAuthUser(provider: OAuthProvider, profile: OAuthProfile) {
  const idField = provider === "google" ? "googleId" : "githubId";

  const byProvider = await prisma.user.findFirst({
    where: { [idField]: profile.providerId },
    select: { id: true, email: true, name: true, role: true, avatarUrl: true, suspendedAt: true },
  });
  if (byProvider) {
    if (byProvider.suspendedAt) throw new AppError(403, "Account suspended");
    return syncOAuthProfile(byProvider.id, provider, profile);
  }

  const byEmail = await prisma.user.findUnique({
    where: { email: profile.email },
    select: {
      id: true, email: true, name: true, role: true, avatarUrl: true,
      suspendedAt: true, googleId: true, githubId: true,
    },
  });

  if (byEmail) {
    if (byEmail.suspendedAt) throw new AppError(403, "Account suspended");
    const otherField = provider === "google" ? byEmail.googleId : byEmail.githubId;
    if (otherField && otherField !== profile.providerId) {
      throw new AppError(409, "Email is already linked to a different social account");
    }
    return linkProviderId(byEmail.id, provider, profile.providerId, profile);
  }

  return prisma.user.create({
    data: {
      email: profile.email,
      [idField]: profile.providerId,
      preferences: { create: { theme: "dark" } },
      ...buildOAuthProfileData(provider, profile),
    },
    select: { id: true, email: true, name: true, role: true, avatarUrl: true, suspendedAt: true },
  });
}

export async function completeOAuthLogin(provider: OAuthProvider, code: string, state: string) {
  const returnTo = await consumeOAuthState(state, provider);
  const profile = provider === "google"
    ? await exchangeGoogleCode(code)
    : await exchangeGitHubCode(code);

  const user = await findOrCreateOAuthUser(provider, profile);

  const accessToken = signAccessToken(user.id, user.role);
  const refreshToken = signRefreshToken(user.id);
  await redis.set(CacheKey.refreshToken(user.id), refreshToken, TTL.REFRESH_TOKEN);

  return {
    accessToken,
    refreshToken,
    returnTo,
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      avatarUrl: user.avatarUrl,
    },
  };
}

export function oauthErrorRedirect(message: string): string {
  const url = new URL("/auth/oauth-callback", frontendUrl());
  url.searchParams.set("error", message);
  return url.toString();
}

export function oauthSuccessRedirect(accessToken: string, returnTo: string): string {
  const url = new URL("/auth/oauth-callback", frontendUrl());
  url.searchParams.set("accessToken", accessToken);
  url.searchParams.set("returnTo", returnTo);
  return url.toString();
}

export function logOAuthMisconfig(): void {
  if (!isOAuthConfigured("google")) {
    logger.warn("Google OAuth not configured — set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET");
  }
  if (!isOAuthConfigured("github")) {
    logger.warn("GitHub OAuth not configured — set GITHUB_CLIENT_ID and GITHUB_CLIENT_SECRET");
  }
}
