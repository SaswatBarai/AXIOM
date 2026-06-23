"use client";

import { Star } from "lucide-react";
import { Card } from "@/components/ui/card";

export function TestimonialCard() {
  return (
    <Card className="border border-border-subtle bg-bg-card/25 backdrop-blur-md p-6 rounded-2xl shadow-xl max-w-sm mt-auto relative overflow-hidden">
      {/* Subtle quote accent background */}
      <div className="absolute -top-4 -right-4 text-[120px] font-serif text-text-muted/5 pointer-events-none select-none">
        &ldquo;
      </div>

      <div className="flex gap-1 mb-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <Star key={i} className="w-3.5 h-3.5 fill-brand text-brand" />
        ))}
      </div>
      <blockquote className="text-sm text-text-secondary leading-relaxed font-medium mb-4">
        &ldquo;AXIOM helped me land interviews at Stripe and Vercel within two weeks of uploading my resume.&rdquo;
      </blockquote>
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-full bg-brand/10 border border-brand/20 flex items-center justify-center text-xs font-bold text-brand shadow-inner">
          S
        </div>
        <div>
          <div className="text-xs font-bold text-text-primary">Sarah K.</div>
          <div className="text-[10px] font-medium text-text-muted">Software Engineer · Stripe</div>
        </div>
      </div>
    </Card>
  );
}
