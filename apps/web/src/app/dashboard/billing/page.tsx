"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import {
  CheckCircle2,
  AlertTriangle,
  Loader2,
  Receipt,
  Sparkles,
  ArrowRight,
  XCircle,
  Clock,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { usePayments } from "@/hooks/usePayments";
import type { PaymentStatus, PlanView, SubscriptionStatus } from "@axiom/shared-types";

// ── Helpers ──────────────────────────────────────────────────────────────────

function formatINR(paise: number): string {
  return `₹${(paise / 100).toLocaleString("en-IN")}`;
}

function formatDate(iso: string | null): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-IN", {
    day:   "numeric",
    month: "short",
    year:  "numeric",
  });
}

function statusTone(status: SubscriptionStatus): {
  bg: string; border: string; text: string; label: string; icon: React.ReactNode;
} {
  switch (status) {
    case "ACTIVE":
      return {
        bg: "bg-emerald-500/10",
        border: "border-emerald-500/30",
        text: "text-emerald-300",
        label: "Active",
        icon: <CheckCircle2 className="w-3.5 h-3.5" />,
      };
    case "PAST_DUE":
      return {
        bg: "bg-amber-500/10",
        border: "border-amber-500/30",
        text: "text-amber-300",
        label: "Payment past due",
        icon: <AlertTriangle className="w-3.5 h-3.5" />,
      };
    case "CANCELLED":
      return {
        bg: "bg-zinc-500/10",
        border: "border-zinc-500/30",
        text: "text-zinc-300",
        label: "Cancelled — ends at period end",
        icon: <Clock className="w-3.5 h-3.5" />,
      };
    case "EXPIRED":
      return {
        bg: "bg-red-500/10",
        border: "border-red-500/30",
        text: "text-red-300",
        label: "Expired",
        icon: <XCircle className="w-3.5 h-3.5" />,
      };
  }
}

function paymentTone(s: PaymentStatus): string {
  switch (s) {
    case "CAPTURED": return "text-emerald-300";
    case "PENDING":  return "text-amber-300";
    case "FAILED":   return "text-red-300";
    case "REFUNDED": return "text-zinc-400";
  }
}

function planLabel(plan: PlanView): string {
  if (plan === "FREE") return "Free";
  return plan.charAt(0) + plan.slice(1).toLowerCase();
}

// ── Page ─────────────────────────────────────────────────────────────────────

export default function BillingPage() {
  const params = useSearchParams();
  const {
    subscription,
    history,
    isLoading,
    error,
    cancel,
  } = usePayments();

  const [isCancelling, setIsCancelling] = useState(false);
  const [cancelError, setCancelError]   = useState<string | null>(null);
  const [confirmOpen, setConfirmOpen]   = useState(false);
  const [showWelcome, setShowWelcome]   = useState(false);

  useEffect(() => {
    if (params.get("upgraded") === "1") {
      setShowWelcome(true);
      const t = setTimeout(() => setShowWelcome(false), 6_000);
      return () => clearTimeout(t);
    }
  }, [params]);

  async function handleCancel() {
    setIsCancelling(true);
    setCancelError(null);
    try {
      await cancel();
      setConfirmOpen(false);
    } catch (err) {
      setCancelError(err instanceof Error ? err.message : "Cancellation failed");
    } finally {
      setIsCancelling(false);
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center text-text-muted">
        <Loader2 className="w-5 h-5 animate-spin mr-2" />
        Loading billing…
      </div>
    );
  }

  const isFree = !subscription || subscription.plan === "FREE";
  const status = subscription?.status ?? "ACTIVE";
  const tone   = statusTone(status);

  return (
    <div className="px-4 sm:px-6 py-8 sm:py-10 max-w-5xl mx-auto space-y-8 min-h-full">
      {/* Header */}
      <div className="flex items-end justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-text-primary">Billing</h1>
          <p className="text-sm text-text-secondary mt-1">
            Manage your subscription, see receipts, and update your plan.
          </p>
        </div>
        {!isFree && (
          <Link href="/pricing">
            <Button
              variant="outline"
              className="border-border-subtle bg-bg-elevated hover:bg-bg-hover text-text-primary gap-1.5"
            >
              Change plan <ArrowRight className="w-3.5 h-3.5" />
            </Button>
          </Link>
        )}
      </div>

      {/* Welcome toast after fresh upgrade */}
      {showWelcome && (
        <motion.div
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          className="px-4 py-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-sm text-emerald-300 flex items-center gap-2"
        >
          <Sparkles className="w-4 h-4" />
          Welcome to Premium — all AI features are now unlocked.
        </motion.div>
      )}

      {error && (
        <div className="px-4 py-3 bg-red-500/10 border border-red-500/30 rounded-xl text-sm text-red-300">
          {error}
        </div>
      )}

      {/* Plan card */}
      <Card className="border border-border-subtle bg-bg-card/40 p-6 sm:p-8 rounded-2xl">
        {isFree ? (
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5">
            <div>
              <p className="text-[10px] font-semibold text-text-muted uppercase tracking-widest">
                Current plan
              </p>
              <h2 className="text-2xl font-bold mt-1 text-text-primary">Free</h2>
              <p className="text-sm text-text-secondary mt-2 max-w-md">
                Upgrade to Premium for unlimited resume analyses, the AI Career Copilot,
                cover letters, interview prep, and more.
              </p>
            </div>
            <Link href="/pricing">
              <Button className="bg-brand hover:bg-brand-hover text-black font-semibold shadow-[0_0_20px_rgba(249,115,22,0.3)] hover:shadow-[0_0_28px_rgba(249,115,22,0.45)] gap-2">
                <Sparkles className="w-4 h-4" />
                Upgrade to Premium
              </Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <p className="text-[10px] font-semibold text-text-muted uppercase tracking-widest">
                Current plan
              </p>
              <div className="flex items-center gap-2 mt-1">
                <h2 className="text-2xl font-bold text-text-primary">
                  {planLabel(subscription.plan)}
                </h2>
                <Badge
                  variant="outline"
                  className={`${tone.bg} ${tone.border} ${tone.text} gap-1`}
                >
                  {tone.icon}
                  <span className="text-[10px] font-semibold uppercase tracking-wide">
                    {tone.label}
                  </span>
                </Badge>
              </div>
              {subscription.cancelAtPeriodEnd && (
                <p className="mt-2 text-xs text-amber-300">
                  Renewal off — premium access ends on{" "}
                  {formatDate(subscription.currentPeriodEnd)}.
                </p>
              )}
            </div>

            <div className="space-y-3">
              <Row label="Current period" value={`${formatDate(subscription.currentPeriodStart)} → ${formatDate(subscription.currentPeriodEnd)}`} />
              <Row label="Auto-renew"     value={subscription.cancelAtPeriodEnd ? "Off (cancelled)" : "On"} />
            </div>

            <div className="sm:col-span-2 pt-4 border-t border-border-subtle/60 flex flex-col sm:flex-row gap-3 sm:justify-end">
              {!subscription.cancelAtPeriodEnd && status === "ACTIVE" && (
                <Button
                  variant="outline"
                  onClick={() => setConfirmOpen(true)}
                  className="border-border-subtle bg-bg-elevated hover:bg-bg-hover text-text-primary"
                >
                  Cancel subscription
                </Button>
              )}
              <Link href="/pricing">
                <Button className="bg-brand hover:bg-brand-hover text-black font-semibold gap-2">
                  Change plan <ArrowRight className="w-3.5 h-3.5" />
                </Button>
              </Link>
            </div>
          </div>
        )}
      </Card>

      {/* Plan entitlements */}
      {!isFree && subscription.entitlements && (
        <Card className="border border-border-subtle bg-bg-card/40 p-6 sm:p-8 rounded-2xl">
          <h2 className="text-sm font-semibold text-text-primary mb-4">Included in your plan</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <EntitlementTile label="AI chat messages/hr"   value={subscription.entitlements.chatMessagesPerHour} />
            <EntitlementTile label="Cover letters/hr"      value={subscription.entitlements.coverLettersPerHour} />
            <EntitlementTile label="Interview sessions/hr" value={subscription.entitlements.interviewSessionsPerHour} />
            <EntitlementTile label="Roadmaps/hr"           value={subscription.entitlements.roadmapsPerHour} />
            <EntitlementTile label="Skill analyses/hr"     value={subscription.entitlements.skillGapsPerHour} />
            <EntitlementTile label="Job alerts"            value={subscription.entitlements.maxJobAlerts} />
            <EntitlementTile label="Resumes stored"        value={subscription.entitlements.resumeUploads} />
            <EntitlementTile label="ATS analyses/month"    value={subscription.entitlements.analyzePerMonth} />
          </div>
        </Card>
      )}

      {/* Cancel confirmation */}
      {confirmOpen && (
        <Card className="border border-amber-500/30 bg-amber-500/5 p-6 rounded-2xl">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-400 mt-0.5 shrink-0" />
            <div className="flex-1">
              <p className="text-sm font-medium text-text-primary">Cancel your subscription?</p>
              <p className="text-xs text-text-secondary mt-1">
                You&apos;ll keep premium access until{" "}
                <span className="text-text-primary font-medium">
                  {formatDate(subscription?.currentPeriodEnd ?? null)}
                </span>
                . After that, your account reverts to Free — all your data stays intact.
              </p>
              {cancelError && (
                <p className="mt-2 text-xs text-red-300">{cancelError}</p>
              )}
              <div className="mt-4 flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => setConfirmOpen(false)}
                  disabled={isCancelling}
                  className="border-border-subtle bg-bg-elevated hover:bg-bg-hover text-text-primary"
                >
                  Keep subscription
                </Button>
                <Button
                  onClick={handleCancel}
                  disabled={isCancelling}
                  className="bg-red-500 hover:bg-red-600 text-white"
                >
                  {isCancelling ? (
                    <span className="flex items-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin" /> Cancelling…
                    </span>
                  ) : "Yes, cancel"}
                </Button>
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Payment history */}
      <div>
        <h2 className="text-base font-semibold text-text-primary flex items-center gap-2 mb-3">
          <Receipt className="w-4 h-4 text-text-muted" />
          Payment history
        </h2>
        <Card className="border border-border-subtle bg-bg-card/40 rounded-2xl overflow-hidden">
          {history.length === 0 ? (
            <div className="p-10 text-center text-sm text-text-muted">
              No payments yet.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border-subtle text-[10px] uppercase tracking-widest text-text-muted">
                    <th className="text-left  px-5 py-3 font-medium">Date</th>
                    <th className="text-left  px-5 py-3 font-medium">Plan</th>
                    <th className="text-right px-5 py-3 font-medium">Amount</th>
                    <th className="text-left  px-5 py-3 font-medium">Status</th>
                    <th className="text-left  px-5 py-3 font-medium">Reference</th>
                  </tr>
                </thead>
                <tbody>
                  {history.map((p) => (
                    <tr key={p.id} className="border-b border-border-subtle/60 last:border-b-0 hover:bg-bg-elevated/30 transition-colors">
                      <td className="px-5 py-3 text-text-secondary">{formatDate(p.createdAt)}</td>
                      <td className="px-5 py-3 text-text-primary">{planLabel(p.plan)}</td>
                      <td className="px-5 py-3 text-right text-text-primary tabular-nums">{formatINR(p.amount)}</td>
                      <td className={`px-5 py-3 font-medium ${paymentTone(p.status)}`}>
                        {p.status.charAt(0) + p.status.slice(1).toLowerCase()}
                      </td>
                      <td className="px-5 py-3 text-text-muted font-mono text-xs">
                        {p.razorpayPaymentId ?? p.razorpayOrderId}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline justify-between gap-3">
      <span className="text-[10px] font-semibold text-text-muted uppercase tracking-widest">{label}</span>
      <span className="text-sm text-text-primary">{value}</span>
    </div>
  );
}

function EntitlementTile({ label, value }: { label: string; value: number }) {
  const display = value === -1 ? "Unlimited" : String(value);
  return (
    <div className="rounded-xl border border-border-subtle/60 bg-bg-elevated/40 px-4 py-3 flex flex-col gap-1">
      <span className="text-lg font-bold text-text-primary tabular-nums">{display}</span>
      <span className="text-[10px] font-medium text-text-muted uppercase tracking-wide leading-tight">{label}</span>
    </div>
  );
}
