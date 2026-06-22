"use client";

import { useState, useRef } from "react";
import { useInView, motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Check, X } from "lucide-react";
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
    ctaText: "Start Free Trial",
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
    ctaLink: "mailto:sales@axiom.ai",
    highlighted: false,
  },
];

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
      <div
        onMouseMove={handleMouseMove}
        className={`border rounded-2xl p-8 flex flex-col justify-between relative overflow-hidden transition-all duration-300 w-full group ${
          plan.highlighted
            ? "border-zinc-500/60 bg-zinc-900/50 shadow-2xl lg:scale-[1.03] z-10 hover:lg:scale-[1.05]"
            : "border-zinc-800/70 bg-zinc-900/20 hover:border-zinc-700 hover:-translate-y-1"
        }`}
      >
        {/* Cursor spotlight */}
        <div
          className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none z-0"
          style={{
            background: `radial-gradient(320px circle at ${coords.x}px ${coords.y}px, rgba(255,255,255,${plan.highlighted ? "0.04" : "0.02"}), transparent 80%)`,
          }}
        />

        {plan.highlighted && (
          <div className="absolute top-6 right-6 z-10">
            <Badge className="bg-white text-black font-semibold text-[10px] px-2.5 py-1 hover:bg-zinc-100">
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
            <span className="text-4xl font-bold text-white tracking-tight">{plan.price}</span>
            <span className="text-xs text-zinc-600 font-medium uppercase tracking-wider">/ {plan.period}</span>
          </div>

          <div className="space-y-4 pt-1">
            <p className="text-[10px] font-semibold text-zinc-600 uppercase tracking-widest">What's included</p>
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
                <motion.li key={i} variants={featureVariants} className="flex items-start gap-2.5 text-sm text-zinc-700">
                  <X className="w-4 h-4 text-zinc-800 shrink-0 mt-0.5" />
                  <span className="leading-snug">{feature}</span>
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
                  ? "bg-white hover:bg-zinc-100 text-black shadow-lg"
                  : "bg-zinc-800/80 hover:bg-zinc-700 text-zinc-200 border border-zinc-700/60"
              }`}
            >
              {plan.ctaText}
            </Button>
          </Link>
        </div>
      </div>
    </motion.div>
  );
}

export function Pricing() {
  return (
    <section id="pricing" className="py-24 px-6 bg-[#09090b] relative">
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
      </div>
    </section>
  );
}