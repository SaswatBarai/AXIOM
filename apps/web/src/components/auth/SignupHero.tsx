"use client";

import Link from "next/link";
import { Star } from "lucide-react";
import { HowItWorks } from "./HowItWorks";
import { StatsSection } from "./StatsSection";
import { Card } from "@/components/ui/card";

export function SignupHero() {
  return (
    <div className="hidden lg:flex w-[50%] xl:w-[52%] flex-col justify-between p-12 relative overflow-hidden border-r border-border-subtle/50 bg-bg-base/50">
      {/* Background canvas decorative patterns */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,var(--color-border-subtle)_0.6px,transparent_0.6px),linear-gradient(to_bottom,var(--color-border-subtle)_0.6px,transparent_0.6px)] bg-[size:32px_32px] [mask-image:radial-gradient(ellipse_75%_75%_at_50%_50%,#000_60%,transparent_100%)] opacity-30 pointer-events-none" />

      {/* Spotlights */}
      <div className="absolute top-[-10%] left-[20%] w-[500px] h-[500px] bg-brand/5 rounded-full blur-[130px] pointer-events-none" />
      <div className="absolute bottom-[-15%] right-[10%] w-[450px] h-[450px] bg-emerald-500/5 rounded-full blur-[140px] pointer-events-none" />

      {/* Brand logo */}
      <Link href="/" className="relative z-10 flex items-center gap-3 w-fit group">
        <div className="w-9 h-9 bg-brand rounded-xl flex items-center justify-center font-bold text-xl text-black shadow-lg shadow-brand/10 group-hover:scale-105 transition-transform duration-300">
          A
        </div>
        <span className="font-bold text-xl tracking-tight text-text-primary group-hover:text-text-primary/95 transition-colors">
          AXIOM
        </span>
      </Link>

      {/* Flow & Progress timeline layout */}
      <div className="relative z-10 my-auto py-8">
        <HowItWorks />
      </div>

      {/* Testimonial & Counters */}
      <div className="relative z-10 space-y-6">
        <Card className="border border-border-subtle bg-bg-card/25 backdrop-blur-md p-5 rounded-2xl shadow-xl max-w-md relative overflow-hidden">
          <div className="flex gap-1 mb-2.5">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star key={i} className="w-3.5 h-3.5 fill-brand text-brand" />
            ))}
          </div>
          <p className="text-xs sm:text-sm text-text-secondary leading-relaxed font-medium mb-3">
            &ldquo;Within 10 days I had 4 callbacks. The AI resume coach is genuinely game-changing.&rdquo;
          </p>
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-full bg-brand/10 border border-brand/20 flex items-center justify-center text-xs font-bold text-brand shadow-inner">
              M
            </div>
            <div>
              <div className="text-xs font-bold text-text-primary">Marcus T.</div>
              <div className="text-[10px] font-medium text-text-muted">Software Engineer · Google</div>
            </div>
          </div>
        </Card>

        <StatsSection />
      </div>
    </div>
  );
}
