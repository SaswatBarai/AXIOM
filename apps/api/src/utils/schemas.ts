import { z } from "zod";

const password = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .regex(/[A-Z]/, "Password must contain an uppercase letter")
  .regex(/[0-9]/, "Password must contain a number")
  .regex(/[^A-Za-z0-9]/, "Password must contain a special character");

export const registerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(60),
  email: z.string().email("Invalid email address"),
  password,
});

export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

export const verifyEmailSchema = z.object({
  email: z.string().email(),
  otp: z.string().length(6, "OTP must be 6 digits"),
});

export const forgotPasswordSchema = z.object({
  email: z.string().email("Invalid email address"),
});

export const resetPasswordSchema = z.object({
  email: z.string().email(),
  otp: z.string().length(6, "OTP must be 6 digits"),
  newPassword: password,
});

export const refreshSchema = z.object({
  refreshToken: z.string().min(1, "Refresh token is required"),
});

export const updateProfileSchema = z.object({
  name:         z.string().min(2).max(60).optional(),
  bio:          z.string().max(300).optional(),
  location:     z.string().max(100).optional(),
  currentTitle: z.string().max(100).optional(),
  linkedinUrl:  z.string().url("Invalid LinkedIn URL").optional().or(z.literal("")),
  githubUrl:    z.string().url("Invalid GitHub URL").optional().or(z.literal("")),
  portfolioUrl: z.string().url("Invalid portfolio URL").optional().or(z.literal("")),
  yearsOfExp:   z.number().int().min(0).max(50).optional(),
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required"),
  newPassword:     password,
});

export const updatePreferencesSchema = z.object({
  theme:              z.enum(["dark", "light"]).optional(),
  emailNotifications: z.boolean().optional(),
  jobAlerts:          z.boolean().optional(),
  weeklyDigest:       z.boolean().optional(),
});

export const changeRoleSchema = z.object({
  role: z.enum(["USER", "PREMIUM", "ADMIN"]),
});

export const analyzeResumeSchema = z.object({
  jobDescription: z.string().min(20, "Job description must be at least 20 characters").max(10_000),
});

export type RegisterInput        = z.infer<typeof registerSchema>;
export type LoginInput           = z.infer<typeof loginSchema>;
export type VerifyEmailInput     = z.infer<typeof verifyEmailSchema>;
export type ForgotPasswordInput  = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordInput   = z.infer<typeof resetPasswordSchema>;
export type UpdateProfileInput   = z.infer<typeof updateProfileSchema>;
export type ChangePasswordInput  = z.infer<typeof changePasswordSchema>;
export type UpdatePreferencesInput = z.infer<typeof updatePreferencesSchema>;
export type AnalyzeResumeInput   = z.infer<typeof analyzeResumeSchema>;
