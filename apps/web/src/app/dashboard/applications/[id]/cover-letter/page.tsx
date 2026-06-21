"use client";

import { useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  Wand2, Save, FileDown, FileText, ArrowLeft, Loader2, AlertCircle, CheckCircle2, RefreshCw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCoverLetter, type Tone } from "@/hooks/useCoverLetter";
import { useApplications } from "@/hooks/useApplications";
import { useResume } from "@/hooks/useResume";

const TONES: { value: Tone; label: string; desc: string }[] = [
  { value: "formal",   label: "Formal",   desc: "Polished and professional" },
  { value: "friendly", label: "Friendly", desc: "Warm and conversational"   },
  { value: "direct",   label: "Direct",   desc: "Punchy, results-first"     },
];

export default function CoverLetterPage() {
  const { id: applicationId } = useParams<{ id: string }>();
  const router = useRouter();

  const { applications, fetchApplications } = useApplications();
  const { resumes } = useResume();
  const { letter, setLetter, loading, error, generate, save, fetchSaved, exportFile } = useCoverLetter();

  const [tone, setTone]       = useState<Tone>("formal");
  const [saved, setSaved]     = useState(false);
  const [jobDesc, setJobDesc] = useState("");
  const textareaRef           = useRef<HTMLTextAreaElement>(null);

  const application = applications.find((a) => a.id === applicationId);
  const resume      = resumes[0];

  useEffect(() => {
    fetchApplications({});
    if (applicationId) fetchSaved(applicationId);
  }, [applicationId, fetchApplications, fetchSaved]);

  // Auto-resize textarea
  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${el.scrollHeight}px`;
  }, [letter]);

  async function handleGenerate() {
    if (!application || !resume) return;
    setSaved(false);
    await generate(
      applicationId,
      resume.id,
      jobDesc || application.job.description || `${application.job.title} at ${application.job.company}`,
      application.job.company,
      application.job.title,
      tone,
    );
  }

  async function handleSave() {
    await save(applicationId, letter);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  }

  const candidateName = resume
    ? ((resume.parsedData as Record<string, unknown> | null)?.personal_info as Record<string, string> | null)?.name ?? "Candidate"
    : "Candidate";

  return (
    <div className="mx-auto max-w-3xl space-y-6 py-8 px-4">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => router.back()}
          className="text-gray-400 hover:text-white"
        >
          <ArrowLeft size={18} />
        </Button>
        <div>
          <h1 className="text-xl font-bold text-white">Cover Letter</h1>
          {application && (
            <p className="text-sm text-gray-400">
              {application.job.title} · {application.job.company}
            </p>
          )}
        </div>
      </div>

      {/* Controls panel */}
      <div className="rounded-xl border border-gray-700 bg-gray-800/50 p-5 space-y-4">
        {/* Tone picker */}
        <div className="space-y-2">
          <label className="text-xs font-medium text-gray-400">Tone</label>
          <div className="flex gap-2">
            {TONES.map((t) => (
              <button
                key={t.value}
                type="button"
                onClick={() => setTone(t.value)}
                className={`flex-1 rounded-lg border px-3 py-2 text-xs text-left transition-colors
                  ${tone === t.value
                    ? "border-violet-500 bg-violet-900/30 text-violet-200"
                    : "border-gray-600 bg-gray-700/50 text-gray-400 hover:border-gray-500"
                  }`}
              >
                <span className="font-medium text-white block">{t.label}</span>
                <span className="opacity-70">{t.desc}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Optional job description override */}
        <div className="space-y-1">
          <label className="text-xs font-medium text-gray-400">
            Job description <span className="opacity-50">(optional — paste full JD for better results)</span>
          </label>
          <textarea
            value={jobDesc}
            onChange={(e) => setJobDesc(e.target.value)}
            placeholder="Paste the full job description here…"
            rows={3}
            className="w-full rounded-lg border border-gray-600 bg-gray-700 px-3 py-2 text-sm text-white placeholder:text-gray-500 resize-none focus:outline-none focus:ring-1 focus:ring-violet-500"
          />
        </div>

        {/* Generate button */}
        <div className="flex gap-2">
          <Button
            onClick={handleGenerate}
            disabled={loading || !application || !resume}
            className="flex-1 bg-violet-600 hover:bg-violet-700"
          >
            {loading ? (
              <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Generating…</>
            ) : letter ? (
              <><RefreshCw className="mr-2 h-4 w-4" />Regenerate</>
            ) : (
              <><Wand2 className="mr-2 h-4 w-4" />Generate cover letter</>
            )}
          </Button>
        </div>

        {!resume && (
          <p className="text-xs text-yellow-400">Upload a resume first to generate a cover letter.</p>
        )}
        {error && (
          <div className="flex items-center gap-2 text-sm text-red-400">
            <AlertCircle size={14} /> {error}
          </div>
        )}
      </div>

      {/* Editor */}
      {letter && (
        <div className="rounded-xl border border-gray-700 bg-gray-900 p-5 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-300 flex items-center gap-2">
              <FileText size={14} />
              Cover letter draft
            </span>
            <div className="flex gap-2">
              {/* Save */}
              <Button
                size="sm"
                variant="outline"
                onClick={handleSave}
                disabled={loading}
                className="border-gray-600 text-gray-300 hover:text-white text-xs"
              >
                {saved
                  ? <><CheckCircle2 size={13} className="mr-1 text-green-400" />Saved</>
                  : <><Save size={13} className="mr-1" />Save</>
                }
              </Button>
              {/* PDF */}
              <Button
                size="sm"
                variant="outline"
                onClick={() => exportFile("pdf", letter, candidateName, application?.job.title ?? "", application?.job.company ?? "")}
                className="border-gray-600 text-gray-300 hover:text-white text-xs"
              >
                <FileDown size={13} className="mr-1" />PDF
              </Button>
              {/* DOCX */}
              <Button
                size="sm"
                variant="outline"
                onClick={() => exportFile("docx", letter, candidateName, application?.job.title ?? "", application?.job.company ?? "")}
                className="border-gray-600 text-gray-300 hover:text-white text-xs"
              >
                <FileDown size={13} className="mr-1" />DOCX
              </Button>
            </div>
          </div>

          <textarea
            ref={textareaRef}
            value={letter}
            onChange={(e) => { setLetter(e.target.value); setSaved(false); }}
            className="w-full min-h-[320px] resize-none rounded-lg bg-gray-800 border border-gray-700 px-4 py-3 text-sm text-gray-100 leading-relaxed focus:outline-none focus:ring-1 focus:ring-violet-500 font-sans"
          />
        </div>
      )}
    </div>
  );
}
