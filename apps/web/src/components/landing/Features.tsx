"use client";

import Link from "next/link";
import { useState, useRef } from "react";
import { useInView, motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { ScrollReveal } from "@/components/ScrollReveal";
import {
  FileText, Briefcase, MessagesSquare, HelpCircle,
  BarChart3, PenTool, KanbanSquare, Zap, ArrowRight,
  CheckCircle2, ChevronRight, Clock, Sliders, Send,
} from "lucide-react";

// ── Data ───────────────────────────────────────────────────────────────────
const JOBS = [
  { co: "Stripe",  role: "Staff Eng",   score: "94%", hi: true  },
  { co: "Vercel",  role: "SWE II",      score: "81%", hi: false },
  { co: "Linear",  role: "Backend Eng", score: "76%", hi: false },
] as const;

const PIPELINE = [
  { label: "Applied",   count: 47, bg: "bg-zinc-800",   text: "text-zinc-200" },
  { label: "Screening", count: 18, bg: "bg-zinc-700",   text: "text-zinc-100" },
  { label: "Interview", count: 7,  bg: "bg-brand/70",   text: "text-orange-100" },
  { label: "Offer",     count: 2,  bg: "bg-brand",      text: "text-black"    },
] as const;

const METRICS = [
  { label: "Response Rate",  value: "34%", delta: "+8%"  },
  { label: "Interview Rate", value: "12%", delta: "+5%"  },
  { label: "Offer Rate",     value: "3%",  delta: "+2%"  },
] as const;

const CHAT_MSGS = [
  { from: "ai",   text: "Hi! Ask me about salary, interviews, or your resume." },
  { from: "user", text: "How do I pitch my remote preference?" },
  { from: "ai",   text: 'Lead with impact. "I shipped X while fully remote" removes the risk before you even negotiate.' },
  { from: "user", text: "What about the compensation ask?" },
] as const;

const LETTER_LINES = [
  { t: "Dear Hiring Team at Vercel,",                               op: "text-zinc-300" },
  { t: "I'm excited to apply for the Senior Engineer role.",        op: "text-zinc-400" },
  { t: "My experience building Next.js applications at scale",      op: "text-zinc-400" },
  { t: "aligns perfectly with Vercel's mission to make the web",   op: "text-zinc-400" },
  { t: "faster and more accessible for every developer.",           op: "text-zinc-500" },
  { t: "",                                                           op: ""              },
  { t: "Over the last 3 years I shipped features used by…",        op: "text-zinc-600" },
] as const;

const CHART_DATA = [28, 34, 29, 46, 42, 55, 50, 63, 58, 72, 68, 85];

// ── Spotlight card ─────────────────────────────────────────────────────────
function SpotlightCard({
  children,
  className = "",
  intensity = 0.03,
}: {
  children: React.ReactNode;
  className?: string;
  intensity?: number;
}) {
  const [pos, setPos] = useState({ x: 0, y: 0 });
  return (
    <div
      className={`relative overflow-hidden rounded-2xl group ${className}`}
      onMouseMove={(e) => {
        const r = e.currentTarget.getBoundingClientRect();
        setPos({ x: e.clientX - r.left, y: e.clientY - r.top });
      }}
    >
      <div
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none z-20"
        style={{
          background: `radial-gradient(300px circle at ${pos.x}px ${pos.y}px, rgba(255,255,255,${intensity}), transparent 80%)`,
        }}
      />
      {children}
    </div>
  );
}

// ── ATS ring ───────────────────────────────────────────────────────────────
const CIRC = 2 * Math.PI * 44; // ≈ 276

function AtsRing({ score, inView }: { score: number; inView: boolean }) {
  return (
    <div className="relative w-28 h-28 shrink-0">
      <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
        <circle cx="50" cy="50" r="44" fill="none" stroke="#27272a" strokeWidth="5.5" />
        <motion.circle
          cx="50" cy="50" r="44"
          fill="none" stroke="#f97316" strokeWidth="5.5" strokeLinecap="round"
          strokeDasharray={CIRC}
          initial={{ strokeDashoffset: CIRC }}
          animate={inView ? { strokeDashoffset: CIRC * (1 - score / 100) } : { strokeDashoffset: CIRC }}
          transition={{ duration: 1.6, ease: [0.16, 1, 0.3, 1], delay: 0.4 }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-2xl font-extrabold text-white tabular-nums leading-none">{score}</span>
        <span className="text-[9px] text-zinc-500 font-semibold uppercase tracking-wider mt-0.5">ATS Score</span>
      </div>
    </div>
  );
}

// ── Animated category bar ──────────────────────────────────────────────────
function CatBar({ label, value, inView, delay }: { label: string; value: number; inView: boolean; delay: number }) {
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-[10px]">
        <span className="text-zinc-500">{label}</span>
        <span className="text-zinc-300 font-bold tabular-nums">{value}%</span>
      </div>
      <div className="h-[3px] bg-zinc-900 rounded-full overflow-hidden">
        <motion.div
          className="h-full rounded-full bg-gradient-to-r from-brand to-orange-300"
          initial={{ width: 0 }}
          animate={inView ? { width: `${value}%` } : { width: 0 }}
          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1], delay }}
        />
      </div>
    </div>
  );
}

// ── SVG area chart ─────────────────────────────────────────────────────────
function AreaChart({ inView }: { inView: boolean }) {
  const W = 200, H = 52;
  const pts = CHART_DATA.map((v, i) => ({
    x: (i / (CHART_DATA.length - 1)) * W,
    y: H - (v / 100) * H,
  }));
  const lineD = pts.map((p, i) => `${i === 0 ? "M" : "L"}${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(" ");
  const areaD = `${lineD} L${W},${H} L0,${H} Z`;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" className="w-full h-full">
      <defs>
        <linearGradient id="aGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#f97316" stopOpacity="0.22" />
          <stop offset="100%" stopColor="#f97316" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={areaD} fill="url(#aGrad)" />
      <motion.path
        d={lineD}
        fill="none"
        stroke="#f97316"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        initial={{ pathLength: 0, opacity: 0 }}
        animate={inView ? { pathLength: 1, opacity: 1 } : {}}
        transition={{ duration: 1.4, ease: "easeOut", delay: 0.2 }}
      />
    </svg>
  );
}

// ── Main export ────────────────────────────────────────────────────────────
export function Features() {
  const heroRef       = useRef<HTMLDivElement>(null);
  const heroInView    = useInView(heroRef, { once: true, margin: "-60px" });
  const analyticsRef  = useRef<HTMLDivElement>(null);
  const analyticsInView = useInView(analyticsRef, { once: true, margin: "-60px" });

  return (
    <section id="features" className="py-32 px-6 bg-bg-base relative overflow-hidden">
      <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-zinc-800/80 to-transparent" />

      <div className="max-w-7xl mx-auto space-y-20">

        {/* Section header */}
        <ScrollReveal>
          <div className="space-y-4 max-w-2xl">
            <span className="text-[10px] font-semibold text-zinc-500 uppercase tracking-[0.15em]">Platform Core</span>
            <h2 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-white leading-[1.06]">
              Everything you need,<br />in one workspace
            </h2>
            <p className="text-base text-zinc-400 leading-relaxed">
              Eight AI engines, unified into a single dashboard built for the modern job search.
            </p>
          </div>
        </ScrollReveal>

        {/* ── Bento grid ─────────────────────────────────────────────────── */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 lg:auto-rows-[260px]">

          {/* 01 — Resume Analyzer ★ 2×2 hero ───────────────────────────── */}
          <ScrollReveal className="lg:col-span-2 lg:row-span-2">
            <SpotlightCard intensity={0.05} className="h-full">
              {/* Brand shimmer edge */}
              <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-brand/60 to-transparent pointer-events-none z-10" />
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-20 bg-brand/[0.06] blur-3xl pointer-events-none" />

              <div
                ref={heroRef}
                className="border border-brand/25 bg-zinc-900/15 rounded-2xl p-8 h-full flex flex-col gap-6 hover:border-brand/40 transition-all duration-300 overflow-hidden relative"
              >
                {/* Card header */}
                <div className="flex items-center justify-between shrink-0">
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-lg bg-brand/10 border border-brand/20 flex items-center justify-center">
                      <FileText className="w-3.5 h-3.5 text-brand" />
                    </div>
                    <span className="text-xs font-semibold text-zinc-400">Resume Analyzer</span>
                  </div>
                  <Badge className="bg-brand/10 text-brand border border-brand/20 text-[9px] font-bold hover:bg-brand/10">
                    FEATURED
                  </Badge>
                </div>

                {/* Content */}
                <div className="grid grid-cols-1 lg:grid-cols-[auto_1fr] gap-8 flex-1 min-h-0">

                  {/* Left — ring + candidate pill */}
                  <div className="flex flex-col items-center lg:items-start gap-4">
                    <AtsRing score={87} inView={heroInView} />
                    <div className="bg-zinc-950/70 border border-zinc-800/60 rounded-xl p-3.5 w-full space-y-2">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center text-[10px] text-white font-bold shrink-0">
                          JD
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-[11px] font-bold text-white leading-none truncate">John Doe</p>
                          <p className="text-[9px] text-zinc-500 mt-0.5">Senior Data Engineer</p>
                        </div>
                        <span className="text-[8px] font-bold text-emerald-400 bg-emerald-400/10 border border-emerald-400/20 rounded px-1.5 py-0.5 shrink-0">
                          READY
                        </span>
                      </div>
                      <p className="text-[9px] text-zinc-600 font-mono border-t border-zinc-900 pt-2 leading-relaxed">
                        Python · SQL · Kafka · K8s · Spark
                      </p>
                    </div>
                  </div>

                  {/* Right — breakdown bars */}
                  <div className="flex flex-col gap-4">
                    <p className="text-[10px] font-semibold text-zinc-600 uppercase tracking-widest">Score breakdown</p>
                    <div className="space-y-4 flex-1">
                      <CatBar label="Format & Layout"    value={92} inView={heroInView} delay={0.55} />
                      <CatBar label="Keyword Coverage"   value={84} inView={heroInView} delay={0.70} />
                      <CatBar label="Skills Match"       value={81} inView={heroInView} delay={0.85} />
                      <CatBar label="ATS Compatibility"  value={87} inView={heroInView} delay={1.00} />
                    </div>
                    <Link href="/signup" className="group/link flex items-center gap-1.5 text-xs text-zinc-500 hover:text-white transition-colors font-medium w-fit mt-auto">
                      Analyze Resume <ArrowRight className="w-3.5 h-3.5 group-hover/link:translate-x-0.5 transition-transform" />
                    </Link>
                  </div>

                </div>
              </div>
            </SpotlightCard>
          </ScrollReveal>

          {/* 02 — Semantic Job Match ─────────────────────────────────────── */}
          <ScrollReveal>
            <SpotlightCard className="h-full">
              <div className="border border-zinc-800/70 bg-zinc-900/10 rounded-2xl p-6 h-full flex flex-col justify-between hover:border-zinc-700 hover:bg-zinc-900/20 transition-all duration-300">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center">
                    <Briefcase className="w-3 h-3 text-zinc-400" />
                  </div>
                  <span className="text-[10px] font-semibold text-zinc-600 uppercase tracking-widest">Match Engine</span>
                </div>

                {/* Big number */}
                <div className="text-center">
                  <motion.div
                    initial={{ opacity: 0, scale: 0.85 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                  >
                    <span className="text-6xl font-extrabold text-white tabular-nums leading-none">
                      94<span className="text-brand text-4xl">%</span>
                    </span>
                  </motion.div>
                  <p className="text-[10px] text-zinc-600 mt-1.5">Top match · Staff Eng at Stripe</p>
                </div>

                {/* Job list */}
                <div className="space-y-1.5">
                  {JOBS.map(({ co, role, score, hi }) => (
                    <div
                      key={co}
                      className={`flex items-center justify-between px-3 py-1.5 rounded-lg text-[10px] border ${
                        hi ? "bg-zinc-900/80 border-zinc-700" : "bg-zinc-950/50 border-zinc-900"
                      }`}
                    >
                      <span className={hi ? "text-zinc-200 font-medium" : "text-zinc-500"}>
                        {co} · {role}
                      </span>
                      <span className={hi ? "text-brand font-bold" : "text-zinc-700"}>{score}</span>
                    </div>
                  ))}
                </div>
              </div>
            </SpotlightCard>
          </ScrollReveal>

          {/* 03 — Skill Gap Detection ────────────────────────────────────── */}
          <ScrollReveal>
            <SpotlightCard className="h-full">
              <div className="border border-zinc-800/70 bg-zinc-900/10 rounded-2xl p-6 h-full flex flex-col gap-4 hover:border-zinc-700 hover:bg-zinc-900/20 transition-all duration-300">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center">
                    <Zap className="w-3 h-3 text-zinc-400" />
                  </div>
                  <span className="text-[10px] font-semibold text-zinc-600 uppercase tracking-widest">Skill Audit</span>
                </div>
                <h3 className="text-sm font-bold text-white -mt-1">Skill Gap Detection</h3>

                {/* Two-column have / need */}
                <div className="grid grid-cols-2 gap-3 flex-1 content-center">
                  <div className="space-y-1.5">
                    <p className="text-[8px] font-bold text-emerald-400 uppercase tracking-widest mb-2">✓ You Have</p>
                    {["React", "TypeScript", "Node.js"].map((s) => (
                      <div
                        key={s}
                        className="flex items-center gap-1.5 text-[10px] text-zinc-300 bg-emerald-500/5 border border-emerald-500/15 rounded-lg px-2 py-1.5"
                      >
                        <CheckCircle2 className="w-2.5 h-2.5 text-emerald-400 shrink-0" />
                        {s}
                      </div>
                    ))}
                  </div>
                  <div className="space-y-1.5">
                    <p className="text-[8px] font-bold text-brand uppercase tracking-widest mb-2">✕ You Need</p>
                    {["Docker", "Kubernetes", "Rust"].map((s) => (
                      <div
                        key={s}
                        className="flex items-center gap-1.5 text-[10px] text-zinc-500 bg-brand/5 border border-brand/15 rounded-lg px-2 py-1.5"
                      >
                        <span className="w-2.5 h-2.5 shrink-0 flex items-center justify-center">
                          <span className="w-1.5 h-1.5 rounded-full bg-brand/50" />
                        </span>
                        {s}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </SpotlightCard>
          </ScrollReveal>

          {/* 04 — AI Career Copilot ★ tall 1×2 ─────────────────────────── */}
          <ScrollReveal className="lg:row-span-2">
            <SpotlightCard className="h-full">
              {/* Violet shimmer for visual variety */}
              <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-violet-500/25 to-transparent pointer-events-none z-10" />

              <div className="border border-zinc-800/70 bg-zinc-900/10 rounded-2xl h-full flex flex-col hover:border-zinc-700 hover:bg-zinc-900/20 transition-all duration-300 overflow-hidden">

                {/* Chat header */}
                <div className="px-5 py-3.5 border-b border-zinc-900/80 bg-zinc-950/50 shrink-0 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-6 h-6 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center">
                      <MessagesSquare className="w-3 h-3 text-zinc-400" />
                    </div>
                    <div>
                      <p className="text-[11px] font-bold text-white leading-none">AI Copilot</p>
                      <p className="text-[9px] text-zinc-600 mt-0.5">AXIOM AI · Always on</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    <span className="text-[9px] text-zinc-600">Live</span>
                  </div>
                </div>

                {/* Messages */}
                <div className="flex-1 p-4 flex flex-col justify-end gap-3 overflow-hidden">
                  {CHAT_MSGS.map((msg, i) => (
                    <motion.div
                      key={i}
                      className={`flex ${msg.from === "user" ? "justify-end" : "justify-start"}`}
                      initial={{ opacity: 0, y: 8 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.35, delay: i * 0.09 }}
                    >
                      <div
                        className={`max-w-[86%] rounded-xl px-3 py-2 text-[11px] leading-snug ${
                          msg.from === "user"
                            ? "bg-white text-black rounded-tr-none font-medium"
                            : "bg-zinc-900/90 text-zinc-200 border border-zinc-800/50 rounded-tl-none"
                        }`}
                      >
                        {msg.text}
                      </div>
                    </motion.div>
                  ))}

                  {/* Typing indicator */}
                  <div className="flex gap-1 pl-1">
                    {[0, 120, 240].map((d) => (
                      <span
                        key={d}
                        className="w-1.5 h-1.5 rounded-full bg-zinc-700 animate-bounce"
                        style={{ animationDelay: `${d}ms` }}
                      />
                    ))}
                  </div>
                </div>

                {/* Input bar */}
                <div className="px-4 py-3 border-t border-zinc-900/80 bg-zinc-950/30 shrink-0 flex items-center gap-2">
                  <div className="flex-1 h-8 bg-zinc-900/60 border border-zinc-800/60 rounded-lg px-3 flex items-center">
                    <span className="text-[10px] text-zinc-700">Ask anything…</span>
                  </div>
                  <div className="w-8 h-8 rounded-lg bg-brand/15 border border-brand/25 flex items-center justify-center shrink-0">
                    <Send className="w-3 h-3 text-brand" />
                  </div>
                </div>
              </div>
            </SpotlightCard>
          </ScrollReveal>

          {/* 05 — Application Tracker ────────────────────────────────────── */}
          <ScrollReveal className="lg:col-span-2">
            <SpotlightCard className="h-full">
              <div className="border border-zinc-800/70 bg-zinc-900/10 rounded-2xl p-6 h-full flex flex-col justify-between hover:border-zinc-700 hover:bg-zinc-900/20 transition-all duration-300">

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center">
                      <KanbanSquare className="w-3 h-3 text-zinc-400" />
                    </div>
                    <span className="text-[10px] font-semibold text-zinc-600 uppercase tracking-widest">Tracker</span>
                  </div>
                  <Link href="/signup" className="group/link flex items-center gap-1 text-[10px] text-zinc-600 hover:text-white transition-colors font-medium">
                    Open Board <ArrowRight className="w-3 h-3 group-hover/link:translate-x-0.5 transition-transform" />
                  </Link>
                </div>

                <h3 className="text-sm font-bold text-white">Application Pipeline</h3>

                {/* Funnel stages */}
                <div className="flex items-stretch gap-1.5">
                  {PIPELINE.map(({ label, count, bg, text }, i) => (
                    <div key={label} className="flex items-center flex-1 gap-1.5">
                      <motion.div
                        className={`flex-1 flex flex-col items-center gap-1.5 ${bg} rounded-xl py-4 px-2`}
                        initial={{ opacity: 0, scale: 0.92 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.4, delay: i * 0.07, ease: [0.16, 1, 0.3, 1] }}
                      >
                        <span className={`text-2xl font-extrabold tabular-nums leading-none ${text}`}>{count}</span>
                        <span className={`text-[8px] font-semibold uppercase tracking-wider ${text} opacity-80 text-center`}>{label}</span>
                      </motion.div>
                      {i < PIPELINE.length - 1 && (
                        <ChevronRight className="w-3 h-3 text-zinc-700 shrink-0" />
                      )}
                    </div>
                  ))}
                </div>

                <p className="text-[10px] text-zinc-700">
                  38% screening rate · 47% interview-to-offer conversion
                </p>
              </div>
            </SpotlightCard>
          </ScrollReveal>

          {/* 06 — Analytics Dashboard ────────────────────────────────────── */}
          <ScrollReveal className="lg:col-span-2">
            <SpotlightCard className="h-full">
              <div
                ref={analyticsRef}
                className="border border-zinc-800/70 bg-zinc-900/10 rounded-2xl p-6 h-full flex flex-col justify-between hover:border-zinc-700 hover:bg-zinc-900/20 transition-all duration-300"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center">
                      <BarChart3 className="w-3 h-3 text-zinc-400" />
                    </div>
                    <span className="text-[10px] font-semibold text-zinc-600 uppercase tracking-widest">Analytics</span>
                  </div>
                  <span className="text-[10px] font-bold text-emerald-400 bg-emerald-400/10 border border-emerald-400/20 rounded-full px-2.5 py-0.5">
                    +18% this month
                  </span>
                </div>

                {/* 3 metric pills */}
                <div className="grid grid-cols-3 gap-3">
                  {METRICS.map(({ label, value, delta }) => (
                    <div key={label} className="bg-zinc-950/60 border border-zinc-900 rounded-xl p-3 text-center">
                      <p className="text-lg font-extrabold text-white tabular-nums leading-none">{value}</p>
                      <p className="text-[8px] text-zinc-600 mt-0.5 leading-snug">{label}</p>
                      <p className="text-[9px] text-emerald-400 font-bold mt-1">{delta}</p>
                    </div>
                  ))}
                </div>

                {/* Area chart */}
                <div className="h-14 w-full">
                  <AreaChart inView={analyticsInView} />
                </div>
              </div>
            </SpotlightCard>
          </ScrollReveal>

          {/* 07 — Interview Prep ─────────────────────────────────────────── */}
          <ScrollReveal>
            <SpotlightCard className="h-full">
              <div className="border border-zinc-800/70 bg-zinc-900/10 rounded-2xl p-6 h-full flex flex-col justify-between hover:border-zinc-700 hover:bg-zinc-900/20 transition-all duration-300">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center">
                    <HelpCircle className="w-3 h-3 text-zinc-400" />
                  </div>
                  <span className="text-[10px] font-semibold text-zinc-600 uppercase tracking-widest">Interview Prep</span>
                </div>

                {/* Featured question */}
                <div className="flex-1 flex flex-col justify-center gap-1.5 py-2">
                  <p className="text-[10px] font-semibold text-zinc-600 uppercase tracking-widest">Question 3 of 10</p>
                  <p className="text-sm text-white font-medium leading-snug">
                    "Tell me about a system you designed under tight deadline pressure."
                  </p>
                </div>

                {/* Metadata row */}
                <div className="flex items-center gap-2">
                  <span className="text-[9px] font-bold text-amber-400 bg-amber-400/10 border border-amber-400/20 rounded px-2 py-0.5">
                    Medium
                  </span>
                  <span className="text-[9px] font-bold text-zinc-600 bg-zinc-900/80 border border-zinc-800 rounded px-2 py-0.5 flex items-center gap-1">
                    <Clock className="w-2.5 h-2.5" /> 2:45
                  </span>
                  <div className="flex-1 h-1 bg-zinc-900 rounded-full overflow-hidden">
                    <motion.div
                      className="h-full bg-zinc-600 rounded-full"
                      initial={{ width: 0 }}
                      whileInView={{ width: "30%" }}
                      transition={{ duration: 0.8, ease: "easeOut" }}
                    />
                  </div>
                </div>
              </div>
            </SpotlightCard>
          </ScrollReveal>

          {/* 08 — Cover Letter Builder ───────────────────────────────────── */}
          <ScrollReveal className="lg:col-span-2">
            <SpotlightCard className="h-full">
              <div className="border border-zinc-800/70 bg-zinc-900/10 rounded-2xl p-6 h-full flex flex-col lg:flex-row gap-5 hover:border-zinc-700 hover:bg-zinc-900/20 transition-all duration-300 overflow-hidden">

                {/* Left: settings pane */}
                <div className="flex flex-col justify-between shrink-0 lg:w-36 gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center">
                        <PenTool className="w-3 h-3 text-zinc-400" />
                      </div>
                      <span className="text-[10px] font-semibold text-zinc-600 uppercase tracking-widest">Generator</span>
                    </div>
                    <h3 className="text-sm font-bold text-white">Cover Letter</h3>
                  </div>

                  <div className="bg-zinc-950/70 border border-zinc-800/50 rounded-xl p-3 space-y-2.5 flex-1">
                    <div className="flex items-center justify-between border-b border-zinc-900 pb-2">
                      <Sliders className="w-2.5 h-2.5 text-zinc-700" />
                      <span className="text-[8px] text-zinc-700 font-semibold uppercase tracking-wider">Settings</span>
                    </div>
                    {([["Target", "Vercel"], ["Tone", "Professional"], ["Length", "Concise"]] as const).map(([k, v]) => (
                      <div key={k} className="flex justify-between text-[9px]">
                        <span className="text-zinc-600">{k}</span>
                        <span className="text-zinc-300 font-medium">{v}</span>
                      </div>
                    ))}
                  </div>

                  <Link href="/signup" className="group/link flex items-center gap-1 text-[10px] text-zinc-600 hover:text-white transition-colors font-medium w-fit">
                    Generate <ArrowRight className="w-3 h-3 group-hover/link:translate-x-0.5 transition-transform" />
                  </Link>
                </div>

                {/* Right: letter preview */}
                <div className="flex-1 bg-zinc-950/60 border border-zinc-800/50 rounded-xl p-4 overflow-hidden relative min-h-[140px]">
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-[9px] font-semibold border-b border-zinc-900 pb-2 mb-3">
                      <span className="text-zinc-600 uppercase tracking-widest">Generated draft</span>
                      <span className="text-brand">Done in 23s</span>
                    </div>
                    {LETTER_LINES.map((line, i) => (
                      <motion.p
                        key={i}
                        className={`text-[10px] leading-relaxed ${line.op}`}
                        initial={{ opacity: 0, x: -4 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.3, delay: 0.08 + i * 0.07 }}
                      >
                        {line.t}
                      </motion.p>
                    ))}
                  </div>
                  {/* Fade bottom */}
                  <div className="absolute bottom-8 inset-x-0 h-12 bg-gradient-to-t from-zinc-950/60 to-transparent pointer-events-none" />
                  {/* Progress bar at very bottom */}
                  <div className="absolute bottom-3 left-4 right-4 space-y-1">
                    <div className="h-[3px] bg-zinc-900 rounded-full overflow-hidden">
                      <motion.div
                        className="h-full rounded-full bg-gradient-to-r from-brand to-orange-400"
                        initial={{ width: 0 }}
                        whileInView={{ width: "100%" }}
                        transition={{ duration: 1.8, ease: "easeOut", delay: 0.6 }}
                      />
                    </div>
                  </div>
                </div>

              </div>
            </SpotlightCard>
          </ScrollReveal>

        </div>

        {/* Bottom CTA */}
        <ScrollReveal>
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6 p-7 sm:p-9 rounded-2xl border border-zinc-800/60 bg-zinc-900/15">
            <div className="text-center sm:text-left space-y-1">
              <p className="text-[10px] font-semibold text-zinc-500 uppercase tracking-[0.15em]">Everything you need</p>
              <h3 className="text-xl font-bold text-white">All tools. One platform.</h3>
              <p className="text-sm text-zinc-400">Resume, matching, copilot, prep — fully connected, free to start.</p>
            </div>
            <Link href="/signup" className="shrink-0 w-full sm:w-auto">
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <div className="w-full sm:w-auto flex items-center justify-center gap-2 h-11 px-7 rounded-md bg-brand hover:bg-brand-hover text-black font-semibold text-sm transition-colors duration-200 shadow-[0_0_20px_rgba(249,115,22,0.25)] hover:shadow-[0_0_28px_rgba(249,115,22,0.4)] cursor-pointer">
                  Explore all features <ArrowRight className="w-4 h-4" />
                </div>
              </motion.div>
            </Link>
          </div>
        </ScrollReveal>

      </div>
    </section>
  );
}
