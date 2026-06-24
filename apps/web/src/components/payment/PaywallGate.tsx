"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Lock, Sparkles, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";

interface PaywallGateProps {
  /** Feature name shown in the lock copy, e.g. "AI Cover Letter" */
  feature:    string;
  /** Short benefit line under the headline */
  description?: string;
  /** Wrapped content — shown blurred to give a preview */
  children:   React.ReactNode;
  /** Override the link target — defaults to /pricing */
  upgradeHref?: string;
  /** Skip the gate entirely (e.g. role-based override) */
  forceUnlocked?: boolean;
}

/**
 * Wraps a premium feature with a blurred preview + upgrade CTA for free users.
 * Admins and Premium users see the children directly.
 *
 *   <PaywallGate feature="AI Cover Letter">
 *     <CoverLetterForm />
 *   </PaywallGate>
 */
export function PaywallGate({
  feature,
  description,
  children,
  upgradeHref = "/pricing",
  forceUnlocked = false,
}: PaywallGateProps) {
  const { user, isLoading } = useAuth();

  // While auth bootstraps, render children — avoids a flash-of-paywall on
  // every navigation. The backend will still 403 if the user is actually free.
  if (isLoading) return <>{children}</>;
  if (forceUnlocked) return <>{children}</>;

  const isPremium = user?.role === "PREMIUM" || user?.role === "ADMIN";
  if (isPremium) return <>{children}</>;

  return (
    <div className="relative isolate">
      {/* Blurred preview — accessible: aria-hidden + pointer-events-none */}
      <div
        aria-hidden="true"
        className="pointer-events-none select-none blur-[6px] opacity-40 saturate-50"
      >
        {children}
      </div>

      {/* Overlay */}
      <div className="absolute inset-0 flex items-center justify-center p-6">
        <motion.div
          initial={{ opacity: 0, y: 8, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
          className="relative w-full max-w-md"
        >
          {/* Brand glow behind the card */}
          <div
            className="absolute -inset-px rounded-2xl pointer-events-none"
            style={{
              background:
                "linear-gradient(135deg, rgba(249,115,22,0.35) 0%, rgba(249,115,22,0.08) 50%, rgba(249,115,22,0.2) 100%)",
            }}
          />
          <div
            className="absolute inset-0 rounded-2xl pointer-events-none"
            style={{
              boxShadow:
                "0 0 60px -8px rgba(249,115,22,0.35), 0 0 120px -20px rgba(249,115,22,0.18)",
            }}
          />

          <div className="relative rounded-2xl border border-brand/40 bg-bg-card/95 backdrop-blur-md p-6 sm:p-8 text-center space-y-5">
            {/* Lock icon */}
            <div className="mx-auto w-12 h-12 rounded-xl bg-brand/15 border border-brand/30 flex items-center justify-center">
              <Lock className="w-5 h-5 text-brand" />
            </div>

            <div className="space-y-1.5">
              <p className="text-[10px] font-semibold text-brand uppercase tracking-[0.15em]">
                Premium feature
              </p>
              <h3 className="text-xl font-bold text-text-primary">{feature}</h3>
              {description && (
                <p className="text-sm text-text-secondary leading-relaxed max-w-xs mx-auto">
                  {description}
                </p>
              )}
            </div>

            <div className="flex flex-col gap-2.5 pt-1">
              <Link href={upgradeHref}>
                <Button className="w-full bg-brand hover:bg-brand-hover text-black font-semibold gap-2 shadow-[0_0_20px_rgba(249,115,22,0.3)] hover:shadow-[0_0_28px_rgba(249,115,22,0.45)]">
                  <Sparkles className="w-4 h-4" />
                  Upgrade to Premium
                  <ArrowRight className="w-3.5 h-3.5" />
                </Button>
              </Link>
              {!user && (
                <Link
                  href="/login"
                  className="text-xs text-text-muted hover:text-text-secondary underline underline-offset-2"
                >
                  Already have an account? Sign in
                </Link>
              )}
            </div>

            <p className="text-[11px] text-text-muted">
              Starts at ₹499/month · Cancel anytime
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
