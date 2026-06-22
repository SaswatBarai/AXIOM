"use client";

import { useEffect, useRef, useState } from "react";
import {
  Map, Loader2, Trash2, CheckCircle2, Circle,
  ChevronRight, Sparkles, Clock, RefreshCw, AlertCircle,
} from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useRoadmap, type RoadmapStep } from "@/hooks/useRoadmap";
import { cn } from "@/lib/utils";

// ── Confetti burst (lightweight, no extra dep — pure CSS particles via Framer)

function ConfettiBurst() {
  const COLORS = ["#7c3aed", "#10b981", "#f59e0b", "#3b82f6", "#ec4899"];
  const particles = Array.from({ length: 16 }, (_, i) => i);
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-xl">
      {particles.map((i) => {
        const angle  = (i / particles.length) * 360;
        const radius = 60 + Math.random() * 40;
        const color  = COLORS[i % COLORS.length];
        const x      = Math.cos((angle * Math.PI) / 180) * radius;
        const y      = Math.sin((angle * Math.PI) / 180) * radius;
        return (
          <motion.div
            key={i}
            className="absolute left-1/2 top-1/2 h-2 w-2 rounded-full"
            style={{ backgroundColor: color }}
            initial={{ x: 0, y: 0, opacity: 1, scale: 1 }}
            animate={{ x, y, opacity: 0, scale: 0 }}
            transition={{ duration: 0.7, ease: "easeOut", delay: i * 0.02 }}
          />
        );
      })}
    </div>
  );
}

// ── Tier badge ────────────────────────────────────────────────────────────────

const TIER_COLORS: Record<string, string> = {
  must_have:    "border-red-500/20 bg-red-950/10 text-red-400",
  should_have:  "border-amber-500/20 bg-amber-950/10 text-amber-400",
  nice_to_have: "border-blue-500/20 bg-blue-950/10 text-blue-400",
};

const TIER_LABELS: Record<string, string> = {
  must_have:    "Must Have",
  should_have:  "Should Have",
  nice_to_have: "Nice to Have",
};

// ── Week step card ────────────────────────────────────────────────────────────

function StepCard({
  step,
  done,
  onToggle,
}: {
  step:     RoadmapStep;
  done:     boolean;
  onToggle: () => void;
}) {
  const tierColor   = TIER_COLORS[step.tier] ?? "border-zinc-800 bg-zinc-900/30 text-zinc-400";
  const prevDone    = useRef(done);
  const [burst, setBurst] = useState(false);

  useEffect(() => {
    if (!prevDone.current && done) {
      setBurst(true);
      setTimeout(() => setBurst(false), 800);
    }
    prevDone.current = done;
  }, [done]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "relative rounded-xl border p-4 bg-zinc-950/20 backdrop-blur-md transition-all duration-200",
        done
          ? "border-emerald-500/20 bg-emerald-950/[0.03] opacity-80"
          : "border-zinc-800/80 hover:border-zinc-700"
      )}
    >
      <AnimatePresence>{burst && <ConfettiBurst />}</AnimatePresence>
      <div className="flex items-start gap-3.5">
        {/* Week badge */}
        <div className={cn(
          "flex-shrink-0 w-8 h-8 rounded-lg border flex items-center justify-center text-xs font-bold shadow-inner select-none transition-colors",
          done
            ? "border-emerald-500/20 bg-emerald-950/20 text-emerald-400"
            : "border-zinc-800 bg-zinc-900 text-zinc-300"
        )}>
          W{step.week}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-1.5 select-none">
            <span className={cn("text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border", tierColor)}>
              {TIER_LABELS[step.tier] ?? step.tier}
            </span>
            <span className="text-[10px] text-zinc-500 flex items-center gap-1 font-medium">
              <Clock size={10} /> ~{step.estimated_hours}h
            </span>
          </div>
          <p className={cn("text-xs sm:text-sm font-medium leading-relaxed", done ? "line-through text-zinc-500" : "text-zinc-150")}>
            {step.skill}
          </p>
          {step.resources.length > 0 && (
            <ul className="mt-2.5 space-y-1 pl-1 border-l border-zinc-800">
              {step.resources.map((r, i) => (
                <li key={i} className="text-[11px] text-zinc-400 flex items-center gap-1.5">
                  <ChevronRight size={10} className="text-zinc-550 flex-shrink-0" />
                  <span className="leading-tight">{r}</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Done toggle */}
        <button
          type="button"
          onClick={onToggle}
          className={cn(
            "flex-shrink-0 mt-0.5 p-1 rounded-lg hover:bg-white/5 transition-colors cursor-pointer",
            done ? "text-emerald-400 hover:text-zinc-400" : "text-zinc-650 hover:text-emerald-400"
          )}
          title={done ? "Mark incomplete" : "Mark complete"}
        >
          {done ? <CheckCircle2 size={18} /> : <Circle size={18} />}
        </button>
      </div>
    </motion.div>
  );
}

// ── Progress bar (simple % bar) ──────────────────────────────────────────────

function ProgressBar({ pct, completedWeeks, totalWeeks, etaWeeks }: {
  pct: number; completedWeeks: number; totalWeeks: number; etaWeeks: number;
}) {
  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-900/25 backdrop-blur-md p-5 shadow-xl relative overflow-hidden">
      <div className="flex justify-between text-xs font-semibold mb-2 select-none">
        <span className="text-zinc-450">Roadmap Progress</span>
        <span className="text-white">{pct}%</span>
      </div>
      <div className="h-2 rounded-full bg-zinc-950 border border-zinc-900 overflow-hidden w-full mb-3">
        <motion.div
          className="h-full bg-emerald-500 shadow-[0_0_12px_rgba(16,185,129,0.3)] transition-all"
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        />
      </div>
      <div className="flex flex-wrap justify-between text-[11px] text-zinc-500 font-medium select-none">
        <span>{completedWeeks} of {totalWeeks} weeks completed</span>
        {pct === 100 ? (
          <span className="text-emerald-400 flex items-center gap-1 font-semibold">
            Roadmap complete! 🎉
          </span>
        ) : (
          <span>~{etaWeeks} weeks remaining</span>
        )}
      </div>
    </div>
  );
}

// ── Config panel ──────────────────────────────────────────────────────────────

function GeneratePanel({
  onGenerate, loading,
}: {
  onGenerate: (role: string, weeks: number) => void;
  loading:    boolean;
}) {
  const [role,  setRole]  = useState("");
  const [weeks, setWeeks] = useState(12);

  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-900/25 backdrop-blur-md p-6 space-y-5 shadow-xl">
      <div className="space-y-2">
        <label className="text-xs font-semibold text-zinc-455 uppercase tracking-wider">Target role *</label>
        <input
          type="text"
          value={role}
          onChange={(e) => setRole(e.target.value)}
          placeholder="e.g. Senior Backend Engineer"
          className="w-full rounded-xl border border-zinc-800 bg-zinc-900/60 hover:bg-zinc-900 hover:border-zinc-700 px-3.5 py-2.5 text-xs text-white placeholder:text-zinc-650 focus:outline-hidden transition-all"
        />
      </div>

      <div className="space-y-2 w-full sm:w-32">
        <label className="text-xs font-semibold text-zinc-455 uppercase tracking-wider">Weeks (4–52)</label>
        <input
          type="number"
          value={weeks}
          min={4}
          max={52}
          onChange={(e) => setWeeks(Number(e.target.value))}
          className="w-full rounded-xl border border-zinc-800 bg-zinc-900/60 px-3.5 py-2.5 text-xs text-white focus:outline-hidden"
        />
      </div>

      <Button
        onClick={() => onGenerate(role, weeks)}
        disabled={loading || !role.trim()}
        className="w-full bg-white hover:bg-zinc-200 text-zinc-950 font-semibold rounded-xl h-[38px] transition-all text-xs cursor-pointer shadow-md disabled:opacity-40"
      >
        {loading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Mapping skills & timelines…
          </>
        ) : (
          <>
            <Sparkles className="mr-2 h-4 w-4" />
            Generate Roadmap
          </>
        )}
      </Button>

      <p className="text-[10px] text-zinc-550 leading-normal select-none">
        Uses your latest skill gap report to prioritize missing skills.
        Re-generating creates a versioned new roadmap; old ones are preserved.
      </p>
    </div>
  );
}

// ── Main page ──────────────────────────────────────────────────────────────────

export default function RoadmapPage() {
  const {
    roadmaps, current, stats, loading, error,
    generate, fetchRoadmaps, loadRoadmap, markStep, deleteRoadmap, clearCurrent,
  } = useRoadmap();

  const [panelOpen, setPanelOpen] = useState(true);

  useEffect(() => { fetchRoadmaps(); }, [fetchRoadmaps]);

  async function handleGenerate(role: string, weeks: number) {
    await generate(role, {}, weeks);
    setPanelOpen(false);
  }

  const steps = (current?.content ?? []) as RoadmapStep[];
  const progress = current?.progress ?? {};

  return (
    <div className="relative min-h-[calc(100vh)] bg-bg-base bg-grid-dots overflow-hidden">
      {/* Background glow effects */}
      <div className="ambient-glow-orb w-[600px] h-[600px] -top-40 -left-20 animate-float-1" />
      <div className="ambient-glow-orb w-[500px] h-[500px] bottom-5 right-5 animate-float-2" />

      <div className="relative z-10 mx-auto max-w-4xl py-8 px-6 flex flex-col md:flex-row gap-6">
        {/* ── Sidebar ──────────────────────────────────────── */}
        <aside className="w-full md:w-56 shrink-0 flex flex-col gap-3">
          <div className="flex items-center justify-between border-b border-zinc-800/80 pb-2 select-none">
            <span className="text-[10px] font-bold text-zinc-550 uppercase tracking-widest font-mono">Roadmaps</span>
            {current && (
              <button
                type="button"
                onClick={() => { clearCurrent(); setPanelOpen(true); }}
                className="text-[10px] font-bold text-white hover:opacity-80 transition-opacity cursor-pointer"
              >
                + New Roadmap
              </button>
            )}
          </div>
          {roadmaps.length === 0 && (
            <p className="text-xs text-zinc-650 py-4 select-none">No roadmaps yet</p>
          )}
          <div className="space-y-1.5 max-h-[40vh] md:max-h-[70vh] overflow-y-auto pr-1 scrollbar-none">
            {roadmaps.map((r) => (
              <div
                key={r.id}
                className={cn(
                  "group relative rounded-xl border p-3.5 cursor-pointer transition-all duration-150",
                  current?.id === r.id
                    ? "border-zinc-700 bg-zinc-850/30 text-white"
                    : "border-zinc-800 bg-zinc-900/10 hover:border-zinc-700/60"
                )}
                onClick={() => loadRoadmap(r.id)}
              >
                <p className="text-xs font-semibold text-zinc-150 truncate leading-tight pr-4">{r.targetRole}</p>
                <div className="flex items-center gap-2 mt-1.5 select-none">
                  <div className="flex-1 h-1.5 rounded-full bg-zinc-950 border border-zinc-900/50 overflow-hidden">
                    <div className="h-full bg-emerald-500" style={{ width: `${r.pct}%` }} />
                  </div>
                  <span className="text-[9px] text-zinc-500 font-bold leading-none">{r.pct}%</span>
                </div>
                <p className="text-[9px] text-zinc-500 mt-1 capitalize leading-none font-medium">
                  v{r.version} · {r.weeks} weeks
                </p>
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); deleteRoadmap(r.id); }}
                  className="absolute top-3.5 right-3 opacity-0 group-hover:opacity-100 text-zinc-500 hover:text-red-400 transition rounded p-0.5 hover:bg-white/5 cursor-pointer"
                  title="Delete roadmap"
                >
                  <Trash2 size={12} />
                </button>
              </div>
            ))}
          </div>
        </aside>

        {/* ── Main content ─────────────────────────────────── */}
        <div className="flex-1 min-w-0 space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
                Career Roadmap
                <span className="text-[9px] font-semibold px-1.5 py-0.5 rounded bg-zinc-900 border border-zinc-800 text-zinc-500 uppercase tracking-wider">AI</span>
              </h1>
              <p className="text-xs text-zinc-400 mt-1">Week-by-week skill plan tailored to your target role</p>
            </div>
            {current && (
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => { clearCurrent(); setPanelOpen(true); }}
                  className="border-zinc-800 hover:border-zinc-700 bg-zinc-900/20 text-zinc-400 hover:text-white rounded-xl text-xs cursor-pointer select-none"
                >
                  <RefreshCw size={12} className="mr-1" /> New Roadmap
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPanelOpen((o) => !o)}
                  className="border-zinc-800 hover:border-zinc-700 bg-zinc-900/20 text-zinc-400 hover:text-white rounded-xl text-xs cursor-pointer select-none"
                >
                  {panelOpen ? "Hide Configuration" : "Edit Setup"}
                </Button>
              </div>
            )}
          </div>

          {/* Error */}
          {error && (
            <div className="flex items-center gap-2 text-xs text-red-400 bg-red-950/10 border border-red-900/20 rounded-xl p-3">
              <AlertCircle size={14} className="shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Generate panel */}
          {panelOpen && (
            <GeneratePanel onGenerate={handleGenerate} loading={loading} />
          )}

          {/* Progress bar */}
          {current && stats && (
            <ProgressBar
              pct={stats.pct}
              completedWeeks={stats.completedWeeks}
              totalWeeks={stats.totalWeeks}
              etaWeeks={stats.etaWeeks}
            />
          )}

          {/* Step timeline */}
          {steps.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-zinc-900 pb-2 select-none">
                <h2 className="text-xs font-bold text-zinc-400 uppercase tracking-widest">
                  {current?.targetRole} — {steps.length}-week plan
                  {current && current.version > 1 && (
                    <span className="ml-2 font-mono text-[9px] text-zinc-500 normal-case">v{current.version}</span>
                  )}
                </h2>
              </div>
              <div className="space-y-3">
                {steps.map((step) => (
                  <StepCard
                    key={step.week}
                    step={step}
                    done={!!progress[String(step.week)]}
                    onToggle={() => markStep(step.week, !progress[String(step.week)])}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Empty state */}
          {!current && !loading && !panelOpen && (
            <div className="flex flex-col items-center justify-center py-20 text-center select-none">
              <Map size={36} className="text-zinc-700 mb-4" />
              <p className="text-xs text-zinc-500">No career roadmap generated yet. Enable settings to initiate plan.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

