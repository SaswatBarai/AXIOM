"use client";

import Link from "next/link";
import { FloatingStats } from "./FloatingStats";
import { TestimonialCard } from "./TestimonialCard";

export function LoginHero() {
  return (
    <div className="hidden lg:flex w-[50%] xl:w-[52%] flex-col justify-between p-12 relative overflow-hidden border-r border-border-subtle/50 bg-bg-base/50">
      {/* Visual Canvas Grid */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,var(--color-border-subtle)_0.6px,transparent_0.6px),linear-gradient(to_bottom,var(--color-border-subtle)_0.6px,transparent_0.6px)] bg-[size:32px_32px] [mask-image:radial-gradient(ellipse_75%_75%_at_50%_50%,#000_60%,transparent_100%)] opacity-30 pointer-events-none" />

      {/* Premium Ambient Spotlight Beams */}
      <div className="absolute top-[-15%] left-[25%] w-[600px] h-[600px] bg-brand/5 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[400px] h-[400px] bg-emerald-500/5 rounded-full blur-[120px] pointer-events-none" />

      {/* Brand Logo */}
      <Link href="/" className="relative z-10 flex items-center gap-3 w-fit group">
        <div className="w-9 h-9 bg-brand rounded-xl flex items-center justify-center font-bold text-xl text-black shadow-lg shadow-brand/10 group-hover:scale-105 transition-transform duration-300">
          A
        </div>
        <span className="font-bold text-xl tracking-tight text-text-primary group-hover:text-text-primary/95 transition-colors">
          AXIOM
        </span>
      </Link>

      {/* Feature Canvas Composition */}
      <div className="relative z-10 flex-1 flex items-center justify-center py-6">
        <FloatingStats />
      </div>

      {/* Testimonial Quote */}
      <div className="relative z-10">
        <TestimonialCard />
      </div>
    </div>
  );
}
