"use client";

import { useRouter } from "next/navigation";
import { ShieldCheck, Star } from "lucide-react";
import type { PlanKey } from "@axiom/shared-types";
import { ScrollReveal } from "@/components/ScrollReveal";
import { PricingCard } from "@/components/payment/PricingCard";
import { usePayments } from "@/hooks/usePayments";
import { FALLBACK_PLANS, PLAN_FEATURES } from "@/lib/pricing";
import Link from "next/link";

const AVATARS = [
  { initials: "SJ", color: "#3B82F6" },
  { initials: "MK", color: "#8B5CF6" },
  { initials: "AR", color: "#10B981" },
  { initials: "TC", color: "#F59E0B" },
];

export function Pricing() {
  const router = useRouter();
  const { plans, isLoading } = usePayments();
  const displayPlans = plans.length > 0 ? plans : FALLBACK_PLANS;

  function handleSelect(_plan: PlanKey) {
    router.push("/pricing");
  }

  return (
    <section id="pricing" className="py-24 px-6 bg-bg-base relative">
      <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-border-subtle/80 to-transparent" />

      <div className="max-w-7xl mx-auto space-y-16">
        <ScrollReveal>
          <div className="space-y-4 max-w-2xl">
            <span className="text-[10px] font-semibold text-text-muted uppercase tracking-[0.15em]">
              Pricing
            </span>
            <h2 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-text-primary leading-[1.06]">
              One plan, three ways
              <br />
              <span className="text-text-secondary">to commit.</span>
            </h2>
            <p className="text-base text-text-secondary leading-relaxed">
              Premium starts at{" "}
              <span className="text-text-primary font-semibold">₹499/month</span>. Pay monthly to try it
              out, save 20% quarterly, or lock in 33% off annually.{" "}
              <Link href="/pricing" className="text-brand hover:underline font-medium">
                See all plans →
              </Link>
            </p>
            <p className="text-sm text-text-muted">
              Free tier includes resume upload, basic ATS score, and limited job matches — no card required.
            </p>
          </div>
        </ScrollReveal>

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
            {displayPlans.map((plan, idx) => (
              <PricingCard
                key={plan.plan}
                plan={plan}
                features={PLAN_FEATURES[plan.plan]}
                featured={plan.plan === "QUARTERLY"}
                ctaLabel="View plan"
                delay={idx * 0.08}
                onSelect={handleSelect}
              />
            ))}
          </div>
        )}

        <ScrollReveal>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6 sm:gap-10 pt-2">
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
        </ScrollReveal>
      </div>
    </section>
  );
}
