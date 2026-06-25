"use client";

import { LucideIcon } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface FeatureStepCardProps {
  icon: LucideIcon;
  stepIndex: number;
  title: string;
  desc: string;
  isLast?: boolean;
}

export function FeatureStepCard({ icon: Icon, stepIndex, title, desc, isLast }: FeatureStepCardProps) {
  return (
    <div className="relative flex gap-4">
      {/* Connector line for steps */}
      {!isLast && (
        <div className="absolute left-[18px] top-9 bottom-[-16px] w-[2px] bg-border-subtle/40 z-0" />
      )}

      {/* Step badge/Icon */}
      <div className="relative z-10 w-9 h-9 rounded-xl bg-bg-elevated border border-border-subtle flex items-center justify-center shrink-0 shadow-sm text-text-secondary hover:text-brand transition-colors duration-200">
        <Icon className="w-4.5 h-4.5" />
      </div>

      {/* Text Info */}
      <div className="min-w-0 pb-4">
        <div className="text-[9px] font-bold text-text-muted uppercase tracking-widest mb-0.5">
          Step {stepIndex}
        </div>
        <h4 className="text-sm font-bold text-text-primary mb-1">
          {title}
        </h4>
        <p className="text-xs text-text-secondary leading-relaxed">
          {desc}
        </p>
      </div>
    </div>
  );
}
