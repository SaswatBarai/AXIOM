export type PlanKey = "MONTHLY" | "QUARTERLY" | "ANNUAL";
export type PlanView = "FREE" | PlanKey;
export type SubscriptionStatus = "ACTIVE" | "PAST_DUE" | "CANCELLED" | "EXPIRED";
export type PaymentStatus = "PENDING" | "CAPTURED" | "FAILED" | "REFUNDED";

export interface PlanCatalogItem {
  plan: PlanKey;
  label: string;
  amountPaise: number;
  currency: "INR";
  intervalMonths: number;
}

export interface Entitlements {
  chatMessagesPerHour: number;
  coverLettersPerHour: number;
  interviewSessionsPerHour: number;
  roadmapsPerHour: number;
  skillGapsPerHour: number;
  maxJobAlerts: number;
  resumeUploads: number;
  analyzePerMonth: number;
}

export interface SubscriptionView {
  plan: PlanView;
  status: SubscriptionStatus;
  currentPeriodStart: string | null;
  currentPeriodEnd: string | null;
  cancelAtPeriodEnd: boolean;
  entitlements: Entitlements;
}

export interface PaymentRow {
  id: string;
  razorpayOrderId: string;
  razorpayPaymentId: string | null;
  amount: number;
  currency: string;
  plan: PlanKey;
  status: PaymentStatus;
  createdAt: string;
}

export interface CreateOrderResponse {
  orderId: string;
  amount: number;
  currency: "INR";
  plan: PlanKey;
  keyId: string;
}

export interface CreateSubscriptionResponse {
  subscriptionId: string;
  plan: PlanKey;
  keyId: string;
}

export interface VerifyPaymentResponse {
  alreadyCaptured: boolean;
  subscription: SubscriptionView;
}
