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
    description: "Essential tools to help you get started on your job search journey.",
    features: [
      "Upload up to 3 resumes",
      "Basic ATS compatibility score",
      "5 automated job matches per day",
      "Standard application tracking Kanban board"
    ],
    missingFeatures: [
      "AI Career Copilot chat suggestions",
      "Automated interview prep simulation",
      "Skill gap detection audits",
      "Tailored cover letter generator"
    ],
    ctaText: "Get Started Free",
    ctaLink: "/signup",
    highlighted: false
  },
  {
    name: "Pro",
    price: "$9",
    period: "per month",
    description: "Full access to our AI career copilot suite and deep analysis engines.",
    features: [
      "Unlimited resume uploads & analytics",
      "Full ATS compatibility score breakdowns",
      "Unlimited automated job matches",
      "Interactive AI Career Copilot chat",
      "Automated interview prep question lists",
      "Dynamic skill gap detection audits",
      "Tailored cover letter generator"
    ],
    missingFeatures: [],
    ctaText: "Start Free Trial",
    ctaLink: "/signup",
    highlighted: true
  },
  {
    name: "Enterprise",
    price: "Custom",
    period: "yearly billing",
    description: "Bespoke tools and integration APIs for university campuses and recruiting agencies.",
    features: [
      "Everything in Pro plan",
      "University portal / Agency multi-seat dashboards",
      "Custom ATS parsing engine integrations",
      "API integrations for bulk candidate exports",
      "Dedicated account success manager",
      "Priority customer service support"
    ],
    missingFeatures: [],
    ctaText: "Contact Sales",
    ctaLink: "mailto:sales@axiom.ai",
    highlighted: false
  }
];

// Reusable premium animated Pricing Card component
function PricingCard({ plan, delay }: { plan: PricingPlan; delay: number }) {
  const cardRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(cardRef, { once: true, margin: "-80px" });
  const [coords, setCoords] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    setCoords({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    });
  };

  const containerVariants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: 0.05,
        delayChildren: delay + 0.1
      }
    }
  };

  const featureVariants = {
    hidden: { opacity: 0, x: -6 },
    visible: {
      opacity: 1,
      x: 0,
      transition: { duration: 0.35, ease: "easeOut" }
    }
  };

  return (
    <motion.div
      ref={cardRef}
      initial={{ opacity: 0, y: 15 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 15 }}
      transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1], delay }}
      className="h-full flex w-full"
    >
      <div
        onMouseMove={handleMouseMove}
        className={`border rounded-2xl p-8 flex flex-col justify-between relative overflow-hidden transition-all duration-300 w-full group ${
          plan.highlighted
            ? "border-zinc-200 bg-zinc-900/60 shadow-2xl lg:scale-105 z-10 hover:lg:scale-[1.07] hover:shadow-[0_0_30px_rgba(255,255,255,0.05)]"
            : "border-zinc-800 bg-zinc-900/30 hover:border-zinc-700 hover:-translate-y-1"
        }`}
      >
        {/* Dynamic Cursor Spotlight Overlay */}
        <div
          className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none z-0"
          style={{
            background: plan.highlighted
              ? `radial-gradient(350px circle at ${coords.x}px ${coords.y}px, rgba(255,255,255,0.045), transparent 80%)`
              : `radial-gradient(350px circle at ${coords.x}px ${coords.y}px, rgba(255,255,255,0.025), transparent 80%)`
          }}
        />

        {plan.highlighted && (
          <div className="absolute top-6 right-6 z-10">
            <Badge className="bg-white text-black font-semibold border-white hover:bg-zinc-200">
              MOST POPULAR
            </Badge>
          </div>
        )}

        {/* Top Details */}
        <div className="relative z-10 space-y-6">
          <div>
            <h3 className="text-xl font-bold text-white mb-2">{plan.name}</h3>
            <p className="text-sm text-zinc-400 leading-relaxed font-normal min-h-[40px]">{plan.description}</p>
          </div>

          <div className="flex items-baseline gap-2 py-4 border-y border-zinc-800/60">
            <span className="text-5xl font-bold text-white tracking-tight">{plan.price}</span>
            <span className="text-xs text-zinc-500 font-medium uppercase tracking-wider">/ {plan.period}</span>
          </div>

          {/* Features List */}
          <div className="space-y-4 pt-2">
            <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">What's included</p>
            <motion.ul
              variants={containerVariants}
              initial="hidden"
              animate={isInView ? "visible" : "hidden"}
              className="space-y-3"
            >
              {plan.features.map((feature, fIdx) => (
                <motion.li key={fIdx} variants={featureVariants} className="flex items-start gap-3 text-sm text-zinc-300">
                  <Check className="w-4.5 h-4.5 text-emerald-400 shrink-0 mt-0.5" />
                  <span className="leading-normal">{feature}</span>
                </motion.li>
              ))}
              {plan.missingFeatures.map((feature, fIdx) => (
                <motion.li key={fIdx} variants={featureVariants} className="flex items-start gap-3 text-sm text-zinc-600">
                  <X className="w-4.5 h-4.5 text-zinc-800 shrink-0 mt-0.5" />
                  <span className="leading-normal">{feature}</span>
                </motion.li>
              ))}
            </motion.ul>
          </div>
        </div>

        {/* CTA Action Button */}
        <div className="relative z-10 pt-8 mt-auto">
          <Link href={plan.ctaLink} className="w-full">
            <Button
              className={`w-full font-semibold py-6 text-sm hover:scale-[1.01] active:scale-[0.99] transition-transform duration-200 ${
                plan.highlighted
                  ? "bg-white hover:bg-zinc-200 text-black shadow-lg"
                  : "bg-zinc-800 hover:bg-zinc-700 text-zinc-100 border border-zinc-700"
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
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.015)_0%,transparent_60%)] pointer-events-none" />

      <div className="max-w-7xl mx-auto space-y-16">
        
        {/* Header */}
        <ScrollReveal>
          <div className="text-center space-y-4 max-w-3xl mx-auto">
            <Badge variant="outline" className="border-zinc-800 text-zinc-400 px-3 py-1 font-medium bg-zinc-900/30">
              Pricing Plans
            </Badge>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-white animate-pulse-slow">
              Simple, transparent pricing
            </h2>
            <p className="text-base sm:text-lg text-zinc-400 font-normal">
              Choose the plan that fits your career aspirations. Cancel anytime.
            </p>
          </div>
        </ScrollReveal>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-6xl mx-auto items-stretch">
          {plans.map((plan, idx) => (
            <PricingCard key={idx} plan={plan} delay={idx * 0.1} />
          ))}
        </div>
      </div>
    </section>
  );
}
