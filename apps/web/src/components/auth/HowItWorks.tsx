"use client";

import { Brain, Target, BarChart3, Sparkles } from "lucide-react";
import { FeatureStepCard } from "./FeatureStepCard";

const STEPS = [
  { icon: Brain, title: "Upload Resume", desc: "Drop your resume — AI extracts everything instantly." },
  { icon: Target, title: "Match Jobs", desc: "Semantic matching against thousands of live roles." },
  { icon: BarChart3, title: "Track & Improve", desc: "Analytics, gap detection, and copilot guidance." },
];

export function HowItWorks() {
  return (
    <div className="space-y-6">
      {/* Intro Header */}
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-text-muted">
          <Sparkles className="w-3.5 h-3.5" />
          <span className="text-[10px] font-bold uppercase tracking-widest">How AXIOM works</span>
        </div>
        <h2 className="text-xl sm:text-2xl font-extrabold text-text-primary leading-tight tracking-tight">
          From resume upload<br />to dream job in days.
        </h2>
      </div>

      {/* Steps List */}
      <div className="space-y-4">
        {STEPS.map((step, index) => (
          <FeatureStepCard
            key={step.title}
            icon={step.icon}
            stepIndex={index + 1}
            title={step.title}
            desc={step.desc}
            isLast={index === STEPS.length - 1}
          />
        ))}
      </div>
    </div>
  );
}
