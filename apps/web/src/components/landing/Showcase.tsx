"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence, useInView } from "framer-motion";
import { ScrollReveal } from "@/components/ScrollReveal";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  CheckCircle2, AlertCircle, Search, MapPin, DollarSign,
  Briefcase, Heart, ArrowUpRight, FileText, RotateCcw,
  Zap, Info, ChevronRight,
} from "lucide-react";

// ── Types & data ───────────────────────────────────────────────────────────
interface Job {
  id: number;
  company: string;
  title: string;
  matchScore: number;
  location: string;
  salary: string;
  type: string;
  dot: string;
}

const JOBS: Job[] = [
  { id: 1, company: "Vercel",  title: "Senior Frontend Engineer",        matchScore: 94, location: "Remote, US",    salary: "$160k–$190k", type: "Full-time", dot: "#e2e8f0" },
  { id: 2, company: "Stripe",  title: "Software Engineer, API Platform", matchScore: 89, location: "Hybrid, SF",    salary: "$175k–$210k", type: "Full-time", dot: "#635BFF" },
  { id: 3, company: "Linear",  title: "Product Engineer",                matchScore: 85, location: "Remote, EU/US", salary: "$140k–$170k", type: "Full-time", dot: "#5E6AD2" },
];

const FILTERS = ["Remote", "Full-time", "$150k+", "Series B+"] as const;

const CAT_BARS: Array<{ label: string; value: number; delay: number }> = [
  { label: "Format & Layout",   value: 92, delay: 0.10 },
  { label: "Keyword Coverage",  value: 84, delay: 0.22 },
  { label: "Skills Match",      value: 81, delay: 0.34 },
  { label: "ATS Compatibility", value: 87, delay: 0.46 },
];

const RECS: Array<{ severity: "brand" | "amber" | "zinc"; icon: React.ElementType; text: string }> = [
  { severity: "brand",  icon: Zap,          text: "Add Docker & Kubernetes — present in 78% of your matched listings." },
  { severity: "amber",  icon: AlertCircle,  text: "3 bullet points lack metrics. Quantify impact to improve ATS density." },
  { severity: "zinc",   icon: Info,         text: "LinkedIn URL missing from header. Required by many ATS crawlers." },
];

// ── Tabs ───────────────────────────────────────────────────────────────────
const TABS = [
  { id: "resume", label: "Resume Analyzer" },
  { id: "jobs",   label: "Smart Job Search" },
] as const;
type TabId = (typeof TABS)[number]["id"];

// ── Spotlight wrapper ──────────────────────────────────────────────────────
function Spotlight({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState({ x: 0, y: 0 });
  return (
    <div
      ref={ref}
      onMouseMove={(e) => {
        const r = ref.current!.getBoundingClientRect();
        setPos({ x: e.clientX - r.left, y: e.clientY - r.top });
      }}
      className={`group relative overflow-hidden ${className}`}
    >
      <div
        className="pointer-events-none absolute inset-0 z-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        style={{ background: `radial-gradient(300px circle at ${pos.x}px ${pos.y}px, var(--spotlight-color), transparent 80%)` }}
      />
      {children}
    </div>
  );
}

// ── Score counter ──────────────────────────────────────────────────────────
function ScoreCounter({ target, inView }: { target: number; inView: boolean }) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!inView) return;
    let raf: number;
    const start = performance.now();
    const tick = (now: number) => {
      const p = Math.min((now - start) / 1200, 1);
      setCount(Math.round((1 - Math.pow(1 - p, 3)) * target));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [inView, target]);
  return (
    <span className="text-5xl font-extrabold tracking-tight text-text-primary tabular-nums leading-none">
      {count}%
    </span>
  );
}

// ── Animated bar ───────────────────────────────────────────────────────────
function AnimBar({ label, value, delay, inView }: { label: string; value: number; delay: number; inView: boolean }) {
  return (
    <div className="space-y-1.5">
      <div className="flex justify-between text-[10px]">
        <span className="text-text-muted">{label}</span>
        <span className="text-text-secondary font-bold tabular-nums">{value}%</span>
      </div>
      <div className="h-[3px] bg-bg-elevated rounded-full overflow-hidden">
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

// ── Tab switcher ───────────────────────────────────────────────────────────
function TabSwitcher({ active, onChange }: { active: TabId; onChange: (t: TabId) => void }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [pill, setPill] = useState({ left: 0, width: 0 });
  const btnRefs = useRef<(HTMLButtonElement | null)[]>([]);

  useEffect(() => {
    const idx = TABS.findIndex((t) => t.id === active);
    const btn = btnRefs.current[idx];
    const container = containerRef.current;
    if (!btn || !container) return;
    const bRect = btn.getBoundingClientRect();
    const cRect = container.getBoundingClientRect();
    setPill({ left: bRect.left - cRect.left, width: bRect.width });
  }, [active]);

  return (
    <div ref={containerRef} className="relative inline-flex p-1 bg-bg-base border border-border-subtle/80 rounded-xl shrink-0">
      <motion.div
        className="absolute top-1 bottom-1 bg-bg-card shadow-sm border border-border-subtle/40 rounded-lg pointer-events-none"
        animate={{ left: pill.left, width: pill.width }}
        transition={{ type: "spring", stiffness: 420, damping: 34 }}
      />
      {TABS.map((tab, idx) => (
        <button
          key={tab.id}
          ref={(el) => { btnRefs.current[idx] = el; }}
          onClick={() => onChange(tab.id)}
          className={`relative z-10 px-7 py-2.5 text-xs font-semibold uppercase tracking-wider rounded-lg transition-colors duration-150 whitespace-nowrap ${
            active === tab.id ? "text-text-primary font-bold" : "text-text-muted hover:text-text-secondary"
          }`}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}

// ── Resume tab ─────────────────────────────────────────────────────────────
const RING_CIRC = 2 * Math.PI * 52; // ≈ 326.7

function ResumeTab() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });

  return (
    <div ref={ref} className="grid grid-cols-1 lg:grid-cols-[3fr_2fr] gap-10 items-start">

      {/* ── Left: breakdown + recommendations ─────────────────────────── */}
      <div className="space-y-5">

        {/* File parsed pill */}
        <div className="flex items-center justify-between gap-4 bg-bg-base/60 border border-border-subtle/60 rounded-xl px-4 py-3">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-bg-elevated border border-border-subtle flex items-center justify-center shrink-0">
              <FileText className="w-3.5 h-3.5 text-text-secondary" />
            </div>
            <div>
              <p className="text-xs font-bold text-text-primary leading-none">CV_JOHN_DOE_2026.pdf</p>
              <p className="text-[10px] text-text-muted mt-0.5">2 pages · 45 KB · parsed 2m ago</p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <span className="text-[9px] font-bold text-emerald-400 bg-emerald-400/10 border border-emerald-400/20 rounded px-2 py-0.5">
              ✓ READY
            </span>
            <button className="flex items-center gap-1.5 text-[10px] text-text-secondary hover:text-text-primary border border-border-subtle hover:border-border-medium rounded-lg px-2.5 py-1.5 transition-all duration-200">
              <RotateCcw className="w-2.5 h-2.5" /> Re-analyze
            </button>
          </div>
        </div>

        {/* Score breakdown */}
        <div className="bg-bg-base/40 border border-border-subtle/60 rounded-2xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-[10px] font-semibold text-text-muted uppercase tracking-widest">Score breakdown</p>
            <span className="text-[10px] text-text-subtle">vs. industry avg (72%)</span>
          </div>
          {CAT_BARS.map((b) => (
            <AnimBar key={b.label} label={b.label} value={b.value} delay={b.delay} inView={inView} />
          ))}
        </div>

        {/* Recommendations */}
        <div className="space-y-2">
          <p className="text-[10px] font-semibold text-text-muted uppercase tracking-widest px-1 pb-1">
            3 Recommendations
          </p>
          {RECS.map(({ severity, icon: Icon, text }, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -8 }}
              animate={inView ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.35, delay: 0.55 + i * 0.09 }}
              className={`flex items-start gap-3 rounded-xl px-4 py-3 border text-[11px] leading-snug ${
                severity === "brand"
                  ? "bg-brand/5 border-brand/15 text-text-secondary"
                  : severity === "amber"
                  ? "bg-amber-400/5 border-amber-400/15 text-text-secondary"
                  : "bg-bg-card/30 border-border-subtle text-text-muted"
              }`}
            >
              <Icon
                className={`w-3.5 h-3.5 shrink-0 mt-0.5 ${
                  severity === "brand" ? "text-brand" : severity === "amber" ? "text-amber-400" : "text-text-muted"
                }`}
              />
              {text}
            </motion.div>
          ))}
        </div>
      </div>

      {/* ── Right: ATS ring + skills ───────────────────────────────────── */}
      <div className="space-y-4">

        {/* Ring card */}
        <Spotlight className="border border-border-subtle bg-bg-card/20 hover:border-border-medium rounded-2xl p-7 transition-all duration-300">
          <div className="relative z-10 space-y-5">

            <div className="flex items-center justify-between">
              <span className="text-[10px] font-semibold text-text-muted uppercase tracking-widest">ATS Report</span>
              <Badge className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[9px] font-bold px-2.5 hover:bg-emerald-500/10">
                EXCELLENT
              </Badge>
            </div>

            {/* Ring */}
            <div className="flex flex-col items-center gap-3 py-1">
              <div className="relative w-36 h-36">
                <svg viewBox="0 0 120 120" className="w-full h-full -rotate-90">
                  <circle cx="60" cy="60" r="52" fill="none" stroke="var(--bg-elevated)" strokeWidth="5.5" />
                  <motion.circle
                    cx="60" cy="60" r="52"
                    fill="none" stroke="#f97316" strokeWidth="5.5" strokeLinecap="round"
                    strokeDasharray={RING_CIRC}
                    initial={{ strokeDashoffset: RING_CIRC }}
                    animate={inView ? { strokeDashoffset: RING_CIRC * (1 - 0.87) } : { strokeDashoffset: RING_CIRC }}
                    transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1], delay: 0.3 }}
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <ScoreCounter target={87} inView={inView} />
                  <span className="text-[9px] text-text-muted uppercase tracking-widest font-semibold mt-1">
                    ATS Score
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-1.5 text-[10px] text-text-muted">
                <ChevronRight className="w-3 h-3 text-emerald-400" style={{ transform: "rotate(-45deg)" }} />
                Top 10% among applicants
              </div>
            </div>

            {/* Benchmark bar */}
            <div className="space-y-2 border-t border-border-subtle pt-4">
              <div className="flex justify-between text-[10px]">
                <span className="text-text-muted">Industry benchmark</span>
                <span className="text-text-secondary font-semibold">72% average</span>
              </div>
              <div className="relative h-[3px] bg-bg-elevated rounded-full overflow-hidden">
                <motion.div
                  className="h-full rounded-full bg-gradient-to-r from-brand to-orange-300"
                  initial={{ width: 0 }}
                  animate={inView ? { width: "87%" } : { width: 0 }}
                  transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1], delay: 0.45 }}
                />
              </div>
              {/* Benchmark tick */}
              <div className="relative h-1.5">
                <div className="absolute top-0 w-px h-full bg-border-medium" style={{ left: "72%" }} />
                <span
                  className="absolute top-0 text-[8px] text-text-muted -translate-x-1/2"
                  style={{ left: "72%" }}
                >
                  avg
                </span>
              </div>
            </div>
          </div>
        </Spotlight>

        {/* Strengths + Missing */}
        <div className="grid grid-cols-2 gap-3">
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.4, delay: 0.35 }}
            className="border border-emerald-900/30 bg-emerald-500/[0.03] rounded-xl p-4 space-y-3"
          >
            <div className="flex items-center gap-1.5 text-[10px] font-bold text-emerald-400 uppercase tracking-widest">
              <CheckCircle2 className="w-3 h-3" /> Strong
            </div>
            <div className="flex flex-wrap gap-1.5">
              {["React", "Next.js", "TypeScript"].map((s, i) => (
                <motion.div
                  key={s}
                  initial={{ opacity: 0, scale: 0.85 }}
                  animate={inView ? { opacity: 1, scale: 1 } : {}}
                  transition={{ duration: 0.25, delay: 0.5 + i * 0.06 }}
                >
                  <Badge className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] hover:bg-emerald-500/10">
                    {s}
                  </Badge>
                </motion.div>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.4, delay: 0.45 }}
            className="border border-orange-900/25 bg-brand/[0.03] rounded-xl p-4 space-y-3"
          >
            <div className="flex items-center gap-1.5 text-[10px] font-bold text-brand uppercase tracking-widest">
              <AlertCircle className="w-3 h-3" /> Missing
            </div>
            <div className="flex flex-wrap gap-1.5">
              {["Docker", "GraphQL"].map((s, i) => (
                <motion.div
                  key={s}
                  initial={{ opacity: 0, scale: 0.85 }}
                  animate={inView ? { opacity: 1, scale: 1 } : {}}
                  transition={{ duration: 0.25, delay: 0.6 + i * 0.07 }}
                >
                  <Badge className="bg-brand/10 text-brand border border-brand/20 text-[10px] hover:bg-brand/10">
                    {s}
                  </Badge>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

// ── Jobs tab ───────────────────────────────────────────────────────────────
function JobsTab() {
  const [savedJobs, setSavedJobs] = useState<Record<number, boolean>>({});

  return (
    <div className="space-y-4">

      {/* Search + filter bar */}
      <div className="border border-border-subtle bg-bg-card/20 rounded-2xl p-4 space-y-3">
        <div className="flex flex-col sm:flex-row gap-2.5">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-text-muted" />
            <Input
              readOnly
              defaultValue="Frontend Engineer · Next.js · TypeScript"
              aria-label="Demo search — not interactive"
              className="pl-10 bg-bg-base/85 border-border-subtle/60 h-10 text-text-secondary text-sm cursor-default select-none pointer-events-none"
            />
          </div>
          <Button
            disabled
            className="bg-brand text-black h-10 px-6 font-semibold text-sm flex items-center gap-2 cursor-default shrink-0 opacity-80"
          >
            <Search className="w-3.5 h-3.5" />
            Search
          </Button>
        </div>

        {/* Filter chips */}
        <div className="flex items-center gap-2 flex-wrap">
          {FILTERS.map((f) => (
            <span
              key={f}
              className="text-[10px] font-semibold text-text-secondary bg-bg-card border border-border-subtle rounded-full px-3 py-1 leading-none cursor-default select-none"
            >
              {f} ×
            </span>
          ))}
          <span className="text-[10px] text-text-muted cursor-default ml-1">+ Add filter</span>
        </div>
      </div>

      {/* Result meta */}
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-2 text-[11px] text-text-muted">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse shrink-0" />
          47 new matches this week · sorted by ATS score
        </div>
        <span className="text-[10px] text-text-subtle">Updated 2m ago</span>
      </div>

      {/* Job cards */}
      <div className="space-y-3">
        {JOBS.map((job, i) => (
          <JobCard
            key={job.id}
            job={job}
            delay={i * 0.07}
            saved={!!savedJobs[job.id]}
            onToggle={(id) => setSavedJobs((p) => ({ ...p, [id]: !p[id] }))}
            topMatch={i === 0}
          />
        ))}
      </div>
    </div>
  );
}

// ── Job card ───────────────────────────────────────────────────────────────
function JobCard({
  job, delay, saved, onToggle, topMatch,
}: {
  job: Job; delay: number; saved: boolean; onToggle: (id: number) => void; topMatch: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 10 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1], delay }}
    >
      <Spotlight
        className={`border rounded-2xl p-5 transition-all duration-200 cursor-pointer ${
          topMatch
            ? "border-brand/25 bg-bg-card/30 hover:border-brand/40 shadow-[0_0_28px_rgba(249,115,22,0.08)]"
            : "border-border-subtle bg-bg-card/20 hover:border-border-medium"
        }`}
      >
        <div className="relative z-10 flex items-center gap-4">
          {/* Company dot */}
          <div
            className="w-9 h-9 rounded-xl shrink-0 flex items-center justify-center text-[11px] font-extrabold border border-border-subtle/50"
            style={{
              background: job.dot === "#e2e8f0" ? "var(--bg-elevated)" : `${job.dot}22`,
              color: job.dot === "#e2e8f0" ? "var(--text-primary)" : job.dot,
            }}
          >
            {job.company[0]}
          </div>

          {/* Title + company */}
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <p className="text-sm font-bold text-text-primary truncate">{job.title}</p>
              {topMatch && (
                <Badge className="bg-brand/10 text-brand border border-brand/20 text-[8px] font-bold shrink-0 hover:bg-brand/10 hidden sm:flex">
                  BEST MATCH
                </Badge>
              )}
            </div>
            <p className="text-xs text-text-muted mt-0.5">{job.company}</p>
          </div>

          {/* Meta — desktop */}
          <div className="hidden lg:flex items-center gap-4 text-[11px] text-text-muted shrink-0">
            <span className="flex items-center gap-1.5">
              <MapPin className="w-3 h-3 shrink-0" />{job.location}
            </span>
            <span className="flex items-center gap-1.5">
              <DollarSign className="w-3 h-3 shrink-0" />{job.salary}
            </span>
            <span className="flex items-center gap-1.5">
              <Briefcase className="w-3 h-3 shrink-0" />{job.type}
            </span>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 shrink-0">
            <Badge
              className={`text-[10px] font-bold px-2.5 border ${
                job.matchScore >= 90
                  ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/10"
                  : "bg-bg-elevated text-text-secondary border border-border-subtle hover:bg-bg-hover"
              }`}
            >
              {job.matchScore}%
            </Badge>
            <button
              onClick={(e) => { e.stopPropagation(); onToggle(job.id); }}
              aria-label={saved ? "Unsave" : "Save"}
              className={`w-8 h-8 rounded-lg border flex items-center justify-center transition-all duration-200 hover:scale-105 active:scale-95 ${
                saved
                  ? "border-border-medium bg-bg-elevated text-text-primary"
                  : "border-border-subtle text-text-muted hover:text-text-secondary hover:border-border-medium"
              }`}
            >
              <Heart className={`w-3.5 h-3.5 transition-all ${saved ? "fill-current" : ""}`} />
            </button>
            <button className="hidden sm:flex items-center gap-1.5 text-xs font-semibold text-text-secondary hover:text-text-primary border border-border-subtle hover:border-border-medium rounded-lg px-3 h-8 transition-all duration-200">
              View <ArrowUpRight className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* Mobile meta */}
        <div className="lg:hidden relative z-10 flex flex-wrap gap-3 mt-3 pt-3 border-t border-border-subtle text-[11px] text-text-muted">
          <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{job.location}</span>
          <span className="flex items-center gap-1"><DollarSign className="w-3 h-3" />{job.salary}</span>
          <span className="flex items-center gap-1"><Briefcase className="w-3 h-3" />{job.type}</span>
        </div>
      </Spotlight>
    </motion.div>
  );
}

// ── Main export ────────────────────────────────────────────────────────────
export function Showcase() {
  const [tab, setTab] = useState<TabId>("resume");

  return (
    <section id="showcase" className="py-28 px-6 bg-bg-base relative">
      <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-border-subtle/80 to-transparent" />

      <div className="max-w-7xl mx-auto space-y-14">

        {/* Header — title left, tab switcher right */}
        <ScrollReveal>
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8">
            <div className="space-y-4 max-w-xl">
              <span className="text-[10px] font-semibold text-text-muted uppercase tracking-[0.15em]">
                Interactive Showcase
              </span>
              <h2 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-text-primary leading-[1.06]">
                See AXIOM<br />in action
              </h2>
              <p className="text-base text-text-secondary leading-relaxed">
                Explore the Resume Analyzer or the Smart Job Search — both powered by the same AI engine behind your dashboard.
              </p>
            </div>
            <TabSwitcher active={tab} onChange={setTab} />
          </div>
        </ScrollReveal>

        {/* Tab content */}
        <AnimatePresence mode="wait">
          {tab === "resume" ? (
            <motion.div
              key="resume"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            >
              <ResumeTab />
            </motion.div>
          ) : (
            <motion.div
              key="jobs"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            >
              <JobsTab />
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </section>
  );
}
