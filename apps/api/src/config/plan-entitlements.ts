import type { PlanView } from "@axiom/shared-types";

export interface Entitlements {
  chatMessagesPerHour: number;
  coverLettersPerHour: number;
  interviewSessionsPerHour: number;
  roadmapsPerHour: number;
  skillGapsPerHour: number;
  maxJobAlerts: number;     // 0 = blocked, -1 = unlimited
  resumeUploads: number;    // max total resumes allowed
  analyzePerMonth: number;  // ATS analysis calls per month (-1 = unlimited)
}

const BASE: Record<PlanView, Entitlements> = {
  FREE: {
    chatMessagesPerHour:      0,
    coverLettersPerHour:      0,
    interviewSessionsPerHour: 0,
    roadmapsPerHour:          0,
    skillGapsPerHour:         0,
    maxJobAlerts:             0,
    resumeUploads:            1,
    analyzePerMonth:          1,
  },
  MONTHLY: {
    chatMessagesPerHour:      50,
    coverLettersPerHour:      10,
    interviewSessionsPerHour: 20,
    roadmapsPerHour:          10,
    skillGapsPerHour:         30,
    maxJobAlerts:             3,
    resumeUploads:            3,
    analyzePerMonth:          10,
  },
  QUARTERLY: {
    chatMessagesPerHour:      100,
    coverLettersPerHour:      20,
    interviewSessionsPerHour: 40,
    roadmapsPerHour:          20,
    skillGapsPerHour:         60,
    maxJobAlerts:             10,
    resumeUploads:            5,
    analyzePerMonth:          30,
  },
  ANNUAL: {
    chatMessagesPerHour:      200,
    coverLettersPerHour:      40,
    interviewSessionsPerHour: 80,
    roadmapsPerHour:          40,
    skillGapsPerHour:         120,
    maxJobAlerts:             25,
    resumeUploads:            10,
    analyzePerMonth:          -1,
  },
};

// In development, multiply all positive numeric limits by 10 to avoid
// blocking local testing with tight quotas.
const DEV = process.env.NODE_ENV === "development";

function scale(e: Entitlements): Entitlements {
  if (!DEV) return e;
  const s = (v: number) => (v > 0 ? v * 10 : v);
  return {
    chatMessagesPerHour:      s(e.chatMessagesPerHour),
    coverLettersPerHour:      s(e.coverLettersPerHour),
    interviewSessionsPerHour: s(e.interviewSessionsPerHour),
    roadmapsPerHour:          s(e.roadmapsPerHour),
    skillGapsPerHour:         s(e.skillGapsPerHour),
    maxJobAlerts:             s(e.maxJobAlerts),
    resumeUploads:            s(e.resumeUploads),
    analyzePerMonth:          s(e.analyzePerMonth),
  };
}

export const PLAN_ENTITLEMENTS: Record<PlanView, Entitlements> = {
  FREE:      scale(BASE.FREE),
  MONTHLY:   scale(BASE.MONTHLY),
  QUARTERLY: scale(BASE.QUARTERLY),
  ANNUAL:    scale(BASE.ANNUAL),
};

const VALID_PLANS = new Set<string>(["FREE", "MONTHLY", "QUARTERLY", "ANNUAL"]);

export function getEntitlements(plan: string | null | undefined): Entitlements {
  if (plan && VALID_PLANS.has(plan)) {
    return PLAN_ENTITLEMENTS[plan as PlanView];
  }
  return PLAN_ENTITLEMENTS.FREE;
}
