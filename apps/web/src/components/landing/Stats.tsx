"use client";

import { useRef, useEffect, useState } from "react";
import { useInView } from "framer-motion";
import { Users, TrendingUp, Zap, Briefcase } from "lucide-react";

interface Stat {
  raw: number;
  suffix: string;
  label: string;
  sublabel: string;
  icon: React.ElementType;
  duration: number;
}

const STATS: Stat[] = [
  { raw: 14,    suffix: "k+",  label: "Active Users",          sublabel: "job seekers onboard",        icon: Users,      duration: 1200 },
  { raw: 89,    suffix: "%",   label: "Interview Rate",         sublabel: "saw callback within 2 weeks", icon: TrendingUp, duration: 1400 },
  { raw: 3.2,   suffix: "×",   label: "Faster Job Search",      sublabel: "vs. manual applications",     icon: Zap,        duration: 1000 },
  { raw: 50,    suffix: "k+",  label: "Jobs Matched Monthly",   sublabel: "across all major boards",      icon: Briefcase,  duration: 1300 },
];

function StatCounter({ stat, isInView }: { stat: Stat; isInView: boolean }) {
  const [count, setCount] = useState(0);
  const isDecimal = !Number.isInteger(stat.raw);

  useEffect(() => {
    if (!isInView) return;
    let raf: number;
    const start = performance.now();
    const tick = (now: number) => {
      const p = Math.min((now - start) / stat.duration, 1);
      const ease = 1 - Math.pow(1 - p, 3);
      setCount(parseFloat((ease * stat.raw).toFixed(isDecimal ? 1 : 0)));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [isInView, stat.raw, stat.duration, isDecimal]);

  return (
    <span className="text-4xl sm:text-5xl font-extrabold tracking-tight text-white tabular-nums">
      {isDecimal ? count.toFixed(1) : count}{stat.suffix}
    </span>
  );
}

export function Stats() {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section className="relative py-16 px-6 bg-bg-base overflow-hidden">
      {/* Top separator */}
      <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-zinc-800/80 to-transparent" />
      {/* Bottom separator */}
      <div className="absolute bottom-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-zinc-800/80 to-transparent" />
      {/* Subtle background tint */}
      <div className="absolute inset-0 bg-zinc-900/20 pointer-events-none" />

      <div ref={ref} className="relative max-w-6xl mx-auto">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-0">
          {STATS.map((stat, i) => {
            const Icon = stat.icon;
            const isLast = i === STATS.length - 1;
            return (
              <div
                key={stat.label}
                className={`flex flex-col items-center text-center px-8 py-6 ${
                  !isLast ? "border-r border-zinc-800/60" : ""
                }`}
              >
                <div className="w-9 h-9 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center mb-4">
                  <Icon className="w-4 h-4 text-brand" />
                </div>
                <StatCounter stat={stat} isInView={isInView} />
                <p className="text-sm font-semibold text-zinc-300 mt-1.5">{stat.label}</p>
                <p className="text-[11px] text-zinc-600 mt-0.5 leading-snug max-w-[130px]">{stat.sublabel}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
