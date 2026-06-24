import type { PlanCatalogItem, PlanKey } from "@axiom/shared-types";

/** Feature bullets per paid plan — shared by landing + /pricing. */
export const PLAN_FEATURES: Record<PlanKey, string[]> = {
  MONTHLY: [
    "Unlimited resume analyses",
    "AI Career Copilot (chat)",
    "Cover letter generator",
    "Interview prep simulator",
    "Skill gap detection",
    "Career roadmap generator",
    "Analytics dashboard",
    "Priority email support",
  ],
  QUARTERLY: [
    "Everything in Monthly",
    "Save 20% vs paying monthly",
    "Up to 10 job alerts",
    "Priority queue on AI features",
    "Quarterly career strategy email",
  ],
  ANNUAL: [
    "Everything in Quarterly",
    "Save 33% vs paying monthly",
    "Up to 25 active job alerts",
    "Early access to new AI features",
    "Annual career strategy session",
  ],
};

/** Fallback when /api/payments/pricing is unreachable (matches API plan catalog). */
export const FALLBACK_PLANS: PlanCatalogItem[] = [
  { plan: "MONTHLY", label: "Monthly", amountPaise: 49_900, currency: "INR", intervalMonths: 1 },
  { plan: "QUARTERLY", label: "Quarterly", amountPaise: 119_900, currency: "INR", intervalMonths: 3 },
  { plan: "ANNUAL", label: "Annual", amountPaise: 399_900, currency: "INR", intervalMonths: 12 },
];

export function formatInrPaise(paise: number): string {
  return `₹${(paise / 100).toLocaleString("en-IN")}`;
}

export function planPeriodLabel(months: number): string {
  if (months === 1) return "month";
  if (months === 3) return "quarter";
  if (months === 12) return "year";
  return `${months}mo`;
}

export function monthlyEquivalentPaise(amountPaise: number, intervalMonths: number): number {
  return Math.round(amountPaise / intervalMonths);
}
