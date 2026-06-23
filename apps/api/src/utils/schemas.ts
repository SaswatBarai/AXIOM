import { z } from "zod";

const password = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .regex(/[a-z]/, "Password must contain a lowercase letter")
  .regex(/[A-Z]/, "Password must contain an uppercase letter")
  .regex(/[0-9]/, "Password must contain a number")
  .regex(/[!@#$%^&*()_+{}[\]:;<>,.?~\\/-]/, "Password must contain a special character");

export const registerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(60),
  email: z.string().email("Invalid email address").transform((val) => val.toLowerCase()),
  password,
});

export const loginSchema = z.object({
  email: z.string().email("Invalid email address").transform((val) => val.toLowerCase()),
  password: z.string().min(1, "Password is required"),
});

export const verifyEmailSchema = z.object({
  email: z.string().email().transform((val) => val.toLowerCase()),
  otp: z.string().length(6, "OTP must be 6 digits"),
});

export const forgotPasswordSchema = z.object({
  email: z.string().email("Invalid email address").transform((val) => val.toLowerCase()),
});

export const resetPasswordSchema = z.object({
  email: z.string().email().transform((val) => val.toLowerCase()),
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

// ── Phase 8: Job Search ───────────────────────────────────────────────────────

const JOB_TYPES        = ["FULL_TIME", "PART_TIME", "CONTRACT", "INTERNSHIP", "FREELANCE"] as const;
const EXPERIENCE_LEVELS = ["ENTRY", "MID", "SENIOR", "LEAD", "EXECUTIVE"] as const;
const JOB_SOURCES       = ["internshala", "unstop", "naukri", "manual"] as const;

export const jobSearchSchema = z.object({
  q:               z.string().max(200).optional(),
  location:        z.string().max(120).optional(),
  remote:          z.coerce.boolean().optional(),
  jobType:         z.enum(JOB_TYPES).optional(),
  experienceLevel: z.enum(EXPERIENCE_LEVELS).optional(),
  source:          z.enum(JOB_SOURCES).optional(),
  salaryMin:       z.coerce.number().int().nonnegative().optional(),
  salaryMax:       z.coerce.number().int().nonnegative().optional(),
  skills:          z
    .union([z.string(), z.array(z.string())])
    .optional()
    .transform((v) => {
      if (v == null) return undefined;
      if (Array.isArray(v)) return v.filter((s) => s.trim().length > 0);
      return v.split(",").map((s) => s.trim()).filter((s) => s.length > 0);
    }),
  page:     z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(50).default(20),
  sortBy:   z.enum(["date", "match"]).default("match"),
});

export const scrapeRunSchema = z.object({
  source:    z.enum(["internshala", "unstop", "naukri"]),
  query:     z.string().max(200).default(""),
  maxPages:  z.number().int().min(1).max(10).default(2),
  maxJobs:   z.number().int().min(1).max(500).default(100),
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
export type JobSearchInput       = z.infer<typeof jobSearchSchema>;
export type ScrapeRunInput       = z.infer<typeof scrapeRunSchema>;

// ── Phase 10: Application Tracker ─────────────────────────────────────────────

const APPLICATION_STATUSES = [
  "SAVED",
  "APPLIED",
  "OA_RECEIVED",
  "INTERVIEW_SCHEDULED",
  "OFFER_RECEIVED",
  "REJECTED",
  "WITHDRAWN",
] as const;

export const createApplicationSchema = z.object({
  jobId: z.string().min(1, "Job ID is required"),
  status: z.enum(APPLICATION_STATUSES).optional(),
  note: z.string().max(1000).optional(),
});

export const updateApplicationSchema = z.object({
  status: z.enum(APPLICATION_STATUSES).optional(),
  notes: z.string().max(5000).optional(),
  coverLetter: z.string().max(15000).optional(),
  note: z.string().max(1000).optional(),
});

export const listApplicationsSchema = z.object({
  status: z.enum(APPLICATION_STATUSES).optional(),
  dateFrom: z.string().datetime({ offset: true }).optional(),
  dateTo: z.string().datetime({ offset: true }).optional(),
});

export type CreateApplicationInput = z.infer<typeof createApplicationSchema>;
export type UpdateApplicationInput = z.infer<typeof updateApplicationSchema>;
export type ListApplicationsInput = z.infer<typeof listApplicationsSchema>;

// ── Phase 11: Skill Gap Detection ─────────────────────────────────────────────

export const skillGapSchema = z.object({
  roleId: z.string().min(1, "Role ID is required"),
});

export type SkillGapInput = z.infer<typeof skillGapSchema>;

// ── Phase 12: AI Career Chatbot ────────────────────────────────────────────────

export const chatMessageSchema = z.object({
  message:      z.string().min(1, "Message cannot be empty").max(4000),
  sessionId:    z.string().uuid().optional(),
  resumeParsed: z.record(z.unknown()).optional(),
  savedJobs:    z.array(z.record(z.unknown())).optional(),
});

export type ChatMessageInput = z.infer<typeof chatMessageSchema>;

// ── Phase 13: Cover Letter Generator ──────────────────────────────────────────

export const coverLetterGenerateSchema = z.object({
  resumeId:       z.string().min(1),
  jobDescription: z.string().min(10),
  companyName:    z.string().min(1),
  jobTitle:       z.string().min(1),
  tone:           z.enum(["formal", "friendly", "direct"]).default("formal"),
});

export const coverLetterExportSchema = z.object({
  letterBody:    z.string().min(10),
  candidateName: z.string().optional(),
  jobTitle:      z.string().optional(),
  companyName:   z.string().optional(),
});

export const coverLetterSaveSchema = z.object({
  letter: z.string().min(1),
});

export type CoverLetterGenerateInput = z.infer<typeof coverLetterGenerateSchema>;
export type CoverLetterExportInput   = z.infer<typeof coverLetterExportSchema>;

export const interviewGenerateSchema = z.object({
  jobTitle:       z.string().min(1).max(200),
  jobDescription: z.string().max(8000).default(""),
  difficulty:     z.enum(["easy", "medium", "hard"]).default("medium"),
  sections:       z.array(z.string()).max(6).default([]),
  count:          z.number().int().min(1).max(30).default(10),
});

export const interviewMarksSchema = z.object({
  marks: z.record(z.enum(["correct", "review"]).nullable()),
});

export type InterviewGenerateInput = z.infer<typeof interviewGenerateSchema>;
export type InterviewMarksInput    = z.infer<typeof interviewMarksSchema>;

// ── Phase 15 — Career Roadmap ─────────────────────────────────────────────────

export const roadmapGenerateSchema = z.object({
  targetRole: z.string().min(1).max(200),
  gapReport:  z.record(z.unknown()).default({}),
  weeks:      z.number().int().min(4).max(52).default(12),
});

export const roadmapMarkStepSchema = z.object({
  done: z.boolean(),
});

export type RoadmapGenerateInput  = z.infer<typeof roadmapGenerateSchema>;
export type RoadmapMarkStepInput  = z.infer<typeof roadmapMarkStepSchema>;

// ── Phase 17 — Notifications ──────────────────────────────────────────────────

export const notificationAlertSchema = z.object({
  name:      z.string().min(1).max(100),
  filters:   z.object({
    keywords: z.string().max(200).optional(),
    location: z.string().max(100).optional(),
    jobType:  z.string().optional(),
    remote:   z.boolean().optional(),
  }).default({}),
  frequency: z.enum(["instant", "daily", "weekly"]).default("daily"),
});

export const updateNotificationAlertSchema = z.object({
  name:      z.string().min(1).max(100).optional(),
  filters:   z.object({
    keywords: z.string().max(200).optional(),
    location: z.string().max(100).optional(),
    jobType:  z.string().optional(),
    remote:   z.boolean().optional(),
  }).optional(),
  frequency: z.enum(["instant", "daily", "weekly"]).optional(),
  active:    z.boolean().optional(),
});

