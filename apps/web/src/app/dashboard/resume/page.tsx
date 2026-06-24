"use client";

import { useRef, useState, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Upload, FileText, Trash2, Download, CheckCircle2, AlertCircle,
  Loader2, FileX, Clock, ChevronDown, ChevronUp, Cpu, GraduationCap,
  Briefcase, Zap, XCircle, Lightbulb, X,
} from "lucide-react";
import { useResume } from "@/hooks/useResume";
import { api } from "@/lib/api";
import type { Resume, ParsedResume, ATSScore } from "@axiom/shared-types";
import { DashboardResumeSkeleton } from "@/components/dashboard/DashboardResumeSkeleton";

const ACCEPTED = ".pdf,.docx";
const MAX_MB   = 5;

// ── Score ring ────────────────────────────────────────────────────────────────

function ScoreRing({ score, size = 88 }: { score: number; size?: number }) {
  const r    = (size - 12) / 2;
  const circ = 2 * Math.PI * r;
  const fill = (score / 100) * circ;
  const color =
    score >= 75 ? "#22c55e" :
    score >= 50 ? "#f59e0b" :
                  "#ef4444";
  return (
    <svg width={size} height={size} className="-rotate-90">
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="currentColor" className="text-border-subtle" strokeWidth={8} />
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth={8}
        strokeDasharray={`${fill} ${circ}`} strokeLinecap="round" />
    </svg>
  );
}

// ── Parsed data panel ─────────────────────────────────────────────────────────

function ParsedPanel({ data }: { data: ParsedResume }) {
  return (
    <div className="rounded-xl border border-border-subtle bg-bg-card/65 p-4 space-y-4 text-sm">
      {data.skills && data.skills.length > 0 && (
        <div>
          <div className="flex items-center gap-1.5 text-text-secondary mb-2">
            <Cpu size={13} /><span className="text-xs font-semibold uppercase tracking-wider text-text-muted">Skills detected</span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {data.skills.map((s) => (
              <span key={s.name} className="px-2 py-0.5 rounded-full bg-bg-elevated border border-border-subtle text-xs text-text-secondary">{s.name}</span>
            ))}
          </div>
        </div>
      )}
      {data.experience && data.experience.length > 0 && (
        <div>
          <div className="flex items-center gap-1.5 text-text-secondary mb-2">
            <Briefcase size={13} /><span className="text-xs font-semibold uppercase tracking-wider text-text-muted">Experience</span>
          </div>
          <div className="space-y-1.5">
            {data.experience.map((e, i) => (
              <div key={i} className="flex items-start gap-2">
                <span className="w-1 h-1 rounded-full bg-text-muted mt-2 shrink-0" />
                <p className="text-xs text-text-secondary">
                  <span className="text-text-primary font-semibold">{e.title}</span>
                  {e.company && <span className="text-text-secondary font-medium"> · {e.company}</span>}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
      {data.education && data.education.length > 0 && (
        <div>
          <div className="flex items-center gap-1.5 text-text-secondary mb-2">
            <GraduationCap size={13} /><span className="text-xs font-semibold uppercase tracking-wider text-text-muted">Education</span>
          </div>
          <div className="space-y-1.5">
            {data.education.map((e, i) => (
              <div key={i} className="flex items-start gap-2">
                <span className="w-1 h-1 rounded-full bg-text-muted mt-2 shrink-0" />
                <p className="text-xs text-text-secondary">
                  <span className="text-text-primary font-semibold">{e.institution}</span>
                  {e.endYear && <span className="text-text-secondary font-medium"> · {e.endYear}</span>}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ── ATS Score panel ───────────────────────────────────────────────────────────

function ATSPanel({ score }: { score: ATSScore }) {
  const label =
    score.overall >= 75 ? { text: "Excellent",  cls: "text-green-500 bg-green-500/10 border-green-500/20" } :
    score.overall >= 50 ? { text: "Good",        cls: "text-amber-500 bg-amber-500/10 border-amber-500/20" } :
                          { text: "Needs work",  cls: "text-red-500 bg-red-500/10 border-red-500/20" };

  return (
    <div className="rounded-xl border border-border-subtle bg-bg-card/65 p-5 space-y-5">
      {/* Score ring + breakdown */}
      <div className="flex items-center gap-5">
        <div className="relative shrink-0">
          <ScoreRing score={score.overall} />
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-2xl font-bold text-text-primary">{score.overall}</span>
            <span className="text-xs text-text-muted">/ 100</span>
          </div>
        </div>
        <div className="flex-1">
          <p className="text-sm font-semibold text-text-primary mb-1">ATS Score</p>
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full border text-xs font-medium ${label.cls}`}>{label.text}</span>
          <div className="mt-3 space-y-1.5">
            {[
              { label: "Keywords",     val: score.keywordMatch },
              { label: "Completeness", val: score.completeness },
              { label: "Readability",  val: score.readability },
            ].map((s) => (
              <div key={s.label} className="flex items-center gap-2">
                <span className="text-xs text-text-secondary w-24 shrink-0 font-medium">{s.label}</span>
                <div className="flex-1 h-1.5 bg-bg-elevated rounded-full">
                  <div className="h-full rounded-full bg-brand/70" style={{ width: `${s.val}%` }} />
                </div>
                <span className="text-xs text-text-secondary w-8 text-right shrink-0 font-semibold">{s.val}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {score.strengths && score.strengths.length > 0 && (
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-text-secondary mb-2 flex items-center gap-1.5">
            <CheckCircle2 size={12} className="text-green-500" /> Strengths
          </p>
          <ul className="space-y-1">
            {score.strengths.map((s, i) => (
              <li key={i} className="text-xs text-text-secondary flex items-start gap-2 font-medium">
                <span className="w-1 h-1 rounded-full bg-green-500 mt-1.5 shrink-0" />{s}
              </li>
            ))}
          </ul>
        </div>
      )}

      {score.missingSkills && score.missingSkills.length > 0 && (
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-text-secondary mb-2 flex items-center gap-1.5">
            <XCircle size={12} className="text-amber-500" /> Missing keywords
          </p>
          <div className="flex flex-wrap gap-1.5">
            {score.missingSkills.map((s) => (
              <span key={s} className="px-2 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-xs text-amber-500 font-semibold">{s}</span>
            ))}
          </div>
        </div>
      )}

      {score.suggestions && score.suggestions.length > 0 && (
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-text-secondary mb-2 flex items-center gap-1.5">
            <Lightbulb size={12} className="text-blue-500" /> Suggestions
          </p>
          <ul className="space-y-1">
            {score.suggestions.map((s, i) => (
              <li key={i} className="text-xs text-text-secondary flex items-start gap-2 font-medium">
                <span className="w-1 h-1 rounded-full bg-blue-500 mt-1.5 shrink-0" />{s}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

// ── Upload zone ───────────────────────────────────────────────────────────────

function UploadZone({ onFile }: { onFile: (f: File) => void }) {
  const inputRef        = useRef<HTMLInputElement>(null);
  const [drag, setDrag] = useState(false);

  const handle = useCallback((f: File) => {
    const ext = f.name.split(".").pop()?.toLowerCase();
    if (!["pdf", "docx"].includes(ext ?? "")) return;
    if (f.size > MAX_MB * 1024 * 1024) return;
    onFile(f);
  }, [onFile]);

  return (
    <div
      onDragOver={(e) => { e.preventDefault(); setDrag(true); }}
      onDragLeave={() => setDrag(false)}
      onDrop={(e) => { e.preventDefault(); setDrag(false); const f = e.dataTransfer.files[0]; if (f) handle(f); }}
      onClick={() => inputRef.current?.click()}
      className={`relative cursor-pointer rounded-2xl border-2 border-dashed p-10 text-center transition-all
        ${drag ? "border-text-primary/60 bg-text-primary/5" : "border-border-medium hover:border-border-strong hover:bg-bg-hover/30"}`}
    >
      <input ref={inputRef} type="file" accept={ACCEPTED} className="hidden"
        onChange={(e) => { const f = e.target.files?.[0]; if (f) handle(f); e.target.value = ""; }} />
      <div className="flex flex-col items-center gap-3">
        <div className="w-14 h-14 rounded-2xl bg-bg-elevated border border-border-subtle flex items-center justify-center">
          <Upload size={24} className="text-text-secondary" />
        </div>
        <div>
          <p className="text-sm font-semibold text-text-primary">Drop your resume here</p>
          <p className="text-xs text-text-secondary mt-1">or click to browse — PDF or DOCX, max {MAX_MB} MB</p>
        </div>
      </div>
    </div>
  );
}

// ── Analyze modal ─────────────────────────────────────────────────────────────

function AnalyzeModal({
  resume, onClose, onAnalyze,
}: {
  resume: Resume;
  onClose: () => void;
  onAnalyze: (id: string, jd: string) => Promise<Resume>;
}) {
  const [jd, setJd]           = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState<string | null>(null);
  const [result, setResult]   = useState<ATSScore | null>(resume.atsScore as ATSScore | null);

  async function handleRun() {
    if (jd.trim().length < 20) { setError("Paste at least 20 characters of the job description."); return; }
    setError(null);
    setLoading(true);
    try {
      const updated = await onAnalyze(resume.id, jd.trim());
      setResult(updated.atsScore as ATSScore);
    } catch (e: unknown) {
      const msg = (e as { response?: { data?: { error?: string } } })?.response?.data?.error;
      setError(msg ?? "Analysis failed — make sure the AI service is running.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
        className="w-full max-w-xl bg-bg-card border border-border-subtle rounded-2xl shadow-2xl overflow-hidden"
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-border-subtle">
          <div>
            <p className="text-sm font-semibold text-text-primary flex items-center gap-2">
              <Zap size={14} className="text-amber-500" /> ATS Analyzer
            </p>
            <p className="text-xs text-text-secondary mt-0.5 truncate max-w-xs">{resume.fileName}</p>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-bg-hover text-text-secondary hover:text-text-primary transition-colors cursor-pointer">
            <X size={16} />
          </button>
        </div>

        <div className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
          {!result && (
            <div className="space-y-2">
              <label className="text-xs font-semibold text-text-secondary uppercase tracking-wider">Job description</label>
              <textarea
                value={jd}
                onChange={(e) => setJd(e.target.value)}
                placeholder="Paste the full job description here…"
                rows={8}
                className="w-full rounded-xl bg-bg-elevated border border-border-subtle text-sm text-text-primary placeholder:text-text-muted p-3 resize-none focus:outline-none focus:border-border-medium transition-colors"
              />
              <p className="text-xs text-text-muted font-medium">{jd.length} / 10 000 chars</p>
            </div>
          )}

          {error && (
            <div className="flex items-center gap-2 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-500 text-xs">
              <AlertCircle size={14} /> {error}
            </div>
          )}

          {result && <ATSPanel score={result} />}

          <div className="flex gap-2 pt-1">
            {result ? (
              <>
                <button onClick={() => { setResult(null); setJd(""); }}
                  className="flex-1 py-2.5 rounded-xl border border-border-medium text-sm text-text-secondary hover:bg-bg-hover transition-colors cursor-pointer">
                  Re-analyze
                </button>
                <button onClick={onClose}
                  className="flex-1 py-2.5 rounded-xl bg-text-primary text-bg-base text-sm font-semibold hover:opacity-90 transition-colors cursor-pointer">
                  Done
                </button>
              </>
            ) : (
              <button onClick={handleRun} disabled={loading || jd.trim().length < 20}
                className="flex-1 py-2.5 rounded-xl bg-text-primary text-bg-base text-sm font-semibold hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2 cursor-pointer">
                {loading ? <><Loader2 size={14} className="animate-spin" /> Analyzing…</> : "Run ATS Analysis"}
              </button>
            )}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ── Resume card ───────────────────────────────────────────────────────────────

function ResumeCard({
  resume, isActive, discoveryStatus, onDelete, onSetActive, onAnalyze,
}: {
  resume: Resume & { downloadUrl?: string };
  isActive: boolean;
  discoveryStatus: string | null;
  onDelete: (id: string) => void;
  onSetActive: (id: string) => void;
  onAnalyze: (id: string, jd: string) => Promise<Resume>;
}) {
  const [confirming,  setConfirming]  = useState(false);
  const [deleting,    setDeleting]    = useState(false);
  const [expanded,    setExpanded]    = useState(false);
  const [analyzeOpen, setAnalyzeOpen] = useState(false);

  function handleDelete() {
    if (!confirming) { setConfirming(true); return; }
    setDeleting(true);
    onDelete(resume.id);
  }

  const parsed   = resume.parsedData as ParsedResume | null;
  const atsScore = resume.atsScore as ATSScore | null;
  const hasParsed = parsed && (parsed.skills?.length > 0 || parsed.experience?.length > 0);
  const isCompleted = resume.status === "COMPLETED";
  const isFailed = resume.status === "FAILED";
  const date = new Date(resume.createdAt).toLocaleDateString("en-US", {
    year: "numeric", month: "short", day: "numeric",
  });

  return (
    <>
      <motion.div layout initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.97 }}
        className="rounded-xl border border-border-subtle bg-bg-card/50 hover:border-border-medium transition-colors">
        <div className="flex items-center gap-4 p-4 group relative">
          <div className="w-10 h-10 rounded-lg bg-bg-elevated border border-border-subtle flex items-center justify-center shrink-0">
            <FileText size={18} className="text-text-secondary" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-text-primary truncate pr-16 md:pr-0">{resume.fileName}</p>
            <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 mt-0.5">
              <span className="text-xs text-text-secondary uppercase font-mono">{resume.fileType}</span>
              <span className="text-border-subtle">·</span>
              <span className="text-xs text-text-secondary">v{resume.version}</span>
              <span className="text-border-subtle">·</span>
              <Clock size={11} className="text-text-muted shrink-0" />
              <span className="text-xs text-text-secondary">{date}</span>
            </div>
          </div>

          {/* Active badge + discovery status */}
          {isActive && (
            <div className="shrink-0 flex items-center gap-1.5 mr-2 md:mr-0">
              <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-brand/10 border border-brand/30">
                <span className="text-xs text-brand font-semibold">Active</span>
              </div>
              {discoveryStatus === "PENDING" && (
                <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-amber-500/10 border border-amber-500/30" title="Generating job recommendations">
                  <Loader2 size={10} className="text-amber-500 animate-spin" />
                  <span className="text-xs text-amber-500 font-medium">Discovering jobs…</span>
                </div>
              )}
              {discoveryStatus === "SCRAPING" && (
                <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-amber-500/10 border border-amber-500/30" title="Scraping and matching jobs">
                  <Loader2 size={10} className="text-amber-500 animate-spin" />
                  <span className="text-xs text-amber-500 font-medium">Matching jobs…</span>
                </div>
              )}
              {discoveryStatus === "FAILED" && (
                <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-red-500/10 border border-red-500/30" title="Job discovery failed">
                  <AlertCircle size={10} className="text-red-500" />
                  <span className="text-xs text-red-500 font-medium">Discovery failed</span>
                </div>
              )}
            </div>
          )}

          {/* Status badge */}
          {isFailed ? (
            <div className="shrink-0 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-red-500/10 border border-red-500/20 mr-2 md:mr-0 group relative" title={resume.parsingError ?? "Parsing failed"}>
              <AlertCircle size={11} className="text-red-500" />
              <span className="text-xs text-red-500 font-medium">Failed</span>
            </div>
          ) : atsScore ? (
            <div className="shrink-0 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-bg-elevated border border-border-subtle mr-2 md:mr-0">
              <span className={`text-xs font-bold ${atsScore.overall >= 75 ? "text-green-500" : atsScore.overall >= 50 ? "text-amber-500" : "text-red-500"}`}>
                {atsScore.overall}
              </span>
              <span className="text-xs text-text-secondary">ATS</span>
            </div>
          ) : isCompleted || hasParsed ? (
            <div className="shrink-0 flex items-center gap-1 px-2.5 py-1 rounded-full bg-green-500/10 border border-green-500/20 mr-2 md:mr-0">
              <CheckCircle2 size={11} className="text-green-500" />
              <span className="text-xs text-green-500 font-medium">Parsed</span>
            </div>
          ) : resume.status === "UPLOADING" ? (
            <div className="shrink-0 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-bg-elevated border border-border-subtle mr-2 md:mr-0">
              <Loader2 size={11} className="text-text-secondary animate-spin" />
              <span className="text-xs text-text-secondary font-medium">Uploading…</span>
            </div>
          ) : (
            <div className="shrink-0 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-bg-elevated border border-border-subtle mr-2 md:mr-0">
              <Loader2 size={11} className="text-text-secondary animate-spin" />
              <span className="text-xs text-text-secondary font-medium">Parsing…</span>
            </div>
          )}

          {/* Action buttons - Opacity: 100% by default on mobile touch viewports, hover hidden on desktop */}
          <div className="flex items-center gap-1 shrink-0 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
            {!isActive && isCompleted && (
              <button onClick={() => onSetActive(resume.id)}
                className="p-2 rounded-lg hover:bg-bg-hover text-text-secondary hover:text-brand transition-colors cursor-pointer" title="Set as active">
                <CheckCircle2 size={15} />
              </button>
            )}
            {isCompleted && hasParsed && (
              <button onClick={() => setAnalyzeOpen(true)}
                className="p-2 rounded-lg hover:bg-bg-hover text-text-secondary hover:text-amber-500 transition-colors cursor-pointer" title="ATS Analyze">
                <Zap size={15} />
              </button>
            )}
            {resume.downloadUrl && (
              <a href={resume.downloadUrl} target="_blank" rel="noopener noreferrer"
                className="p-2 rounded-lg hover:bg-bg-hover text-text-secondary hover:text-text-primary transition-colors" title="Download">
                <Download size={15} />
              </a>
            )}
            {hasParsed && (
              <button onClick={() => setExpanded((v) => !v)}
                className="p-2 rounded-lg hover:bg-bg-hover text-text-secondary hover:text-text-primary transition-colors cursor-pointer"
                title={expanded ? "Hide details" : "Show parsed data"}>
                {expanded ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
              </button>
            )}
            <button onClick={handleDelete} disabled={deleting}
              className={`p-2 rounded-lg transition-colors cursor-pointer ${confirming ? "bg-red-500/10 text-red-500 hover:bg-red-500/20" : "hover:bg-bg-hover text-text-secondary hover:text-red-500"}`}
              title={confirming ? "Click again to confirm" : "Delete"}>
              {deleting ? <Loader2 size={15} className="animate-spin" /> : <Trash2 size={15} />}
            </button>
          </div>

          {confirming && (
            <button onClick={() => setConfirming(false)} className="text-xs text-text-secondary hover:text-text-primary shrink-0 cursor-pointer">
              Cancel
            </button>
          )}
        </div>

        <AnimatePresence>
          {expanded && hasParsed && parsed && (
            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden px-4 pb-4">
              <ParsedPanel data={parsed} />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      <AnimatePresence>
        {analyzeOpen && (
          <AnalyzeModal resume={resume} onClose={() => setAnalyzeOpen(false)} onAnalyze={onAnalyze} />
        )}
      </AnimatePresence>
    </>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function ResumePage() {
  const { resumes, activeResumeId, isLoading, isUploading, uploadResume, deleteResume, setActiveResume, analyzeResume, refetch } = useResume();
  const [activeDiscoveryStatuses, setActiveDiscoveryStatuses] = useState<Record<string, string | null>>({});

  // Poll discovery status for the active resume
  useEffect(() => {
    if (!activeResumeId) return;
    const fetchDiscoveryStatus = async () => {
      try {
        const { data } = await api.get(`/resumes/${activeResumeId}/discovery`);
        setActiveDiscoveryStatuses((prev) => ({
          ...prev,
          [activeResumeId]: data.discovery?.status ?? null,
        }));
      } catch {
        // Ignore
      }
    };
    fetchDiscoveryStatus();
    const interval = setInterval(fetchDiscoveryStatus, 5000);
    return () => clearInterval(interval);
  }, [activeResumeId]);
  const [uploadError,   setUploadError]   = useState<string | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [polling,       setPolling]       = useState(false);

  // Background polling: Poll if *any* resume is still being processed (UPLOADING or PARSING).
  // Stops automatically once all resumes reach a terminal state (COMPLETED or FAILED).
  useEffect(() => {
    const pending = resumes.some((r) => r.status === "UPLOADING" || r.status === "PARSING");
    if (!pending) {
      setPolling(false);
      return;
    }
    setPolling(true);
    const interval = setInterval(() => {
      void refetch();
    }, 3500);
    return () => clearInterval(interval);
  }, [resumes, refetch]);

  async function handleFile(file: File) {
    setUploadError(null);
    setUploadSuccess(false);
    try {
      await uploadResume(file);
      setUploadSuccess(true);
      setTimeout(() => setUploadSuccess(false), 20_000);
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { error?: string } } })?.response?.data?.error;
      setUploadError(msg ?? "Upload failed. Please try again.");
    }
  }

  if (isLoading) {
    return <DashboardResumeSkeleton />;
  }

  return (
    <div className="p-6 md:p-8 max-w-3xl bg-bg-base">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-text-primary">Resume</h1>
        <p className="text-sm text-text-secondary mt-1 font-medium">
          Upload your resume — it will be parsed automatically, then you can run ATS analysis against any job description.
        </p>
      </div>

      <div className="mb-4">
        {isUploading ? (
          <div className="rounded-2xl border-2 border-dashed border-border-medium p-10 flex flex-col items-center gap-3 bg-bg-card/20">
            <Loader2 size={28} className="text-text-secondary animate-spin" />
            <p className="text-sm text-text-secondary font-medium">Uploading and reading file layers…</p>
          </div>
        ) : (
          <UploadZone onFile={handleFile} />
        )}
      </div>

      <AnimatePresence>
        {uploadSuccess && (
          <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="flex items-center gap-2 p-3 mb-4 rounded-lg bg-green-500/10 border border-green-500/20 text-green-500 text-sm font-medium">
            <CheckCircle2 size={15} />
            Uploaded successfully! Parsing document in background
            {polling && <Loader2 size={13} className="ml-1 animate-spin" />}
          </motion.div>
        )}
        {uploadError && (
          <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="flex items-center gap-2 p-3 mb-4 rounded-lg bg-red-500/10 border border-red-500/20 text-red-500 text-sm font-medium">
            <AlertCircle size={15} />
            {uploadError}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="mt-6">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-text-secondary uppercase tracking-wider">
            Your resumes {resumes.length > 0 && `(${resumes.length})`}
          </h2>
          {resumes.some((r) => r.status === "COMPLETED") && (
            <p className="text-xs text-text-secondary flex items-center gap-1 font-medium">
              <Zap size={11} className="text-amber-500" />
              Hover a card to run ATS analysis
            </p>
          )}
        </div>

        {resumes.length === 0 ? (
          <div className="flex flex-col items-center gap-3 py-12 text-center">
            <FileX size={32} className="text-text-muted" />
            <p className="text-sm text-text-secondary font-medium">No resumes yet — upload one above to get started.</p>
          </div>
        ) : (
          <motion.div layout className="space-y-2">
            <AnimatePresence>
              {resumes.map((r) => (
                <ResumeCard
                  key={r.id}
                  resume={r as Resume & { downloadUrl?: string }}
                  isActive={r.id === activeResumeId}
                  discoveryStatus={activeDiscoveryStatuses[r.id] ?? null}
                  onDelete={deleteResume}
                  onSetActive={setActiveResume}
                  onAnalyze={analyzeResume}
                />
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </div>
    </div>
  );
}
