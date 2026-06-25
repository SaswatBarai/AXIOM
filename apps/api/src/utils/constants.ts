// ── Cache TTL (seconds) ────────────────────────────────────────────────────
export const TTL = {
  ACCESS_TOKEN: 15 * 60,          // 15 min
  REFRESH_TOKEN: 7 * 24 * 60 * 60, // 7 days
  OTP: 15 * 60,                   // 15 min
  OAUTH_STATE: 10 * 60,           // 10 min
  USER_PROFILE: 5 * 60,           // 5 min
  JOB_LIST: 10 * 60,              // 10 min
  JOB_DETAIL: 30 * 60,            // 30 min
  ATS_RESULT: 60 * 60,            // 1 hour
} as const;

// ── Redis key factory ─────────────────────────────────────────────────────
export const CacheKey = {
  refreshToken: (userId: string) => `auth:refresh:${userId}`,
  blacklist: (jti: string) => `auth:bl:${jti}`,
  otp: (email: string) => `auth:otp:${email}`,
  resetOtp: (email: string) => `auth:reset:${email}`,
  oauthState: (state: string) => `auth:oauth:state:${state}`,
  userProfile: (userId: string) => `user:profile:${userId}`,
  jobList: (page: number, filters: string) => `jobs:list:${page}:${filters}`,
  jobDetail: (jobId: string) => `jobs:detail:${jobId}`,
  atsResult: (resumeId: string) => `resume:ats:${resumeId}`,
  suspension: (userId: string) => `user:suspended:${userId}`,
  appStats: (userId: string) => `applications:stats:${userId}`,
} as const;

// ── Rate limiting ─────────────────────────────────────────────────────────
export const RATE_LIMIT = {
  GLOBAL_MAX: 100,
  GLOBAL_WINDOW_MS: 15 * 60 * 1000,
  AUTH_MAX: 5,
  AUTH_WINDOW_MS: 15 * 60 * 1000,
} as const;

// ── Pagination ────────────────────────────────────────────────────────────
export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 20,
} as const;

// ── File upload ───────────────────────────────────────────────────────────
export const UPLOAD = {
  MAX_SIZE_BYTES: 5 * 1024 * 1024, // 5 MB
  ALLOWED_TYPES: ["application/pdf", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"],
} as const;
