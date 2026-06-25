"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { motion } from "framer-motion";
import { ShieldCheck, Star, ArrowRight, Sparkles } from "lucide-react";
import type { PlanKey } from "@axiom/shared-types";
import { ScrollReveal } from "@/components/ScrollReveal";
import { Badge } from "@/components/ui/badge";
import { PricingCard } from "@/components/payment/PricingCard";
import { Navbar } from "@/components/landing/Navbar";
import { Footer } from "@/components/landing/Footer";
import { useAuth } from "@/hooks/useAuth";
import { usePayments } from "@/hooks/usePayments";
import { PLAN_FEATURES } from "@/lib/pricing";

const AVATARS = [
  { initials: "SJ", color: "#3B82F6" },
  { initials: "MK", color: "#8B5CF6" },
  { initials: "AR", color: "#10B981" },
  { initials: "TC", color: "#F59E0B" },
];

export default function PricingPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const { plans, subscription, isLoading, isCheckingOut, error, subscribe } = usePayments();

  const [selectedPlan, setSelectedPlan] = useState<PlanKey | null>(null);

  async function handleSelect(plan: PlanKey) {
    if (!isAuthenticated) {
      router.push(`/login?next=${encodeURIComponent("/pricing")}`);
      return;
    }
    setSelectedPlan(plan);
    try {
      await subscribe(plan);
      router.push("/dashboard/billing?upgraded=1");
    } catch {
      // Error already surfaced via hook; reset spinner so user can retry.
      setSelectedPlan(null);
    }
  }

  return (
    <main className="min-h-screen bg-bg-base text-text-primary">
      <Navbar />

      {/* Hero — eyebrow + headline + free-tier note */}
      <section className="pt-32 pb-12 px-6 relative">
        {/* Soft ambient glow behind heading */}
        <div
          className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[480px] -translate-y-1/4 rounded-full blur-3xl pointer-events-none"
          style={{ background: "radial-gradient(ellipse at center, rgba(249,115,22,0.10), transparent 70%)" }}
        />

        <div className="max-w-4xl mx-auto text-center space-y-5 relative">
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <Badge
              variant="outline"
              className="border-border-subtle bg-bg-elevated/50 backdrop-blur text-text-secondary gap-1.5"
            >
              <Sparkles className="w-3 h-3 text-brand" />
              <span className="text-[10px] uppercase tracking-[0.15em] font-semibold">Pricing</span>
            </Badge>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1], delay: 0.05 }}
            className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight leading-[1.04]"
          >
            One plan, three ways
            <br />
            <span className="text-text-secondary">to commit.</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1], delay: 0.15 }}
            className="text-base sm:text-lg text-text-secondary max-w-2xl mx-auto leading-relaxed"
          >
            Pay monthly to try it out, save 20% on the quarterly, or lock in 33% off with the annual.
            Cancel anytime and keep premium access until the period ends.
          </motion.p>

          {subscription && subscription.plan !== "FREE" && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-sm text-emerald-300"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              You&apos;re on the{" "}
              <span className="font-semibold text-emerald-200">
                {subscription.plan.charAt(0) + subscription.plan.slice(1).toLowerCase()}
              </span>{" "}
              plan
              <button
                onClick={() => router.push("/dashboard/billing")}
                className="ml-2 underline underline-offset-2 hover:text-emerald-100"
              >
                Manage <ArrowRight className="w-3 h-3 inline" />
              </button>
            </motion.div>
          )}
        </div>
      </section>

      {/* Plans grid */}
      <section className="px-6 pb-24">
        <div className="max-w-6xl mx-auto">
          {error && (
            <div className="mb-6 mx-auto max-w-xl px-4 py-3 bg-red-500/10 border border-red-500/30 rounded-lg text-sm text-red-300 text-center">
              {error}
            </div>
          )}

          {isLoading ? (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 max-w-6xl items-stretch">
              {Array.from({ length: 3 }).map((_, i) => (
                <div
                  key={i}
                  className="h-[520px] rounded-2xl border border-border-subtle bg-bg-card/30 animate-pulse"
                />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 max-w-6xl items-stretch">
              {plans.map((plan, idx) => (
                <PricingCard
                  key={plan.plan}
                  plan={plan}
                  features={PLAN_FEATURES[plan.plan]}
                  featured={plan.plan === "QUARTERLY"}
                  ctaLabel={
                    subscription && subscription.plan !== "FREE" ? "Switch to this plan" : "Get Premium"
                  }
                  loading={isCheckingOut && selectedPlan === plan.plan}
                  disabled={isCheckingOut}
                  currentPlan={subscription?.plan ?? null}
                  delay={idx * 0.08}
                  onSelect={handleSelect}
                />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Trust / social proof row — mirrors landing Pricing */}
      <ScrollReveal>
        <section className="pb-24 px-6">
          <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-center gap-6 sm:gap-10">
            <div className="flex items-center gap-3">
              <div className="flex -space-x-2">
                {AVATARS.map((av) => (
                  <div
                    key={av.initials}
                    className="w-7 h-7 rounded-full border-2 border-bg-base flex items-center justify-center text-[10px] font-bold text-white shrink-0"
                    style={{ backgroundColor: av.color }}
                  >
                    {av.initials}
                  </div>
                ))}
              </div>
              <span className="text-sm text-text-secondary">
                <span className="text-text-primary font-semibold">14,000+</span> job seekers joined
              </span>
            </div>

            <div className="h-4 w-px bg-border-subtle hidden sm:block" />

            <div className="flex items-center gap-2">
              <div className="flex gap-0.5">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className="w-3.5 h-3.5 fill-brand text-brand" />
                ))}
              </div>
              <span className="text-sm text-text-secondary">
                <span className="text-text-primary font-semibold">4.9</span> / 5 rating
              </span>
            </div>

            <div className="h-4 w-px bg-border-subtle hidden sm:block" />

            <div className="flex items-center gap-2 text-sm text-text-secondary">
              <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
              Cancel anytime — no questions asked
            </div>
          </div>
        </section>
      </ScrollReveal>

      <Footer />
    </main>
  );
}
