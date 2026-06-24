"use client";

import { useEffect, useState } from "react";
import { BookOpen, CheckCircle2, XCircle, AlertCircle, ChevronDown, Loader2, Sparkles, Trophy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSkillGap, type GapReport, type TargetRole } from "@/hooks/useSkillGap";
import { useResume } from "@/hooks/useResume";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { SkillGapPageSkeleton } from "@/components/dashboard/SkillsSkeleton";

const TIER_LABELS: Record<string, string> = {
  must_have: "Must Have Skills",
  should_have: "Should Have Skills",
  nice_to_have: "Nice to Have Skills",
};

const TIER_COLORS: Record<"must_have" | "should_have" | "nice_to_have", { border: string; bg: string; text: string; lightBg: string }> = {
  must_have: {
    border: "border-red-500/20",
    bg: "bg-red-500/10",
    text: "text-red-500",
    lightBg: "bg-red-500/10"
  },
  should_have: {
    border: "border-amber-500/20",
    bg: "bg-amber-500/10",
    text: "text-amber-500",
    lightBg: "bg-amber-500/10"
  },
  nice_to_have: {
    border: "border-blue-500/20",
    bg: "bg-blue-500/10",
    text: "text-blue-500",
    lightBg: "bg-blue-500/10"
  },
};

function ReadinessMeter({ pct }: { pct: number }) {
  const color = pct >= 70 ? "bg-emerald-500 shadow-[0_0_12px_rgba(16,185,129,0.3)]" : pct >= 40 ? "bg-amber-500 shadow-[0_0_12px_rgba(245,158,11,0.3)]" : "bg-red-500 shadow-[0_0_12px_rgba(239,68,68,0.3)]";
  
  return (
    <div className="space-y-2">
      <div className="flex justify-between text-xs font-medium">
        <span className="text-text-secondary">Overall Role Readiness</span>
        <span className="font-semibold text-text-primary">{pct}%</span>
      </div>
      <div className="h-2 w-full rounded-full bg-bg-base overflow-hidden border border-border-subtle/40">
        <motion.div 
          className={cn("h-full rounded-full transition-all", color)} 
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        />
      </div>
    </div>
  );
}

function SkillChip({ skill, matched }: { skill: string; matched: boolean }) {
  return (
    <motion.span
      initial={{ scale: 0.95, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium select-none transition-all duration-150",
        matched
          ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20"
          : "border-border-subtle bg-bg-card/40 text-text-secondary hover:text-text-primary"
      )}
    >
      {matched ? (
        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
      ) : (
        <XCircle className="h-3.5 w-3.5 text-text-muted shrink-0" />
      )}
      {skill}
    </motion.span>
  );
}

function TierSection({
  tier,
  matchedSkills,
  missingSkills,
}: {
  tier: "must_have" | "should_have" | "nice_to_have";
  matchedSkills: string[];
  missingSkills: string[];
}) {
  const [open, setOpen] = useState(true);
  const colors = TIER_COLORS[tier];
  if (!matchedSkills.length && !missingSkills.length) return null;

  return (
    <div className={cn("rounded-xl border bg-bg-card/10 backdrop-blur-md p-4 transition-all duration-200 animate-none", colors.border)}>
      <button
        type="button"
        className="flex w-full items-center justify-between cursor-pointer"
        onClick={() => setOpen((o) => !o)}
      >
        <div className="flex items-center gap-2.5">
          <span className={cn("text-xs font-semibold px-2 py-0.5 rounded border uppercase tracking-wider text-[10px]", colors.text, colors.border)}>
            {TIER_LABELS[tier]?.split(" ")[0]}
          </span>
          <span className="text-sm font-semibold text-text-primary">{TIER_LABELS[tier]}</span>
        </div>
        <div className="flex items-center gap-3 text-xs text-text-secondary">
          <span>{matchedSkills.length} matched · {missingSkills.length} missing</span>
          <ChevronDown className={cn("h-4 w-4 text-text-muted transition-transform duration-200", open ? "" : "-rotate-90")} />
        </div>
      </button>
      
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="mt-4 flex flex-wrap gap-2 pt-2 border-t border-border-subtle/30">
              {matchedSkills.map((s) => <SkillChip key={s} skill={s} matched />)}
              {missingSkills.map((s) => <SkillChip key={s} skill={s} matched={false} />)}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function GapReportView({ report }: { report: GapReport }) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Summary card */}
      <div className="rounded-2xl border border-border-subtle bg-bg-card/25 backdrop-blur-md p-6 space-y-5 relative overflow-hidden shadow-xl">
        <div className="absolute top-0 right-0 w-32 h-32 bg-text-primary/[0.01] rounded-full blur-2xl pointer-events-none" />
        
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-semibold text-text-primary tracking-tight">{report.roleLabel}</h2>
            <p className="text-[11px] text-text-muted mt-0.5">Automated skill mapping matrix</p>
          </div>
          <span className="rounded-full bg-bg-base border border-border-subtle px-3 py-1 text-xs text-text-secondary font-medium">
            {report.summary.matchedCount} of {report.summary.total} skills matched
          </span>
        </div>
        
        <ReadinessMeter pct={report.summary.readinessPct} />
        
        {report.summary.mustHaveGap > 0 ? (
          <div className="flex items-start gap-2.5 rounded-lg bg-red-500/10 border border-red-500/20 p-3 text-xs text-red-500 leading-relaxed">
            <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold">Missing critical requirements:</span> You are missing <span className="font-semibold text-text-primary">{report.summary.mustHaveGap} must-have</span> skill{report.summary.mustHaveGap !== 1 ? "s" : ""} required for this role. Acquired skills gap sits at <span className="font-semibold text-text-primary">{report.summary.skillsAway}</span> total skill{report.summary.skillsAway !== 1 ? "s" : ""}.
            </div>
          </div>
        ) : (
          <div className="flex items-start gap-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 p-3 text-xs text-emerald-500 leading-relaxed">
            <Trophy className="h-4 w-4 shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold">Excellent match!</span> You possess all the essential must-have skills required for this target role.
            </div>
          </div>
        )}
      </div>

      {/* Tier breakdowns */}
      <div className="space-y-3">
        {(["must_have", "should_have", "nice_to_have"] as const).map((tier) => (
          <TierSection
            key={tier}
            tier={tier}
            matchedSkills={report.matched[tier]}
            missingSkills={report.missing[tier]}
          />
        ))}
      </div>

      {/* Top recommendations */}
      {report.recommendations.length > 0 && (
        <div className="rounded-2xl border border-border-subtle bg-bg-card/25 backdrop-blur-md p-6 space-y-4 shadow-xl">
          <h3 className="text-xs font-semibold text-text-secondary uppercase tracking-wider flex items-center gap-1.5">
            <Sparkles size={13} className="text-text-muted" /> Key Skills Priority Checklist
          </h3>
          <div className="divide-y divide-border-subtle/40">
            {report.recommendations.slice(0, 6).map((rec) => {
              const colors = TIER_COLORS[rec.tier] ?? TIER_COLORS.nice_to_have;
              return (
                <div key={rec.skill} className="flex items-center justify-between py-3 first:pt-0 last:pb-0 text-xs border-b border-border-subtle/20 last:border-b-0">
                  <span className="text-text-primary font-medium">{rec.skill}</span>
                  <span className={cn("rounded-md border px-2 py-0.5 text-[10px] font-semibold tracking-wide uppercase", colors.text, colors.border, colors.lightBg)}>
                    {rec.tierLabel?.replace(" Skills", "")}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </motion.div>
  );
}

export default function SkillsPage() {
  const { roles, report, loading, error, fetchRoles, analyzeGap } = useSkillGap();
  const { resumes }  = useResume();
  const [selectedRole, setSelectedRole]   = useState<TargetRole | null>(null);
  const [selectedResume, setSelectedResume] = useState<string>("");
  const [analyzed, setAnalyzed] = useState(false);

  useEffect(() => { fetchRoles(); }, [fetchRoles]);

  useEffect(() => {
    if (resumes.length > 0 && !selectedResume && resumes[0]) {
      setSelectedResume(resumes[0].id);
    }
  }, [resumes, selectedResume]);

  if (loading && !roles.length) return <SkillGapPageSkeleton />;

  async function handleAnalyze() {
    if (!selectedRole || !selectedResume) return;
    const r = await analyzeGap(selectedResume, selectedRole.id);
    if (r) setAnalyzed(true);
  }

  return (
    <div className="relative min-h-full bg-bg-base bg-grid-dots overflow-hidden">
      {/* Background glow effects */}
      <div className="ambient-glow-orb w-[600px] h-[600px] -top-40 -left-20 animate-float-1" />
      <div className="ambient-glow-orb w-[500px] h-[500px] bottom-5 right-5 animate-float-2" />

      <div className="relative z-10 mx-auto max-w-3xl space-y-8 py-8 px-6">
        <div>
          <h1 className="text-xl font-bold text-text-primary tracking-tight flex items-center gap-2">
            Skill Gap Analyzer
            <span className="text-[9px] font-semibold px-1.5 py-0.5 rounded bg-bg-card border border-border-subtle text-text-muted uppercase tracking-wider">ATS</span>
          </h1>
          <p className="mt-1 text-xs text-text-secondary">
            Compare your resume skills against target roles to identify critical skill gaps.
          </p>
        </div>

        {/* Controls */}
        <div className="rounded-2xl border border-border-subtle bg-bg-card/25 backdrop-blur-md p-6 space-y-5 shadow-xl">
          {/* Resume picker */}
          {resumes.length > 1 && (
            <div className="space-y-2">
              <label className="text-xs font-semibold text-text-secondary uppercase tracking-wider">Select Resume</label>
              <div className="relative">
                <select
                  className="w-full rounded-xl border border-border-subtle bg-bg-card/60 hover:bg-bg-card hover:border-border-medium px-3.5 py-2.5 text-xs text-text-primary transition-all appearance-none cursor-pointer focus:outline-hidden"
                  value={selectedResume}
                  onChange={(e) => { setSelectedResume(e.target.value); setAnalyzed(false); }}
                >
                  {resumes.map((r) => (
                    <option key={r.id} value={r.id} className="bg-bg-base text-text-primary">{r.fileName ?? r.id}</option>
                  ))}
                </select>
                <div className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-text-muted">
                  <ChevronDown className="h-4 w-4" />
                </div>
              </div>
            </div>
          )}

          {/* Role picker */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-text-secondary uppercase tracking-wider">Select Target Role</label>
            {loading && !roles.length ? (
              <div className="flex items-center gap-2 text-xs text-text-muted py-2">
                <Loader2 className="h-4 w-4 animate-spin text-text-secondary" />
                Loading target roles matrix…
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                {roles.map((role) => (
                  <button
                    key={role.id}
                    type="button"
                    title={role.description}
                    onClick={() => { setSelectedRole(role); setAnalyzed(false); }}
                    className={cn(
                      "rounded-xl border px-3 py-3 text-left text-xs transition-all duration-150 cursor-pointer select-none animate-none",
                      selectedRole?.id === role.id
                        ? "border-border-medium bg-text-primary/10 text-text-primary font-medium"
                        : "border-border-subtle bg-bg-card/30 text-text-secondary hover:border-border-medium hover:text-text-primary"
                    )}
                  >
                    <p className="font-semibold truncate">{role.label}</p>
                    <p className="text-[9px] text-text-muted truncate mt-0.5">{role.description}</p>
                  </button>
                ))}
              </div>
            )}
          </div>

          <Button
            onClick={handleAnalyze}
            disabled={!selectedRole || !selectedResume || loading}
            className="w-full bg-brand hover:bg-brand-hover text-black font-semibold rounded-xl h-10 transition-all text-xs cursor-pointer shadow-md disabled:opacity-40"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Mapping Resume Competencies…
              </>
            ) : (
              <>
                <BookOpen className="mr-2 h-4 w-4" />
                Analyze Skill Match
              </>
            )}
          </Button>

          {error && (
            <div className="flex items-center gap-2 text-xs text-red-500 bg-red-500/10 border border-red-500/20 rounded-xl p-3">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {!resumes.length && !loading && (
            <div className="flex items-center gap-2 text-xs text-amber-500 bg-amber-500/10 border border-amber-500/20 rounded-xl p-3">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>Please upload a resume first to run gap analysis.</span>
            </div>
          )}
        </div>

        {/* Report Section */}
        {analyzed && report && <GapReportView report={report} />}
      </div>
    </div>
  );
}
