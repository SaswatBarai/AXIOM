import { prisma } from "@axiom/database";
import bcrypt from "bcryptjs";
import { AppError } from "../middleware/errorHandler.middleware";
import type {
  UpdateProfileInput,
  ChangePasswordInput,
  UpdatePreferencesInput,
} from "../utils/schemas";

const PROFILE_SELECT = {
  id: true, email: true, name: true, role: true,
  avatarUrl: true, bio: true, location: true,
  linkedinUrl: true, githubUrl: true, portfolioUrl: true,
  currentTitle: true, yearsOfExp: true,
  emailVerified: true, createdAt: true, updatedAt: true,
};

const PROFILE_FIELDS = [
  "name", "avatarUrl", "bio", "location",
  "currentTitle", "linkedinUrl", "yearsOfExp",
] as const;

function calcCompletion(user: Record<string, unknown>): number {
  const filled = PROFILE_FIELDS.filter((f) => user[f] != null && user[f] !== "").length;
  return Math.round((filled / PROFILE_FIELDS.length) * 100);
}

export async function getProfile(userId: string) {
  const user = await prisma.user.findUnique({ where: { id: userId }, select: PROFILE_SELECT });
  if (!user) throw new AppError(404, "User not found");
  return { ...user, profileCompletionPct: calcCompletion(user as Record<string, unknown>) };
}

export async function updateProfile(userId: string, data: UpdateProfileInput) {
  const user = await prisma.user.update({
    where: { id: userId },
    data,
    select: PROFILE_SELECT,
  });
  return { ...user, profileCompletionPct: calcCompletion(user as Record<string, unknown>) };
}

export async function changePassword(userId: string, data: ChangePasswordInput) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { password: true },
  });
  if (!user?.password) throw new AppError(400, "No password set on this account");

  const matches = await bcrypt.compare(data.currentPassword, user.password);
  if (!matches) throw new AppError(401, "Current password is incorrect");

  const hashed = await bcrypt.hash(data.newPassword, 10);
  await prisma.user.update({ where: { id: userId }, data: { password: hashed } });
  return { message: "Password changed successfully" };
}

export async function deleteAccount(userId: string) {
  await prisma.user.delete({ where: { id: userId } });
  return { message: "Account deleted successfully" };
}

export async function exportData(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      preferences: true,
      resumes: { select: { id: true, fileName: true, fileType: true, atsScore: true, version: true, createdAt: true } },
      applications: { include: { job: { select: { id: true, title: true, company: true } } } },
      chatHistory: true,
      roadmaps: true,
    },
  });
  if (!user) throw new AppError(404, "User not found");
  // Strip credentials before export
  const { password: _, googleId: _g, refreshToken: _r, resetToken: _rt, resetTokenExpiry: _rte, ...safeUser } = user;
  return safeUser;
}

export async function getPreferences(userId: string) {
  const prefs = await prisma.userPreferences.findUnique({ where: { userId } });
  if (prefs) return prefs;
  return prisma.userPreferences.create({ data: { userId } });
}

export async function updatePreferences(userId: string, data: UpdatePreferencesInput) {
  return prisma.userPreferences.upsert({
    where: { userId },
    update: data,
    create: { userId, ...data },
  });
}

export async function listUsers(page: number, limit: number) {
  const skip = (page - 1) * limit;
  const [users, total] = await Promise.all([
    prisma.user.findMany({ skip, take: limit, select: PROFILE_SELECT, orderBy: { createdAt: "desc" } }),
    prisma.user.count(),
  ]);
  return {
    users: users.map((u) => ({ ...u, profileCompletionPct: calcCompletion(u as Record<string, unknown>) })),
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
}

export async function changeRole(targetId: string, role: "USER" | "PREMIUM" | "ADMIN") {
  const user = await prisma.user.update({
    where: { id: targetId },
    data: { role },
    select: { id: true, email: true, name: true, role: true },
  });
  return user;
}
