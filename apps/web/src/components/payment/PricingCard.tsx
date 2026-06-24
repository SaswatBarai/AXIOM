"use client";

import { useRef, useState } from "react";
import { motion, useInView } from "framer-motion";
import { Check, Loader2, Sparkles } from "lucide-react";
import type { PlanCatalogItem, PlanKey, PlanView } from "@axiom/shared-types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface PricingCardProps {
  plan:         PlanCatalogItem;
  featured?:    boolean;
  features:     string[];
  ctaLabel:     string;
  loading?:     boolean;
  disabled?:    boolean;
  currentPlan?: PlanView | null;
  delay?:       number;
  onSelect:     (plan: PlanKey) => void;
}

function formatPrice(paise: number): string {
  return `₹${(paise / 100).toLocaleString("en-IN")}`;
}

function periodLabel(months: number): string {
  if (months === 1)  return "month";
  if (months === 3)  return "quarter";
  if (months === 12) return "year";
  return `${months}mo`;
}

export function PricingCard({
  plan,
  featured = false,
  features,
  ctaLabel,
  loading = false,
  disabled = false,
  currentPlan,
  delay = 0,
  onSelect,
}: PricingCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(cardRef, { once: true, margin: "-80px" });
  const [coords, setCoords] = useState({ x: 0, y: 0 });

  const isCurrent = currentPlan === plan.plan;

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
    hidden:  { opacity: 0, x: -5 },
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
      <div className={`w-full relative ${featured ? "lg:scale-[1.03] z-10" : ""}`}>
        {/* Brand glow ring for the featured card */}
        {featured && (
          <>
            <div
              className="absolute -inset-[1px] rounded-[17px] pointer-events-none"
              style={{
                background:
                  "linear-gradient(135deg, rgba(249,115,22,0.35) 0%, rgba(249,115,22,0.08) 50%, rgba(249,115,22,0.2) 100%)",
              }}
            />
            <div
              className="absolute inset-0 rounded-2xl pointer-events-none"
              style={{
                boxShadow:
                  "0 0 60px -8px rgba(249,115,22,0.4), 0 0 120px -20px rgba(249,115,22,0.2)",
              }}
            />
          </>
        )}

        <div
          onMouseMove={handleMouseMove}
          className={`border rounded-2xl p-8 flex flex-col justify-between relative overflow-hidden transition-all duration-300 w-full h-full group ${
            featured
              ? "border-brand/40 bg-bg-card/60 shadow-2xl hover:border-brand/60"
              : "border-border-subtle bg-bg-card/20 hover:border-border-medium hover:-translate-y-1"
          }`}
        >
          {/* Cursor spotlight */}
          <div
            className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none z-0"
            style={{
              background: `radial-gradient(320px circle at ${coords.x}px ${coords.y}px, var(--spotlight-color, rgba(255,255,255,0.04)), transparent 80%)`,
            }}
          />

          {featured && (
            <div className="absolute top-6 right-6 z-10">
              <Badge className="bg-brand text-black font-semibold text-[10px] px-2.5 py-1 hover:bg-brand-hover gap-1">
                <Sparkles className="w-3 h-3" />
                MOST POPULAR
              </Badge>
            </div>
          )}

          <div className="relative z-10 space-y-6">
            <div>
              <h3 className="text-lg font-bold text-text-primary mb-1.5">{plan.label}</h3>
              <p className="text-sm text-text-muted leading-relaxed min-h-[40px]">
                {featured
                  ? "Full access to every AI engine — pause or cancel anytime."
                  : plan.intervalMonths === 12
                  ? "Best value — locked-in pricing for 12 months."
                  : "Try Premium without long-term commitment."}
              </p>
            </div>

            <div className="flex items-baseline gap-2 py-4 border-y border-border-subtle/50">
              <span className="text-4xl font-bold tracking-tight text-text-primary tabular-nums">
                {formatPrice(plan.amountPaise)}
              </span>
              <span className="text-xs text-text-muted font-medium uppercase tracking-wider">
                / {periodLabel(plan.intervalMonths)}
              </span>
            </div>

            {plan.intervalMonths > 1 && (
              <p className="-mt-3 text-[11px] text-text-muted">
                ≈ ₹
                {Math.round(plan.amountPaise / 100 / plan.intervalMonths).toLocaleString("en-IN")} / month
              </p>
            )}

            <div className="space-y-4 pt-1">
              <p className="text-[10px] font-semibold text-text-muted uppercase tracking-widest">
                What&apos;s included
              </p>
              <motion.ul
                variants={containerVariants}
                initial="hidden"
                animate={isInView ? "visible" : "hidden"}
                className="space-y-2.5"
              >
                {features.map((f, i) => (
                  <motion.li
                    key={i}
                    variants={featureVariants}
                    className="flex items-start gap-2.5 text-sm text-text-secondary"
                  >
                    <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <span className="leading-snug">{f}</span>
                  </motion.li>
                ))}
              </motion.ul>
            </div>
          </div>

          {/* CTA */}
          <div className="relative z-10 pt-8 mt-auto">
            <Button
              onClick={() => onSelect(plan.plan)}
              disabled={disabled || loading || isCurrent}
              className={`w-full font-semibold py-5 text-sm transition-all duration-200 ${
                featured
                  ? "bg-brand hover:bg-brand-hover text-black shadow-[0_0_20px_rgba(249,115,22,0.3)] hover:shadow-[0_0_28px_rgba(249,115,22,0.45)] disabled:opacity-60"
                  : "bg-bg-elevated hover:bg-bg-hover text-text-primary border border-border-subtle disabled:opacity-60"
              }`}
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Processing…
                </span>
              ) : isCurrent ? "Current plan" : ctaLabel}
            </Button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
