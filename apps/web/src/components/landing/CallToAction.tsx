"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollReveal } from "@/components/ScrollReveal";

const AVATARS = [
  { initials: "SJ", color: "#3B82F6" },
  { initials: "MK", color: "#8B5CF6" },
  { initials: "AR", color: "#10B981" },
  { initials: "TC", color: "#F59E0B" },
  { initials: "LS", color: "#EF4444" },
];

export function CallToAction() {
  return (
    <section className="py-20 px-6 bg-bg-base">
      {/* Separator */}
      <div className="max-w-7xl mx-auto mb-20 h-px bg-gradient-to-r from-transparent via-border-subtle/60 to-transparent" />

      <div className="max-w-4xl mx-auto">
        <ScrollReveal>
          <div className="relative rounded-3xl border border-border-subtle bg-bg-card/25 p-12 md:p-16 text-center overflow-hidden">

            {/* Brand glow at top */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-[160px] bg-brand/[0.08] rounded-full blur-[80px] pointer-events-none" />
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-px bg-gradient-to-r from-transparent via-brand/30 to-transparent pointer-events-none" />

            {/* Dot grid */}
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                backgroundImage: "radial-gradient(var(--grid-dot-color) 1px, transparent 1px)",
                backgroundSize: "24px 24px",
                maskImage: "radial-gradient(ellipse 80% 80% at 50% 50%, #000 50%, transparent 100%)",
                WebkitMaskImage: "radial-gradient(ellipse 80% 80% at 50% 50%, #000 50%, transparent 100%)",
              }}
            />

            <div className="relative z-10 flex flex-col items-center gap-7">
              {/* Label */}
              <span className="text-[10px] font-semibold text-text-muted uppercase tracking-[0.15em]">
                Get Started Today
              </span>

              {/* Headline */}
              <h2 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-text-primary leading-[1.06]">
                Start landing interviews
                <br />
                in days, not months.
              </h2>

              {/* Sub copy */}
              <p className="text-base text-text-secondary max-w-md leading-relaxed">
                Join 14,000+ job seekers using AXIOM to optimize their resume,
                match smarter, and move faster through every application.
              </p>

              {/* Social proof */}
              <div className="flex items-center gap-3">
                <div className="flex -space-x-2">
                  {AVATARS.map((av) => (
                    <div
                      key={av.initials}
                      className="w-8 h-8 rounded-full border-2 border-bg-base flex items-center justify-center text-[10px] font-bold text-white shrink-0"
                      style={{ backgroundColor: av.color }}
                    >
                      {av.initials}
                    </div>
                  ))}
                </div>
                <div className="flex gap-0.5">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <svg key={i} className="w-3.5 h-3.5" viewBox="0 0 12 12" fill="#f97316">
                      <path d="M6 1l1.24 2.51 2.76.4-2 1.95.47 2.75L6 7.5 3.53 8.61l.47-2.75-2-1.95 2.76-.4z" />
                    </svg>
                  ))}
                </div>
                <span className="text-xs text-text-secondary">4.9 / 5 from early users</span>
              </div>

              {/* CTA */}
              <div className="flex flex-col sm:flex-row items-center gap-4 pt-2">
                <Link href="/signup">
                  <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                    <Button
                      size="lg"
                      className="bg-brand hover:bg-brand-hover text-black font-semibold h-12 px-9 text-sm flex items-center gap-2 group shadow-[0_0_32px_rgba(249,115,22,0.3)] hover:shadow-[0_0_48px_rgba(249,115,22,0.45)] transition-all duration-200"
                    >
                      Get started free
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                    </Button>
                  </motion.div>
                </Link>
                <div className="flex flex-col sm:flex-row items-center gap-2 text-xs text-text-muted">
                  <span className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> No credit card
                  </span>
                  <span className="hidden sm:block text-border-medium">·</span>
                  <span className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> Free tier forever
                  </span>
                  <span className="hidden sm:block text-border-medium">·</span>
                  <span className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> Cancel anytime
                  </span>
                </div>
              </div>
            </div>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
