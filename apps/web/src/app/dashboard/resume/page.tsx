"use client";

import { useRef, useState, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Upload, FileText, Trash2, Download, CheckCircle2, AlertCircle,
  Loader2, FileX, Clock, ChevronDown, ChevronUp, Cpu, GraduationCap,
  Briefcase, Zap, XCircle, Lightbulb, X,
} from "lucide-react";
import { useResume } from "@/hooks/useResume";
import type { Resume, ParsedResume, ATSScore } from "@axiom/shared-types";

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
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#27272a" strokeWidth={8} />
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth={8}
        strokeDasharray={`${fill} ${circ}`} strokeLinecap="round" />
    </svg>
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
        ${drag ? "border-white/60 bg-white/5" : "border-zinc-700 hover:border-zinc-500 hover:bg-zinc-900/40"}`}
    >
      <input ref={inputRef} type="file" accept={ACCEPTED} className="hidden"
        onChange={(e) => { const f = e.target.files?.[0]; if (f) handle(f); e.target.value = ""; }} />
      <div className="flex flex-col items-center gap-3">
        <div className="w-14 h-14 rounded-2xl bg-zinc-800 border border-zinc-700 flex items-center justify-center">
          <Upload size={24} className="text-zinc-400" />
        </div>
        <div>
          <p className="text-sm font-semibold text-white">Drop your resume here</p>
          <p className="text-xs text-zinc-500 mt-1">or click to browse — PDF or DOCX, max {MAX_MB} MB</p>
        </div>
      </div>
    </div>
  );
}

// ── Parsed data panel ─────────────────────────────────────────────────────────

function ParsedPanel({ data }: { data: ParsedResume }) {
  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-950/60 p-4 space-y-4 text-sm">
      {data.skills.length > 0 && (
        <div>
          <div className="flex items-center gap-1.5 text-zinc-400 mb-2">
            <Cpu size={13} /><span className="text-xs font-semibold uppercase tracking-wider">Skills detected</span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {data.skills.map((s) => (
              <span key={s.name} className="px-2 py-0.5 rounded-full bg-zinc-800 border border-zinc-700 text-xs text-zinc-300">{s.name}</span>
            ))}
          </div>
        </div>
      )}
      {data.experience.length > 0 && (
        <div>
          <div className="flex items-center gap-1.5 text-zinc-400 mb-2">
            <Briefcase size={13} /><span className="text-xs font-semibold uppercase tracking-wider">Experience</span>
          </div>
          <div className="space-y-1.5">
            {data.experience.slice(0, 3).map((e, i) => (
              <div key={i} className="flex items-start gap-2">
                <span className="w-1 h-1 rounded-full bg-zinc-600 mt-2 shrink-0" />
                <p className="text-xs text-zinc-400">
                  <span className="text-zinc-200">{e.title}</span>
                  {e.company && <span className="text-zinc-500"> · {e.company}</span>}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
      {data.education.length > 0 && (
        <div>
          <div className="flex items-center gap-1.5 text-zinc-400 mb-2">
            <GraduationCap size={13} /><span className="text-xs font-semibold uppercase tracking-wider">Education</span>
          </div>
          <div className="space-y-1.5">
            {data.education.map((e, i) => (
              <div key={i} className="flex items-start gap-2">
                <span className="w-1 h-1 rounded-full bg-zinc-600 mt-2 shrink-0" />
                <p className="text-xs text-zinc-400">
                  <span className="text-zinc-200">{e.institution}</span>
                  {e.endYear && <span className="text-zinc-500"> · {e.endYear}</span>}
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
    score.overall >= 75 ? { text: "Excellent",  cls: "text-green-400 bg-green-950/40 border-green-800/40" } :
    score.overall >= 50 ? { text: "Good",        cls: "text-amber-400 bg-amber-950/40 border-amber-800/40" } :
                          { text: "Needs work",  cls: "text-red-400 bg-red-950/40 border-red-800/40" };

  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-950/60 p-5 space-y-5">
      {/* Score ring + breakdown */}
      <div className="flex items-center gap-5">
        <div className="relative shrink-0">
          <ScoreRing score={score.overall} />
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-2xl font-bold text-white">{score.overall}</span>
            <span className="text-xs text-zinc-500">/ 100</span>
          </div>
        </div>
        <div className="flex-1">
          <p className="text-sm font-semibold text-white mb-1">ATS Score</p>
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full border text-xs font-medium ${label.cls}`}>{label.text}</span>
          <div className="mt-3 space-y-1.5">
            {[
              { label: "Keywords",     val: score.keywordMatch },
              { label: "Completeness", val: score.completeness },
              { label: "Readability",  val: score.readability },
            ].map((s) => (
              <div key={s.label} className="flex items-center gap-2">
                <span className="text-xs text-zinc-500 w-24 shrink-0">{s.label}</span>
                <div className="flex-1 h-1.5 bg-zinc-800 rounded-full">
                  <div className="h-full rounded-full bg-white/60" style={{ width: `${s.val}%` }} />
                </div>
                <span className="text-xs text-zinc-400 w-8 text-right shrink-0">{s.val}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {score.strengths.length > 0 && (
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-2 flex items-center gap-1.5">
            <CheckCircle2 size={12} className="text-green-500" /> Strengths
          </p>
          <ul className="space-y-1">
            {score.strengths.map((s, i) => (
              <li key={i} className="text-xs text-zinc-300 flex items-start gap-2">
                <span className="w-1 h-1 rounded-full bg-green-500 mt-1.5 shrink-0" />{s}
              </li>
            ))}
          </ul>
        </div>
      )}

      {score.missingSkills.length > 0 && (
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-2 flex items-center gap-1.5">
            <XCircle size={12} className="text-amber-500" /> Missing keywords
          </p>
          <div className="flex flex-wrap gap-1.5">
            {score.missingSkills.map((s) => (
              <span key={s} className="px-2 py-0.5 rounded-full bg-amber-950/30 border border-amber-800/40 text-xs text-amber-300">{s}</span>
            ))}
          </div>
        </div>
      )}

      {score.suggestions.length > 0 && (
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-2 flex items-center gap-1.5">
            <Lightbulb size={12} className="text-blue-400" /> Suggestions
          </p>
          <ul className="space-y-1">
            {score.suggestions.map((s, i) => (
              <li key={i} className="text-xs text-zinc-300 flex items-start gap-2">
                <span className="w-1 h-1 rounded-full bg-blue-400 mt-1.5 shrink-0" />{s}
              </li>
            ))}
          </ul>
        </div>
      )}
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
        className="w-full max-w-xl bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden"
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800">
          <div>
            <p className="text-sm font-semibold text-white flex items-center gap-2">
              <Zap size={14} className="text-amber-400" /> ATS Analyzer
            </p>
            <p className="text-xs text-zinc-500 mt-0.5 truncate max-w-xs">{resume.fileName}</p>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors">
            <X size={16} />
          </button>
        </div>

        <div className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
          {!result && (
            <div className="space-y-2">
              <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Job description</label>
              <textarea
                value={jd}
                onChange={(e) => setJd(e.target.value)}
                placeholder="Paste the full job description here…"
                rows={8}
                className="w-full rounded-xl bg-zinc-800 border border-zinc-700 text-sm text-white placeholder-zinc-600 p-3 resize-none focus:outline-none focus:border-zinc-500 transition-colors"
              />
              <p className="text-xs text-zinc-600">{jd.length} / 10 000 chars</p>
            </div>
          )}

          {error && (
            <div className="flex items-center gap-2 p-3 rounded-lg bg-red-950/40 border border-red-800/50 text-red-400 text-xs">
              <AlertCircle size={14} /> {error}
            </div>
          )}

          {result && <ATSPanel score={result} />}

          <div className="flex gap-2 pt-1">
            {result ? (
              <>
                <button onClick={() => { setResult(null); setJd(""); }}
                  className="flex-1 py-2.5 rounded-xl border border-zinc-700 text-sm text-zinc-300 hover:bg-zinc-800 transition-colors">
                  Re-analyze
                </button>
                <button onClick={onClose}
                  className="flex-1 py-2.5 rounded-xl bg-zinc-50 text-zinc-950 text-sm font-semibold hover:bg-zinc-200 transition-colors">
                  Done
                </button>
              </>
            ) : (
              <button onClick={handleRun} disabled={loading || jd.trim().length < 20}
                className="flex-1 py-2.5 rounded-xl bg-zinc-50 text-zinc-950 text-sm font-semibold hover:bg-zinc-200 disabled:opacity-40 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2">
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
  resume, onDelete, onAnalyze,
}: {
  resume: Resume & { downloadUrl?: string };
  onDelete: (id: string) => void;
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
  const date = new Date(resume.createdAt).toLocaleDateString("en-US", {
    year: "numeric", month: "short", day: "numeric",
  });

  return (
    <>
      <motion.div layout initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.97 }}
        className="rounded-xl border border-zinc-800 bg-zinc-900/50 hover:border-zinc-700 transition-colors">
        <div className="flex items-center gap-4 p-4 group">
          <div className="w-10 h-10 rounded-lg bg-zinc-800 border border-zinc-700 flex items-center justify-center shrink-0">
            <FileText size={18} className="text-zinc-300" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-white truncate">{resume.fileName}</p>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-xs text-zinc-500 uppercase font-mono">{resume.fileType}</span>
              <span className="text-zinc-700">·</span>
              <span className="text-xs text-zinc-500">v{resume.version}</span>
              <span className="text-zinc-700">·</span>
              <Clock size={11} className="text-zinc-600" />
              <span className="text-xs text-zinc-500">{date}</span>
            </div>
          </div>

          {/* Status badge */}
          {atsScore ? (
            <div className="shrink-0 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-zinc-800 border border-zinc-700">
              <span className={`text-xs font-bold ${atsScore.overall >= 75 ? "text-green-400" : atsScore.overall >= 50 ? "text-amber-400" : "text-red-400"}`}>
                {atsScore.overall}
              </span>
              <span className="text-xs text-zinc-500">ATS</span>
            </div>
          ) : hasParsed ? (
            <div className="shrink-0 flex items-center gap-1 px-2.5 py-1 rounded-full bg-green-950/40 border border-green-800/40">
              <CheckCircle2 size={11} className="text-green-400" />
              <span className="text-xs text-green-400 font-medium">Parsed</span>
            </div>
          ) : (
            <div className="shrink-0 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-zinc-800 border border-zinc-700">
              <Loader2 size={11} className="text-zinc-500 animate-spin" />
              <span className="text-xs text-zinc-500">Parsing…</span>
            </div>
          )}

          {/* Action buttons */}
          <div className="flex items-center gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
            {hasParsed && (
              <button onClick={() => setAnalyzeOpen(true)}
                className="p-2 rounded-lg hover:bg-zinc-800 text-zinc-400 hover:text-amber-400 transition-colors" title="ATS Analyze">
                <Zap size={15} />
              </button>
            )}
            {resume.downloadUrl && (
              <a href={resume.downloadUrl} target="_blank" rel="noopener noreferrer"
                className="p-2 rounded-lg hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors" title="Download">
                <Download size={15} />
              </a>
            )}
            {hasParsed && (
              <button onClick={() => setExpanded((v) => !v)}
                className="p-2 rounded-lg hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors"
                title={expanded ? "Hide details" : "Show parsed data"}>
                {expanded ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
              </button>
            )}
            <button onClick={handleDelete} disabled={deleting}
              className={`p-2 rounded-lg transition-colors ${confirming ? "bg-red-600/20 text-red-400 hover:bg-red-600/30" : "hover:bg-zinc-800 text-zinc-400 hover:text-red-400"}`}
              title={confirming ? "Click again to confirm" : "Delete"}>
              {deleting ? <Loader2 size={15} className="animate-spin" /> : <Trash2 size={15} />}
            </button>
          </div>

          {confirming && (
            <button onClick={() => setConfirming(false)} className="text-xs text-zinc-500 hover:text-zinc-300 shrink-0">
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
  const { resumes, isLoading, isUploading, uploadResume, deleteResume, analyzeResume, refetch } = useResume();
  const [uploadError,   setUploadError]   = useState<string | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [polling,       setPolling]       = useState(false);

  useEffect(() => {
    const unparsed = resumes.some((r) => !r.parsedData);
    if (!unparsed || !uploadSuccess) { setPolling(false); return; }
    setPolling(true);
    const interval = setInterval(() => { refetch(); }, 3000);
    const timeout  = setTimeout(() => { clearInterval(interval); setPolling(false); }, 30_000);
    return () => { clearInterval(interval); clearTimeout(timeout); };
  }, [resumes, uploadSuccess, refetch]);

  async function handleFile(file: File) {
    setUploadError(null);
    setUploadSuccess(false);
    try {
      await uploadResume(file);
      setUploadSuccess(true);
      setTimeout(() => setUploadSuccess(false), 30_000);
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { error?: string } } })?.response?.data?.error;
      setUploadError(msg ?? "Upload failed. Please try again.");
    }
  }

  return (
    <div className="p-6 md:p-8 max-w-3xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">Resume</h1>
        <p className="text-sm text-zinc-400 mt-1">
          Upload your resume — it will be parsed automatically, then you can run ATS analysis against any job description.
        </p>
      </div>

      <div className="mb-4">
        {isUploading ? (
          <div className="rounded-2xl border-2 border-dashed border-zinc-700 p-10 flex flex-col items-center gap-3">
            <Loader2 size={28} className="text-zinc-400 animate-spin" />
            <p className="text-sm text-zinc-400">Uploading…</p>
          </div>
        ) : (
          <UploadZone onFile={handleFile} />
        )}
      </div>

      <AnimatePresence>
        {uploadSuccess && (
          <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="flex items-center gap-2 p-3 mb-4 rounded-lg bg-green-950/40 border border-green-800/50 text-green-400 text-sm">
            <CheckCircle2 size={15} />
            Uploaded! Parsing in the background
            {polling && <Loader2 size={13} className="ml-1 animate-spin" />}
          </motion.div>
        )}
        {uploadError && (
          <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="flex items-center gap-2 p-3 mb-4 rounded-lg bg-red-950/40 border border-red-800/50 text-red-400 text-sm">
            <AlertCircle size={15} />
            {uploadError}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="mt-6">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider">
            Your resumes {!isLoading && resumes.length > 0 && `(${resumes.length})`}
          </h2>
          {!isLoading && resumes.some((r) => r.parsedData) && (
            <p className="text-xs text-zinc-600 flex items-center gap-1">
              <Zap size={11} className="text-amber-500/70" />
              Hover a card to run ATS analysis
            </p>
          )}
        </div>

        {isLoading ? (
          <div className="space-y-3">
            {[1, 2].map((i) => (
              <div key={i} className="h-[68px] rounded-xl bg-zinc-900/50 border border-zinc-800 animate-pulse" />
            ))}
          </div>
        ) : resumes.length === 0 ? (
          <div className="flex flex-col items-center gap-3 py-12 text-center">
            <FileX size={32} className="text-zinc-700" />
            <p className="text-sm text-zinc-500">No resumes yet — upload one above to get started.</p>
          </div>
        ) : (
          <motion.div layout className="space-y-2">
            <AnimatePresence>
              {resumes.map((r) => (
                <ResumeCard
                  key={r.id}
                  resume={r as Resume & { downloadUrl?: string }}
                  onDelete={deleteResume}
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
