"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence, useInView } from "framer-motion";
import { ScrollReveal } from "@/components/ScrollReveal";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import {
  Upload, CheckCircle, AlertCircle, Search,
  MapPin, DollarSign, Briefcase, Heart,
  CheckCircle2, ArrowUpRight, ArrowRight,
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────
interface Job {
  id: number;
  company: string;
  title: string;
  matchScore: number;
  location: string;
  salary: string;
  type: string;
}

const mockJobs: Job[] = [
  { id: 1, company: "Vercel",  title: "Senior Frontend Engineer",         matchScore: 94, location: "Remote, US",    salary: "$160k–$190k", type: "Full-time" },
  { id: 2, company: "Stripe",  title: "Software Engineer (API Platform)",  matchScore: 89, location: "Hybrid, SF",    salary: "$175k–$210k", type: "Full-time" },
  { id: 3, company: "Linear",  title: "Product Engineer",                  matchScore: 85, location: "Remote, EU/US", salary: "$140k–$170k", type: "Full-time" },
];

// ─── Spotlight wrapper ────────────────────────────────────────────────────────
function Spotlight({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [coords, setCoords] = useState({ x: 0, y: 0 });
  return (
    <div
      ref={ref}
      onMouseMove={(e) => {
        const r = ref.current!.getBoundingClientRect();
        setCoords({ x: e.clientX - r.left, y: e.clientY - r.top });
      }}
      className={`group relative overflow-hidden ${className}`}
    >
      <div
        className="pointer-events-none absolute inset-0 z-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        style={{
          background: `radial-gradient(300px circle at ${coords.x}px ${coords.y}px, rgba(255,255,255,0.035), transparent 80%)`,
        }}
      />
      {children}
    </div>
  );
}

// ─── Score counter ────────────────────────────────────────────────────────────
function ScoreCounter({ target, isInView }: { target: number; isInView: boolean }) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!isInView) return;
    let raf: number;
    const start = performance.now();
    const duration = 1200;
    const tick = (now: number) => {
      const p = Math.min((now - start) / duration, 1);
      const ease = 1 - Math.pow(1 - p, 3);
      setCount(Math.round(ease * target));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [isInView, target]);
  return (
    <span className="text-5xl font-extrabold tracking-tighter text-white tabular-nums">
      {count}%
    </span>
  );
}

// ─── Tab switcher (fixed) ─────────────────────────────────────────────────────
const TABS = [
  { id: "resume", label: "Resume Analyzer" },
  { id: "jobs",   label: "Smart Job Search" },
] as const;

type TabId = (typeof TABS)[number]["id"];

function TabSwitcher({
  active,
  onChange,
}: {
  active: TabId;
  onChange: (t: TabId) => void;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [pill, setPill] = useState({ left: 0, width: 0 });
  const btnRefs = useRef<(HTMLButtonElement | null)[]>([]);

  // Measure the active button and position the pill
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
    <div
      ref={containerRef}
      className="relative inline-flex p-1 bg-zinc-950 border border-zinc-900 rounded-xl"
    >
      {/* Sliding pill — absolutely positioned, measured from DOM */}
      <motion.div
        className="absolute top-1 bottom-1 bg-white rounded-lg pointer-events-none"
        animate={{ left: pill.left, width: pill.width }}
        transition={{ type: "spring", stiffness: 420, damping: 34 }}
      />

      {TABS.map((tab, idx) => (
        <button
          key={tab.id}
          ref={(el) => { btnRefs.current[idx] = el; }}
          onClick={() => onChange(tab.id)}
          className={`relative z-10 px-7 py-2.5 text-xs font-semibold uppercase tracking-wider rounded-lg transition-colors duration-150 whitespace-nowrap ${
            active === tab.id
              ? "text-black"
              : "text-zinc-500 hover:text-zinc-300"
          }`}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}

// ─── Resume tab ───────────────────────────────────────────────────────────────
function ResumeTab() {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-60px" });

  const badgeVariant = {
    hidden: { opacity: 0, scale: 0.88, y: 4 },
    visible: { opacity: 1, scale: 1, y: 0, transition: { duration: 0.3, ease: [0.16, 1, 0.3, 1] as any } },
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-start">

      {/* Left — copy + dropzone */}
      <div className="flex flex-col gap-7">
        <div className="space-y-4">
          <span className="text-[10px] font-semibold text-zinc-500 uppercase tracking-[0.15em]">
            CV Parser Engine
          </span>
          <h3 className="text-3xl font-extrabold text-white tracking-tight leading-tight">
            ATS compatibility,<br />in seconds
          </h3>
          <p className="text-sm text-zinc-400 leading-relaxed max-w-sm">
            Full structural validation, formatting anomaly detection, keyword density checks, and actionable score breakdowns.
          </p>
        </div>

        {/* Dropzone */}
        <Spotlight className="border border-zinc-800 bg-zinc-900/10 hover:border-zinc-700/80 rounded-2xl transition-colors duration-300 cursor-pointer">
          <div className="flex flex-col items-center text-center gap-4 py-12 px-8 relative z-10 pointer-events-none">
            <div className="w-11 h-11 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-500 group-hover:text-white group-hover:border-zinc-700 group-hover:scale-110 transition-all duration-300">
              <Upload className="w-4 h-4" />
            </div>
            <div className="space-y-1">
              <p className="text-sm font-semibold text-zinc-200 group-hover:text-white transition-colors">
                Drag & drop your resume
              </p>
              <p className="text-xs text-zinc-600">or click to browse local folders</p>
            </div>
            <span className="text-[10px] font-semibold text-zinc-600 uppercase tracking-widest border border-zinc-800 rounded-full px-3 py-1">
              PDF · DOCX · max 5 MB
            </span>
          </div>
        </Spotlight>

        <div className="space-y-2.5">
          {["Instant layout compliance assessment", "Semantic skill categorization"].map((t) => (
            <div key={t} className="flex items-center gap-2.5 text-sm text-zinc-300">
              <CheckCircle2 className="w-4 h-4 text-zinc-400 shrink-0" />
              {t}
            </div>
          ))}
        </div>
      </div>

      {/* Right — score + skill cards */}
      <div ref={ref} className="flex flex-col gap-5">

        {/* Score ring */}
        <Spotlight className="border border-zinc-800/80 bg-zinc-900/20 rounded-2xl p-7">
          <div className="relative z-10 flex flex-col gap-6">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-semibold text-zinc-500 uppercase tracking-[0.15em]">
                Analysis Overview
              </span>
              <Badge className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[9px] font-bold px-2.5">
                EXCELLENT
              </Badge>
            </div>

            <div className="flex items-center gap-8">
              {/* Ring */}
              <div className="relative w-32 h-32 shrink-0">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 128 128">
                  <circle cx="64" cy="64" r="54" fill="none" stroke="#18181b" strokeWidth="5" />
                  <motion.circle
                    cx="64" cy="64" r="54"
                    fill="none" stroke="white" strokeWidth="5"
                    strokeLinecap="round"
                    strokeDasharray="339"
                    animate={isInView ? { strokeDashoffset: 339 * (1 - 0.87) } : { strokeDashoffset: 339 }}
                    initial={{ strokeDashoffset: 339 }}
                    transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <ScoreCounter target={87} isInView={isInView} />
                  <span className="text-[9px] text-zinc-600 uppercase tracking-widest font-semibold mt-0.5">
                    ATS Score
                  </span>
                </div>
              </div>

              {/* Right of ring */}
              <div className="flex-1 space-y-3">
                <div>
                  <p className="text-xs font-bold text-white">Ready for submission</p>
                  <p className="text-[10px] text-zinc-500 mt-0.5 leading-snug">
                    Formatting, skills, and metadata passed AA status.
                  </p>
                </div>
                <div className="space-y-1.5">
                  <div className="flex justify-between text-[10px]">
                    <span className="text-zinc-600">Industry benchmark</span>
                    <span className="text-zinc-300 font-semibold">Top 10%</span>
                  </div>
                  <Progress value={87} className="h-1 bg-zinc-900" />
                </div>
              </div>
            </div>
          </div>
        </Spotlight>

        {/* Skill badges */}
        <div className="grid grid-cols-2 gap-4">
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.4, delay: 0.2 }}
            className="border border-emerald-950/40 bg-emerald-500/[0.03] rounded-xl p-4 space-y-3"
          >
            <div className="flex items-center gap-2 text-emerald-400 text-[10px] font-bold uppercase tracking-widest">
              <CheckCircle className="w-3.5 h-3.5" /> Strengths
            </div>
            <motion.div
              initial="hidden"
              animate={isInView ? "visible" : "hidden"}
              variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.07 } } }}
              className="flex flex-wrap gap-1.5"
            >
              {["React", "Next.js", "TypeScript"].map((s) => (
                <motion.span key={s} variants={badgeVariant}>
                  <Badge className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px]">
                    {s}
                  </Badge>
                </motion.span>
              ))}
            </motion.div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.4, delay: 0.3 }}
            className="border border-amber-950/40 bg-amber-500/[0.03] rounded-xl p-4 space-y-3"
          >
            <div className="flex items-center gap-2 text-amber-400 text-[10px] font-bold uppercase tracking-widest">
              <AlertCircle className="w-3.5 h-3.5" /> Missing
            </div>
            <motion.div
              initial="hidden"
              animate={isInView ? "visible" : "hidden"}
              variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.07 } } }}
              className="flex flex-wrap gap-1.5"
            >
              {["Docker", "GraphQL"].map((s) => (
                <motion.span key={s} variants={badgeVariant}>
                  <Badge className="bg-amber-500/10 text-amber-400 border border-amber-500/20 text-[10px]">
                    {s}
                  </Badge>
                </motion.span>
              ))}
            </motion.div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

// ─── Jobs tab ─────────────────────────────────────────────────────────────────
function JobsTab() {
  const [savedJobs, setSavedJobs] = useState<Record<number, boolean>>({});

  return (
    <div className="space-y-4">
      {/* Search bar */}
      <Spotlight className="border border-zinc-800/70 bg-zinc-900/10 hover:border-zinc-700/60 rounded-2xl p-3 transition-colors duration-200">
        <div className="relative z-10 flex flex-col sm:flex-row gap-2.5">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600" />
            <Input
              readOnly
              defaultValue="Frontend Engineer"
              className="pl-10 bg-zinc-950/80 border-zinc-900 h-10 text-zinc-200 text-sm"
            />
          </div>
          <Button className="bg-white hover:bg-zinc-100 text-black h-10 px-6 font-semibold text-sm flex gap-2 shrink-0">
            <Search className="w-3.5 h-3.5" />
            Search
          </Button>
        </div>
      </Spotlight>

      <p className="text-xs text-zinc-600 px-1">
        {mockJobs.length} results · sorted by match score
      </p>

      <div className="space-y-3">
        {mockJobs.map((job, i) => (
          <JobCard
            key={job.id}
            job={job}
            delay={i * 0.07}
            saved={!!savedJobs[job.id]}
            onToggle={(id) => setSavedJobs((p) => ({ ...p, [id]: !p[id] }))}
          />
        ))}
      </div>
    </div>
  );
}

// ─── Job card ─────────────────────────────────────────────────────────────────
function JobCard({
  job, delay, saved, onToggle,
}: {
  job: Job; delay: number; saved: boolean; onToggle: (id: number) => void;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-40px" });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 10 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1], delay }}
    >
      <Spotlight className="border border-zinc-800/70 bg-zinc-900/10 hover:border-zinc-700 rounded-2xl p-5 transition-all duration-200 cursor-pointer">
        <div className="relative z-10 flex items-center justify-between gap-5">
          {/* Logo + title */}
          <div className="flex items-center gap-3.5 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-zinc-950 border border-zinc-800 text-white font-bold flex items-center justify-center text-sm shrink-0 group-hover:border-zinc-700 transition-colors">
              {job.company[0]}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-bold text-white truncate">{job.title}</p>
              <p className="text-xs text-zinc-500 mt-0.5">{job.company}</p>
            </div>
          </div>

          {/* Meta */}
          <div className="hidden md:flex items-center gap-4 text-xs text-zinc-500 shrink-0">
            <span className="flex items-center gap-1.5">
              <MapPin className="w-3 h-3" />{job.location}
            </span>
            <span className="flex items-center gap-1.5">
              <DollarSign className="w-3 h-3" />{job.salary}
            </span>
            <span className="flex items-center gap-1.5">
              <Briefcase className="w-3 h-3" />{job.type}
            </span>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2.5 shrink-0">
            <Badge className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-bold px-2.5">
              {job.matchScore}%
            </Badge>
            <button
              onClick={(e) => { e.stopPropagation(); onToggle(job.id); }}
              aria-label={saved ? "Unsave" : "Save"}
              className={`w-8 h-8 rounded-lg border flex items-center justify-center transition-all duration-200 hover:scale-105 active:scale-95 ${
                saved
                  ? "border-white/20 bg-white/10 text-white"
                  : "border-zinc-800 text-zinc-600 hover:text-zinc-300 hover:border-zinc-700"
              }`}
            >
              <Heart className={`w-3.5 h-3.5 transition-all ${saved ? "fill-white" : ""}`} />
            </button>
            <button className="hidden sm:flex items-center gap-1.5 text-xs font-semibold text-zinc-300 hover:text-white border border-zinc-800 hover:border-zinc-700 rounded-lg px-3 h-8 transition-all duration-200">
              View <ArrowUpRight className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* Mobile meta */}
        <div className="md:hidden relative z-10 flex flex-wrap gap-3 mt-3 pt-3 border-t border-zinc-900 text-xs text-zinc-500">
          <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{job.location}</span>
          <span className="flex items-center gap-1"><DollarSign className="w-3 h-3" />{job.salary}</span>
        </div>
      </Spotlight>
    </motion.div>
  );
}

// ─── Main export ──────────────────────────────────────────────────────────────
export function Showcase() {
  const [tab, setTab] = useState<TabId>("resume");

  return (
    <section id="showcase" className="py-28 px-6 bg-[#09090b]">
      <div className="max-w-7xl mx-auto space-y-14">

        {/* Header */}
        <ScrollReveal>
          <div className="space-y-6 max-w-2xl">
            <span className="text-[10px] font-semibold text-zinc-500 uppercase tracking-[0.15em]">
              Interactive Showcase
            </span>
            <h2 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-white leading-[1.06]">
              See AXIOM in action
            </h2>
            <p className="text-base text-zinc-400 leading-relaxed max-w-lg">
              Upload a CV for instant ATS scoring, or search live job listings with semantic match indexes.
            </p>

            {/* Tab switcher — DOM-measured pill, no hidden buttons */}
            <TabSwitcher active={tab} onChange={setTab} />
          </div>
        </ScrollReveal>

        {/* Content — AnimatePresence with mode="wait" prevents overlap */}
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