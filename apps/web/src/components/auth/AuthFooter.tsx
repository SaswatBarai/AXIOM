"use client";

import { ShieldCheck, Lock } from "lucide-react";

export function AuthFooter() {
  return (
    <div className="w-full mt-8 pt-6 border-t border-border-subtle/60 space-y-4">
      {/* Encryption & Trust Badge */}
      <div className="flex items-center justify-center gap-2 text-[11px] text-text-muted font-medium bg-bg-card/30 border border-border-subtle/50 py-1.5 px-3 rounded-full w-fit mx-auto">
        <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
        <span className="flex items-center gap-1">
          <Lock className="w-2.5 h-2.5 inline" /> Secure authentication by AXIOM Shield
        </span>
      </div>

      {/* User / Trust Count & Privacy Statement */}
      <div className="text-center space-y-1">
        <p className="text-[11px] text-text-secondary font-medium">
          Joined by over <span className="text-text-primary font-bold">12,000+ candidates</span> from
        </p>
        <div className="flex justify-center items-center gap-3 text-[10px] font-bold text-text-muted tracking-wider uppercase font-mono">
          <span>Stripe</span>
          <span className="text-border-subtle">•</span>
          <span>Vercel</span>
          <span className="text-border-subtle">•</span>
          <span>Linear</span>
          <span className="text-border-subtle">•</span>
          <span>Notion</span>
        </div>
        <p className="text-[10px] text-text-muted/80 max-w-[280px] mx-auto pt-2 leading-relaxed">
          We protect your privacy. Your credential data is fully encrypted and never shared.
        </p>
      </div>
    </div>
  );
}
