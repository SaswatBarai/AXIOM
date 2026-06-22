"use client";

import { useState, useRef } from "react";
import { useInView, motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Check, Minus, ShieldCheck, Star } from "lucide-react";
import { ScrollReveal } from "@/components/ScrollReveal";
import Link from "next/link";

interface PricingPlan {
  name: string;
  price: string;
  period: string;
  description: string;
  features: string[];
  missingFeatures: string[];
  ctaText: string;
  ctaLink: string;
  highlighted: boolean;
}

const plans: PricingPlan[] = [
  {
    name: "Free",
    price: "$0",
    period: "forever",
    description: "Essential tools to get your job search moving.",
    features: [
      "Upload up to 3 resumes",
      "Basic ATS compatibility score",
      "5 automated job matches per day",
      "Standard application tracking board",
    ],
    missingFeatures: [
      "AI Career Copilot chat",
      "Interview prep simulation",
      "Skill gap detection audits",
      "Cover letter generator",
    ],
    ctaText: "Get Started Free",
    ctaLink: "/signup",
    highlighted: false,
  },
  {
    name: "Pro",
    price: "$9",
    period: "per month",
    description: "Full access to all AI engines and deep analysis tools.",
    features: [
      "Unlimited resume uploads & analytics",
      "Full ATS score breakdowns",
      "Unlimited automated job matches",
      "Interactive AI Career Copilot chat",
      "Automated interview prep question lists",
      "Dynamic skill gap detection audits",
      "Tailored cover letter generator",
    ],
    missingFeatures: [],
    ctaText: "Get Pro Access",
    ctaLink: "/signup",
    highlighted: true,
  },
  {
    name: "Enterprise",
    price: "Custom",
    period: "yearly billing",
    description: "Bespoke APIs and portals for campuses and recruiting agencies.",
    features: [
      "Everything in Pro",
      "University / agency multi-seat dashboards",
      "Custom ATS parsing engine integrations",
      "API for bulk candidate exports",
      "Dedicated account success manager",
      "Priority support",
    ],
    missingFeatures: [],
    ctaText: "Contact Sales",
    ctaLink: "mailto:sales@axiom.careers",
    highlighted: false,
  },
];

// ── Avatar stack ──────────────────────────────────────────────────────────────
const AVATARS = [
  { initials: "SJ", color: "#3B82F6" },
  { initials: "MK", color: "#8B5CF6" },
  { initials: "AR", color: "#10B981" },
  { initials: "TC", color: "#F59E0B" },
];

// ── Pricing card ──────────────────────────────────────────────────────────────
function PricingCard({ plan, delay }: { plan: PricingPlan; delay: number }) {
  const cardRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(cardRef, { once: true, margin: "-80px" });
  const [coords, setCoords] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    setCoords({ x: e.clientX - rect.left, y: e.clientY - rect.top });
  };

  const containerVariants = {
    hidden: {},
    visible: { transition: { staggerChildren: 0.05, delayChildren: delay + 0.1 } },
  };
  const featureVariants = {
    hidden: { opacity: 0, x: -5 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.3, ease: "easeOut" } },
  };

  return (
    <motion.div
      ref={cardRef}
      initial={{ opacity: 0, y: 14 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1], delay }}
      className="h-full flex w-full"
    >
      {/* Outer wrapper — brand glow for Pro */}
      <div className={`w-full relative ${plan.highlighted ? "lg:scale-[1.03] z-10" : ""}`}>
        {/* Brand glow ring behind the Pro card */}
        {plan.highlighted && (
          <div
            className="absolute -inset-[1px] rounded-[17px] pointer-events-none"
            style={{
              background: "linear-gradient(135deg, rgba(249,115,22,0.35) 0%, rgba(249,115,22,0.08) 50%, rgba(249,115,22,0.2) 100%)",
            }}
          />
        )}
        {plan.highlighted && (
          <div className="absolute inset-0 rounded-2xl pointer-events-none"
            style={{ boxShadow: "0 0 60px -8px rgba(249,115,22,0.4), 0 0 120px -20px rgba(249,115,22,0.2)" }}
          />
        )}

        <div
          onMouseMove={handleMouseMove}
          className={`border rounded-2xl p-8 flex flex-col justify-between relative overflow-hidden transition-all duration-300 w-full h-full group ${
            plan.highlighted
              ? "border-brand/40 bg-zinc-900/60 shadow-2xl hover:border-brand/60"
              : "border-zinc-800/70 bg-zinc-900/20 hover:border-zinc-700 hover:-translate-y-1"
          }`}
        >
          {/* Cursor spotlight */}
          <div
            className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none z-0"
            style={{
              background: `radial-gradient(320px circle at ${coords.x}px ${coords.y}px, rgba(255,255,255,${plan.highlighted ? "0.05" : "0.025"}), transparent 80%)`,
            }}
          />

          {plan.highlighted && (
            <div className="absolute top-6 right-6 z-10">
              <Badge className="bg-brand text-black font-semibold text-[10px] px-2.5 py-1 hover:bg-brand-hover">
                MOST POPULAR
              </Badge>
            </div>
          )}

          <div className="relative z-10 space-y-6">
            <div>
              <h3 className="text-lg font-bold text-white mb-1.5">{plan.name}</h3>
              <p className="text-sm text-zinc-500 leading-relaxed min-h-[40px]">{plan.description}</p>
            </div>

            <div className="flex items-baseline gap-2 py-4 border-y border-zinc-800/50">
              <span className={`text-4xl font-bold tracking-tight ${plan.highlighted ? "text-white" : "text-white"}`}>
                {plan.price}
              </span>
              <span className="text-xs text-zinc-600 font-medium uppercase tracking-wider">/ {plan.period}</span>
            </div>

            <div className="space-y-4 pt-1">
              <p className="text-[10px] font-semibold text-zinc-600 uppercase tracking-widest">What&apos;s included</p>
              <motion.ul
                variants={containerVariants}
                initial="hidden"
                animate={isInView ? "visible" : "hidden"}
                className="space-y-2.5"
              >
                {plan.features.map((feature, i) => (
                  <motion.li key={i} variants={featureVariants} className="flex items-start gap-2.5 text-sm text-zinc-300">
                    <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <span className="leading-snug">{feature}</span>
                  </motion.li>
                ))}
                {plan.missingFeatures.map((feature, i) => (
                  <motion.li key={i} variants={featureVariants} className="flex items-start gap-2.5 text-sm text-zinc-600">
                    <Minus className="w-4 h-4 text-zinc-700 shrink-0 mt-0.5" />
                    <span className="leading-snug line-through decoration-zinc-700/60">{feature}</span>
                  </motion.li>
                ))}
              </motion.ul>
            </div>
          </div>

          <div className="relative z-10 pt-8 mt-auto">
            <Link href={plan.ctaLink} className="w-full">
              <Button
                className={`w-full font-semibold py-5 text-sm transition-all duration-200 ${
                  plan.highlighted
                    ? "bg-brand hover:bg-brand-hover text-black shadow-[0_0_20px_rgba(249,115,22,0.3)] hover:shadow-[0_0_28px_rgba(249,115,22,0.45)]"
                    : "bg-zinc-800/80 hover:bg-zinc-700 text-zinc-200 border border-zinc-700/60"
                }`}
              >
                {plan.ctaText}
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// ── Main export ───────────────────────────────────────────────────────────────
export function Pricing() {
  return (
    <section id="pricing" className="py-24 px-6 bg-bg-base relative">
      {/* Top separator */}
      <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-zinc-800/80 to-transparent" />

      <div className="max-w-7xl mx-auto space-y-16">
        <ScrollReveal>
          <div className="space-y-4 max-w-2xl">
            <span className="text-[10px] font-semibold text-zinc-500 uppercase tracking-[0.15em]">
              Pricing Plans
            </span>
            <h2 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-white leading-[1.06]">
              Simple, transparent pricing
            </h2>
            <p className="text-base text-zinc-400 leading-relaxed">
              Pick the plan that fits your career goals. Upgrade or cancel any time.
            </p>
          </div>
        </ScrollReveal>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 max-w-6xl items-stretch">
          {plans.map((plan, idx) => (
            <PricingCard key={idx} plan={plan} delay={idx * 0.08} />
          ))}
        </div>

        {/* Social proof row */}
        <ScrollReveal>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6 sm:gap-10 pt-2">
            {/* Avatar + count */}
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
              <span className="text-sm text-zinc-400">
                <span className="text-white font-semibold">14,000+</span> job seekers joined
              </span>
            </div>

            <div className="h-4 w-px bg-zinc-800 hidden sm:block" />

            {/* Star rating */}
            <div className="flex items-center gap-2">
              <div className="flex gap-0.5">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className="w-3.5 h-3.5 fill-brand text-brand" />
                ))}
              </div>
              <span className="text-sm text-zinc-400">
                <span className="text-white font-semibold">4.9</span> / 5 rating
              </span>
            </div>

            <div className="h-4 w-px bg-zinc-800 hidden sm:block" />

            {/* Risk reversal */}
            <div className="flex items-center gap-2 text-sm text-zinc-400">
              <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
              Cancel anytime — no questions asked
            </div>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
