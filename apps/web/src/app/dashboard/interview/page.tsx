"use client";

import { useEffect, useState } from "react";
import {
  Sparkles, ChevronDown, ChevronUp, Trash2, Loader2,
  BookOpen, CheckCircle2, Clock, AlertCircle, HelpCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useInterview, type Difficulty, type Mark, type InterviewQuestion } from "@/hooks/useInterview";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { InterviewPageSkeleton } from "@/components/dashboard/InterviewSkeleton";

// ── Constants ─────────────────────────────────────────────────────────────────

const DIFFICULTIES: { value: Difficulty; label: string; color: string }[] = [
  { value: "easy",   label: "Easy",   color: "border-emerald-500/20 bg-emerald-500/10 text-emerald-500"  },
  { value: "medium", label: "Medium", color: "border-amber-500/20 bg-amber-500/10 text-amber-500" },
  { value: "hard",   label: "Hard",   color: "border-red-500/20 bg-red-500/10 text-red-500"        },
];

const ALL_SECTIONS = [
  { id: "dsa",               label: "Data Structures & Algorithms" },
  { id: "system_design",     label: "System Design"                },
  { id: "sql",               label: "SQL & Databases"              },
  { id: "behavioral",        label: "Behavioral"                   },
  { id: "coding",            label: "Coding Practices"             },
  { id: "language_specific", label: "Language Specific"            },
];

const CATEGORY_COLORS: Record<string, string> = {
  dsa:               "border-blue-500/20 bg-blue-500/10 text-blue-500",
  system_design:     "border-purple-500/20 bg-purple-500/10 text-purple-500",
  sql:               "border-cyan-500/20 bg-cyan-500/10 text-cyan-500",
  behavioral:        "border-amber-500/20 bg-amber-500/10 text-amber-500",
  coding:            "border-emerald-500/20 bg-emerald-500/10 text-emerald-500",
  language_specific: "border-pink-500/20 bg-pink-500/10 text-pink-500",
};

// ── Question card ─────────────────────────────────────────────────────────────

function QuestionCard({
  q, index, mark, onMark,
}: {
  q: InterviewQuestion;
  index: number;
  mark: Mark;
  onMark: (m: Mark) => void;
}) {
  const [hintOpen, setHintOpen] = useState(false);
  const catColor = CATEGORY_COLORS[q.category] ?? "border-border-subtle bg-bg-card/30 text-text-secondary";
  const diffColor = q.difficulty === "easy"
    ? "text-emerald-500"
    : q.difficulty === "hard"
      ? "text-red-500"
      : "text-amber-500";

  return (
    <motion.div 
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "rounded-xl border p-5 bg-bg-card/25 backdrop-blur-md transition-all duration-200",
        mark === "correct"
          ? "border-emerald-500/20 bg-emerald-500/[0.03]"
          : mark === "review"
            ? "border-amber-500/20 bg-amber-500/[0.03]"
            : "border-border-subtle hover:border-border-medium"
      )}
    >
      {/* Header */}
      <div className="flex items-start gap-3.5">
        <span className="mt-0.5 flex-shrink-0 w-7 h-7 rounded-lg bg-bg-card border border-border-subtle flex items-center justify-center text-xs font-bold text-text-secondary shadow-inner">
          {index + 1}
        </span>
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap gap-2 mb-2">
            <span className={cn("text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border select-none", catColor)}>
              {q.category.replace("_", " ")}
            </span>
            <span className={cn("text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border border-border-subtle bg-bg-card/50 select-none", diffColor)}>
              {q.difficulty}
            </span>
          </div>
          <p className="text-xs sm:text-sm text-text-primary leading-relaxed font-medium">{q.question}</p>
        </div>
      </div>

      {/* Hint toggle */}
      <div className="mt-3.5 pl-10">
        <button
          type="button"
          onClick={() => setHintOpen((o) => !o)}
          className="flex items-center gap-1.5 text-xs text-text-secondary hover:text-text-primary transition-colors cursor-pointer select-none"
        >
          {hintOpen ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
          <span className="font-medium">{hintOpen ? "Hide response hint" : "Show response hint"}</span>
        </button>
        
        <AnimatePresence initial={false}>
          {hintOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="mt-2.5 rounded-xl border border-border-subtle bg-bg-card/30 px-4 py-3.5 text-[11px] text-text-secondary leading-relaxed">
                <div className="font-semibold text-text-primary mb-1 flex items-center gap-1">
                  <HelpCircle size={11} className="text-text-muted" /> Key Talking Points:
                </div>
                {q.expected_answer_hint}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Mark buttons */}
      <div className="flex gap-2 mt-4 pl-10">
        <button
          type="button"
          onClick={() => onMark(mark === "correct" ? null : "correct")}
          className={cn(
            "flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-[11px] font-medium transition-all cursor-pointer select-none",
            mark === "correct"
              ? "border-emerald-500/30 bg-emerald-500/20 text-emerald-500 shadow-sm"
              : "border-border-subtle bg-bg-card/20 text-text-secondary hover:border-emerald-500/20 hover:text-emerald-500"
          )}
        >
          <CheckCircle2 size={12} /> Got it
        </button>
        <button
          type="button"
          onClick={() => onMark(mark === "review" ? null : "review")}
          className={cn(
            "flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-[11px] font-medium transition-all cursor-pointer select-none",
            mark === "review"
              ? "border-amber-500/30 bg-amber-500/20 text-amber-500 shadow-sm"
              : "border-border-subtle bg-bg-card/20 text-text-secondary hover:border-amber-500/20 hover:text-amber-500"
          )}
        >
          <Clock size={12} /> Needs review
        </button>
      </div>
    </motion.div>
  );
}

// ── Progress bar ──────────────────────────────────────────────────────────────

function Progress({ marks, total }: { marks: Record<number, Mark>; total: number }) {
  const correct = Object.values(marks).filter((m) => m === "correct").length;
  const review  = Object.values(marks).filter((m) => m === "review").length;
  const pct     = total > 0 ? Math.round((correct / total) * 100) : 0;

  return (
    <div className="rounded-2xl border border-border-subtle bg-bg-card/25 backdrop-blur-md p-5 flex flex-col sm:flex-row items-center gap-6 shadow-xl relative overflow-hidden">
      <div className="flex-1 w-full">
        <div className="flex justify-between text-xs font-semibold mb-2 select-none">
          <span className="text-text-secondary">Practice Completion</span>
          <span className="text-text-primary">{pct}%</span>
        </div>
        <div className="h-2 rounded-full bg-bg-base border border-border-subtle overflow-hidden w-full">
          <motion.div
            className="h-full bg-emerald-500 shadow-[0_0_12px_rgba(16,185,129,0.3)] transition-all"
            initial={{ width: 0 }}
            animate={{ width: `${pct}%` }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          />
        </div>
      </div>
      <div className="flex gap-4 text-xs shrink-0 select-none">
        <span className="text-emerald-500 flex items-center gap-1.5 font-medium"><CheckCircle2 size={13} />{correct} Got it</span>
        <span className="text-amber-500 flex items-center gap-1.5 font-medium"><Clock size={13} />{review} Review</span>
        <span className="text-text-muted">{total - correct - review} Remaining</span>
      </div>
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────

export default function InterviewPage() {
  const {
    questions, sessions, marks, loading, error,
    generate, fetchSessions, loadSession, deleteSession,
    clearQuestions, setMark, resetMarks,
  } = useInterview();

  const [jobTitle,       setJobTitle]       = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [difficulty,     setDifficulty]     = useState<Difficulty>("medium");
  const [sections,       setSections]       = useState<string[]>([]);
  const [count,          setCount]          = useState(10);
  const [panelOpen,      setPanelOpen]      = useState(true);

  useEffect(() => { fetchSessions(); }, [fetchSessions]);

  function toggleSection(id: string) {
    setSections((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id],
    );
  }

  async function handleGenerate() {
    await generate(jobTitle, jobDescription, difficulty, sections, count);
    setPanelOpen(false);
  }

  function handleNewSession() {
    clearQuestions();
    setPanelOpen(true);
  }

  return (
    <div className="relative min-h-screen bg-bg-base bg-grid-dots overflow-hidden">
      {/* Background glow effects */}
      <div className="ambient-glow-orb w-[600px] h-[600px] -top-40 -left-20 animate-float-1" />
      <div className="ambient-glow-orb w-[500px] h-[500px] bottom-5 right-5 animate-float-2" />

      <div className="relative z-10 mx-auto max-w-4xl py-8 px-6 flex flex-col md:flex-row gap-6">
        
        {/* ── Session sidebar ─────────────────────────────── */}
        <aside className="w-full md:w-56 shrink-0 flex flex-col gap-3">
          <div className="flex items-center justify-between border-b border-border-subtle pb-2 select-none">
            <span className="text-[10px] font-bold text-text-muted uppercase tracking-widest">History</span>
            {questions.length > 0 && (
              <button
                type="button"
                onClick={handleNewSession}
                className="text-[10px] font-bold text-text-primary hover:opacity-80 transition-opacity cursor-pointer"
              >
                + New Prep
              </button>
            )}
          </div>
          {sessions.length === 0 && (
            <p className="text-xs text-text-muted py-4 select-none">No prep sessions yet</p>
          )}
          <div className="space-y-1.5 max-h-[40vh] md:max-h-[70vh] overflow-y-auto pr-1 scrollbar-none">
            {sessions.map((s) => (
              <div
                key={s.id}
                className="group relative rounded-xl border border-border-subtle bg-bg-card/10 hover:border-border-medium p-3.5 cursor-pointer transition-all duration-150"
                onClick={() => loadSession(s.id)}
              >
                <p className="text-xs font-semibold text-text-primary truncate leading-tight pr-4">{s.jobTitle}</p>
                <p className="text-[9px] text-text-muted mt-1 capitalize leading-none font-medium">
                  {s.difficulty} · {new Date(s.createdAt).toLocaleDateString()}
                </p>
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); deleteSession(s.id); }}
                  className="absolute top-3.5 right-3 opacity-0 group-hover:opacity-100 text-text-muted hover:text-red-500 transition rounded p-0.5 hover:bg-bg-hover cursor-pointer"
                  title="Delete session"
                >
                  <Trash2 size={12} />
                </button>
              </div>
            ))}
          </div>
        </aside>

        {/* ── Main content ────────────────────────────────── */}
        <div className="flex-1 min-w-0 space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold text-text-primary tracking-tight flex items-center gap-2">
                Interview Prep Coach
                <span className="text-[9px] font-semibold px-1.5 py-0.5 rounded bg-bg-card border border-border-subtle text-text-muted uppercase tracking-wider">AI</span>
              </h1>
              <p className="text-xs text-text-secondary mt-1">Generative simulated question banks customized to target descriptions</p>
            </div>
            {questions.length > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPanelOpen((o) => !o)}
                className="border-border-subtle hover:border-border-medium bg-bg-card/20 text-text-secondary hover:text-text-primary rounded-xl text-xs cursor-pointer select-none"
              >
                {panelOpen ? "Hide Configuration" : "Edit Setup"}
              </Button>
            )}
          </div>

          {/* Config panel */}
          {panelOpen && (
            <div className="rounded-2xl border border-border-subtle bg-bg-card/25 backdrop-blur-md p-6 space-y-5 shadow-xl">
              {/* Job title */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-text-secondary uppercase tracking-wider">Job Title *</label>
                <input
                  type="text"
                  value={jobTitle}
                  onChange={(e) => setJobTitle(e.target.value)}
                  placeholder="e.g. Senior Backend Engineer"
                  className="w-full rounded-xl border border-border-subtle bg-bg-card/60 hover:bg-bg-hover hover:border-border-medium px-3.5 py-2.5 text-xs text-text-primary placeholder:text-text-muted focus:outline-hidden transition-all"
                />
              </div>

              {/* Job description */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-text-secondary uppercase tracking-wider">
                  Job Description <span className="opacity-60 lowercase font-normal">(optional — boosts relevance)</span>
                </label>
                <textarea
                  value={jobDescription}
                  onChange={(e) => setJobDescription(e.target.value)}
                  placeholder="Paste the job requirements description here to generate specialized context matching..."
                  rows={3}
                  className="w-full rounded-xl border border-border-subtle bg-bg-card/60 hover:bg-bg-hover hover:border-border-medium px-3.5 py-2.5 text-xs text-text-primary placeholder:text-text-muted resize-none focus:outline-hidden transition-all"
                />
              </div>

              {/* Difficulty */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-text-secondary uppercase tracking-wider">Difficulty Level</label>
                <div className="flex gap-2">
                  {DIFFICULTIES.map((d) => (
                    <button
                      key={d.value}
                      type="button"
                      onClick={() => setDifficulty(d.value)}
                      className={cn(
                        "flex-1 rounded-xl border px-3 py-2.5 text-xs font-semibold transition-all cursor-pointer select-none",
                        difficulty === d.value
                          ? d.color
                          : "border-border-subtle bg-bg-card/30 text-text-secondary hover:border-border-medium hover:text-text-primary"
                      )}
                    >
                      {d.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Sections */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-text-secondary uppercase tracking-wider">
                  Question Categories <span className="opacity-60 lowercase font-normal">(leave empty for automated select)</span>
                </label>
                <div className="flex flex-wrap gap-2">
                  {ALL_SECTIONS.map((s) => {
                    const active = sections.includes(s.id);
                    return (
                      <button
                        key={s.id}
                        type="button"
                        onClick={() => toggleSection(s.id)}
                        className={cn(
                          "px-3.5 py-1.5 rounded-full border text-[11px] font-medium transition-all cursor-pointer select-none",
                          active
                            ? "border-border-medium bg-text-primary/10 text-text-primary font-semibold"
                            : "border-border-subtle text-text-secondary bg-bg-card/20 hover:border-border-medium hover:text-text-primary"
                        )}
                      >
                        {s.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Count + Generate */}
              <div className="flex flex-col sm:flex-row items-end gap-3 pt-2">
                <div className="space-y-2 w-full sm:w-32 shrink-0">
                  <label className="text-xs font-semibold text-text-secondary uppercase tracking-wider">Count</label>
                  <input
                    type="number"
                    value={count}
                    min={1}
                    max={30}
                    onChange={(e) => setCount(Number(e.target.value))}
                    className="w-full rounded-xl border border-border-subtle bg-bg-card/60 px-3.5 py-2.5 text-xs text-text-primary focus:outline-hidden"
                  />
                </div>
                <Button
                  onClick={handleGenerate}
                  disabled={loading || !jobTitle.trim()}
                  className="w-full bg-brand hover:bg-brand-hover text-black font-semibold rounded-xl h-[38px] transition-all text-xs cursor-pointer shadow-md disabled:opacity-40"
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Drafting simulated questionnaire…
                    </>
                  ) : (
                    <>
                      <Sparkles className="mr-2 h-4 w-4" />
                      Generate Mock Interview
                    </>
                  )}
                </Button>
              </div>

              {!jobTitle.trim() && (
                <p className="text-[10px] text-amber-500 font-medium select-none">Enter a target role title above to begin drafting.</p>
              )}
              {error && (
                <div className="flex items-center gap-2 text-xs text-red-500 bg-red-500/10 border border-red-500/20 rounded-xl p-3">
                  <AlertCircle size={14} className="shrink-0" />
                  <span>{error}</span>
                </div>
              )}
            </div>
          )}

          {/* Progress */}
          {questions.length > 0 && (
            <Progress marks={marks} total={questions.length} />
          )}

          {/* Questions list */}
          {questions.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-border-subtle pb-2 select-none">
                <h2 className="text-xs font-bold text-text-secondary uppercase tracking-widest">
                  {questions.length} Questions Set
                </h2>
                <button
                  type="button"
                  onClick={resetMarks}
                  className="text-xs text-text-muted hover:text-text-primary transition-colors cursor-pointer"
                >
                  Clear practice flags
                </button>
              </div>
              
              <div className="space-y-3">
                {questions.map((q, i) => (
                  <QuestionCard
                    key={i}
                    q={q}
                    index={i}
                    mark={marks[i] ?? null}
                    onMark={(m) => setMark(i, m)}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Empty state */}
          {questions.length === 0 && !loading && !panelOpen && (
            <div className="flex flex-col items-center justify-center py-20 text-center select-none">
              <BookOpen size={36} className="text-text-muted mb-4" />
              <p className="text-xs text-text-secondary">No mock questions generated yet. Enable settings to initiate prep.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
