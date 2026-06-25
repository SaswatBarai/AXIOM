import type { PlanCatalogItem, PlanKey } from "@axiom/shared-types";

// ── Entitlement values (kept in sync with apps/api/src/config/plan-entitlements.ts) ──
// These are duplicated here so the frontend doesn't import from the API package.
// The API is the authoritative enforcement source; this drives marketing copy only.
const ENTITLEMENT_COPY: Record<PlanKey, {
  chatMessagesPerHour: number;
  coverLettersPerHour: number;
  interviewSessionsPerHour: number;
  roadmapsPerHour: number;
  skillGapsPerHour: number;
  maxJobAlerts: number;
  resumeUploads: number;
  analyzePerMonth: number;
}> = {
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

function qty(n: number): string {
  return n === -1 ? "Unlimited" : String(n);
}

function buildFeatures(plan: PlanKey): string[] {
  const e = ENTITLEMENT_COPY[plan];
  return [
    `${qty(e.analyzePerMonth)} ATS resume analyse${e.analyzePerMonth === 1 ? "" : "s"}/month`,
    `${e.chatMessagesPerHour} AI chat messages/hour`,
    `${e.coverLettersPerHour} cover letters/hour`,
    `${e.interviewSessionsPerHour} interview sessions/hour`,
    `${e.skillGapsPerHour} skill gap analyses/hour`,
    `${e.roadmapsPerHour} career roadmaps/hour`,
    `Up to ${e.maxJobAlerts} job alert${e.maxJobAlerts === 1 ? "" : "s"}`,
    `Up to ${e.resumeUploads} resumes stored`,
    "Analytics dashboard",
    "Priority email support",
  ];
}

/** Feature bullets per paid plan — generated from entitlement values so copy cannot drift. */
export const PLAN_FEATURES: Record<PlanKey, string[]> = {
  MONTHLY:   buildFeatures("MONTHLY"),
  QUARTERLY: buildFeatures("QUARTERLY"),
  ANNUAL:    buildFeatures("ANNUAL"),
};

/** Fallback when /api/payments/pricing is unreachable (matches API plan catalog). */
export const FALLBACK_PLANS: PlanCatalogItem[] = [
  { plan: "MONTHLY",   label: "Monthly",   amountPaise: 49_900,  currency: "INR", intervalMonths: 1  },
  { plan: "QUARTERLY", label: "Quarterly", amountPaise: 119_900, currency: "INR", intervalMonths: 3  },
  { plan: "ANNUAL",    label: "Annual",    amountPaise: 399_900, currency: "INR", intervalMonths: 12 },
];

export function formatInrPaise(paise: number): string {
  return `₹${(paise / 100).toLocaleString("en-IN")}`;
}

export function planPeriodLabel(months: number): string {
  if (months === 1)  return "month";
  if (months === 3)  return "quarter";
  if (months === 12) return "year";
  return `${months}mo`;
}

export function monthlyEquivalentPaise(amountPaise: number, intervalMonths: number): number {
  return Math.round(amountPaise / intervalMonths);
}
