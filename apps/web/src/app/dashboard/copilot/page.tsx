"use client";

import { useEffect, useRef, useState } from "react";
import {
  Send, Square, Plus, Trash2, MessageSquare, Bot, User,
  AlertCircle, Sparkles, ChevronLeft, ChevronRight,
  Copy, Check, FileText, Mic, TrendingUp, Mail,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useChat } from "@/hooks/useChat";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

// ── Quick prompts ──────────────────────────────────────────────────────────
const QUICK_PROMPTS = [
  {
    icon: FileText,
    label: "Resume Review",
    desc: "How can I improve my resume summary for senior roles?",
    color: "text-brand",
    bg: "bg-brand/10 border-brand/20",
  },
  {
    icon: Mic,
    label: "Interview Prep",
    desc: "What are the most common behavioral interview questions?",
    color: "text-violet-400",
    bg: "bg-violet-400/10 border-violet-400/20",
  },
  {
    icon: Mail,
    label: "Cold Outreach",
    desc: "Help me write a cold email to a recruiter at a FAANG company.",
    color: "text-emerald-400",
    bg: "bg-emerald-400/10 border-emerald-400/20",
  },
  {
    icon: TrendingUp,
    label: "Career Growth",
    desc: "What skills should I learn to get promoted to Staff Engineer?",
    color: "text-amber-400",
    bg: "bg-amber-400/10 border-amber-400/20",
  },
] as const;

// ── Copy button ────────────────────────────────────────────────────────────
function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(text);
          setCopied(true);
          setTimeout(() => setCopied(false), 2000);
        } catch {}
      }}
      className="p-1 rounded bg-zinc-900/50 hover:bg-zinc-800 text-zinc-500 hover:text-zinc-300 transition-colors border border-zinc-800/80"
      title="Copy"
    >
      {copied
        ? <Check size={11} className="text-emerald-400" />
        : <Copy size={11} />
      }
    </button>
  );
}

// ── Inline markdown renderer ───────────────────────────────────────────────
function renderInline(text: string) {
  return text.split(/(\*\*.*?\*\*|`.*?`)/g).map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**"))
      return <strong key={i} className="font-semibold text-white">{part.slice(2, -2)}</strong>;
    if (part.startsWith("`") && part.endsWith("`"))
      return (
        <code key={i} className="bg-zinc-900/90 px-1.5 py-0.5 rounded text-[11px] font-mono text-zinc-300 border border-zinc-800">
          {part.slice(1, -1)}
        </code>
      );
    return part;
  });
}

function parseMarkdown(text: string) {
  if (!text) return null;
  return text.split(/(```[\s\S]*?```)/g).map((section, si) => {
    if (section.startsWith("```") && section.endsWith("```")) {
      const lines = section.split("\n");
      const lang = (lines[0] ?? "").replace("```", "").trim();
      const code = lines.slice(1, -1).join("\n");
      return (
        <div key={si} className="my-3 rounded-xl overflow-hidden border border-zinc-800/80 bg-zinc-950 text-[11px] font-mono shadow-lg">
          <div className="flex items-center justify-between px-4 py-2 bg-zinc-900/80 border-b border-zinc-800 text-[10px] text-zinc-400 font-semibold">
            <span>{lang.toUpperCase() || "CODE"}</span>
            <CopyButton text={code} />
          </div>
          <pre className="p-4 overflow-x-auto text-zinc-300 leading-relaxed"><code>{code}</code></pre>
        </div>
      );
    }
    return section.split("\n\n").map((para, pi) => {
      const p = para.trim();
      if (!p) return null;
      const lines = p.split("\n");
      const isList = lines.every(l => /^[\*\-]\s|^\d+\.\s/.test(l.trim()));
      if (isList) {
        return (
          <ul key={`${si}-${pi}`} className="list-disc pl-5 space-y-1.5 my-2 text-zinc-300">
            {lines.map((l, li) => (
              <li key={li} className="text-[13px] leading-relaxed">
                {renderInline(l.replace(/^[\s\*\-]+|^\d+\.\s+/, ""))}
              </li>
            ))}
          </ul>
        );
      }
      return (
        <p key={`${si}-${pi}`} className="mb-3 last:mb-0 text-zinc-300 leading-relaxed text-[13px]">
          {renderInline(p)}
        </p>
      );
    });
  });
}

// ── Typing dots ────────────────────────────────────────────────────────────
function TypingDots() {
  return (
    <span className="inline-flex items-center gap-1.5 py-1">
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className="h-1.5 w-1.5 rounded-full bg-zinc-600 animate-bounce"
          style={{ animationDelay: `${i * 0.15}s` }}
        />
      ))}
    </span>
  );
}

// ── Message bubble ─────────────────────────────────────────────────────────
function MessageBubble({ role, content, streaming }: { role: string; content: string; streaming?: boolean }) {
  const isUser = role === "user";
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, ease: "easeOut" }}
      className={cn("flex w-full py-3", isUser ? "justify-end" : "justify-start")}
    >
      <div className={cn("flex gap-3 max-w-[82%] sm:max-w-[75%]", isUser ? "flex-row-reverse" : "flex-row")}>
        {/* Avatar */}
        <div className={cn(
          "flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border text-xs transition-all mt-0.5",
          isUser
            ? "bg-brand border-brand/30 text-black"
            : "bg-zinc-900 border-zinc-800 text-zinc-400",
        )}>
          {isUser ? <User size={12} /> : <Bot size={12} className="text-zinc-300" />}
        </div>

        {/* Content */}
        {isUser ? (
          <div className="bg-zinc-900/70 border border-zinc-800/70 text-zinc-100 rounded-2xl rounded-tr-sm px-4 py-2.5 text-[13px] leading-relaxed">
            {content}
          </div>
        ) : (
          <div className="flex-1 py-0.5 space-y-1">
            {content ? parseMarkdown(content) : (streaming ? <TypingDots /> : null)}
            {streaming && content && (
              <span className="ml-0.5 inline-block h-3.5 w-[2px] bg-zinc-400 animate-pulse align-middle rounded" />
            )}
          </div>
        )}
      </div>
    </motion.div>
  );
}

// ── Session item ───────────────────────────────────────────────────────────
function SessionItem({
  session, active, onSelect, onDelete,
}: {
  session: { sessionId: string; title: string };
  active: boolean;
  onSelect: () => void;
  onDelete: () => void;
}) {
  const raw = session.title || session.sessionId;
  const isUUID = /^[0-9a-f-]{36}$/i.test(raw);
  const title = isUUID ? `Chat ${raw.slice(0, 6)}…` : raw;

  return (
    <motion.div
      initial={{ opacity: 0, x: -6 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -6 }}
      className={cn(
        "group flex items-center gap-2.5 rounded-lg px-3 py-2 cursor-pointer transition-all border text-left",
        active
          ? "bg-white/8 border-white/5 text-white font-medium"
          : "border-transparent text-zinc-500 hover:bg-white/4 hover:text-zinc-200",
      )}
      onClick={onSelect}
    >
      <MessageSquare size={12} className="shrink-0 opacity-70" />
      <span className="flex-1 truncate text-xs">{title}</span>
      <button
        type="button"
        onClick={(e) => { e.stopPropagation(); onDelete(); }}
        className="opacity-0 group-hover:opacity-100 text-zinc-600 hover:text-red-400 transition-all rounded p-0.5"
      >
        <Trash2 size={11} />
      </button>
    </motion.div>
  );
}

// ── Main page ──────────────────────────────────────────────────────────────
export default function CopilotPage() {
  const {
    messages, sessions, sessionId, loading, error,
    sendMessage, fetchSessions, loadSession, deleteSession, newSession, stopStreaming,
  } = useChat();

  const [input, setInput]           = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const bottomRef     = useRef<HTMLDivElement>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const textareaRef   = useRef<HTMLTextAreaElement>(null);

  useEffect(() => { fetchSessions(); }, [fetchSessions]);

  // Auto-scroll to bottom
  useEffect(() => {
    const el = scrollAreaRef.current;
    if (!el) return;
    const nearBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 240;
    if (nearBottom || messages.length > 0) {
      bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
    }
  }, [messages]);

  // Auto-resize textarea
  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = Math.min(el.scrollHeight, 160) + "px";
  }, [input]);

  function handleSend() {
    const text = input.trim();
    if (!text || loading) return;
    setInput("");
    if (textareaRef.current) textareaRef.current.style.height = "auto";
    sendMessage(text);
  }

  function handleKey(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  const isEmpty = messages.length === 0;

  return (
    // KEY FIX: h-full (not min-h-screen) keeps this within main's bounds
    // so main never scrolls and the input stays pinned at the bottom.
    <div className="relative flex h-full w-full overflow-hidden bg-bg-base">

      {/* Ambient glow orbs */}
      <div className="pointer-events-none absolute -top-40 -left-20 h-[500px] w-[500px] rounded-full bg-brand/[0.04] blur-[120px]" />
      <div className="pointer-events-none absolute bottom-0 right-0 h-[400px] w-[400px] rounded-full bg-violet-500/[0.03] blur-[100px]" />

      {/* ── Sidebar ─────────────────────────────────────────────────────── */}
      <AnimatePresence initial={false}>
        {sidebarOpen && (
          <motion.aside
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 248, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            transition={{ duration: 0.22, ease: "easeInOut" }}
            className="relative z-10 hidden md:flex flex-col border-r border-zinc-800/60 bg-zinc-950/30 backdrop-blur-sm shrink-0 overflow-hidden"
          >
            <div className="flex flex-col h-full w-[248px] p-4 min-h-0">
              {/* Sidebar header */}
              <div className="flex items-center gap-2 px-1 pb-2 mb-1 border-b border-zinc-800/60 shrink-0">
                <div className="w-6 h-6 rounded-lg bg-brand/10 border border-brand/20 flex items-center justify-center shrink-0">
                  <Sparkles size={11} className="text-brand" />
                </div>
                <span className="text-xs font-semibold text-zinc-400">Copilot History</span>
              </div>

              <Button
                size="sm"
                className="w-full justify-start gap-2 bg-brand/10 hover:bg-brand/20 border border-brand/20 text-brand text-xs font-semibold transition-all shrink-0 mb-2"
                onClick={newSession}
              >
                <Plus size={12} /> New Chat
              </Button>

              {/* Session list — flex-1 min-h-0 so it fills remaining space and scrolls */}
              <div className="flex flex-col flex-1 min-h-0">
                <p className="text-[9px] font-bold text-zinc-600 uppercase tracking-widest px-2 py-1.5 select-none shrink-0">
                  Recent
                </p>
                <div className="flex-1 min-h-0 overflow-y-auto space-y-0.5 scrollbar-thin scrollbar-thumb-zinc-800 scrollbar-track-transparent">
                  {sessions.length === 0 && (
                    <p className="text-xs text-zinc-700 px-3 py-3">No sessions yet</p>
                  )}
                  <AnimatePresence>
                    {sessions.map((s) => (
                      <SessionItem
                        key={s.sessionId}
                        session={s}
                        active={s.sessionId === sessionId}
                        onSelect={() => loadSession(s.sessionId)}
                        onDelete={() => deleteSession(s.sessionId)}
                      />
                    ))}
                  </AnimatePresence>
                </div>
              </div>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* ── Main chat area ───────────────────────────────────────────────── */}
      <div className="relative z-10 flex flex-1 flex-col overflow-hidden min-w-0">

        {/* Header */}
        <header className="flex shrink-0 items-center justify-between border-b border-zinc-800/60 px-5 py-3.5 bg-zinc-950/30 backdrop-blur-sm">
          <div className="flex items-center gap-3">
            {/* Sidebar toggle */}
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="hidden md:flex items-center justify-center h-7 w-7 rounded-lg border border-zinc-800 bg-zinc-900/50 hover:bg-zinc-800 text-zinc-500 hover:text-white transition-colors"
              title={sidebarOpen ? "Hide history" : "Show history"}
            >
              {sidebarOpen ? <ChevronLeft size={14} /> : <ChevronRight size={14} />}
            </button>

            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-brand/10 border border-brand/20 shrink-0">
                <Sparkles size={14} className="text-brand" />
              </div>
              <div>
                <h1 className="text-sm font-semibold text-white leading-none flex items-center gap-1.5">
                  AXIOM Copilot
                  <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-zinc-900 border border-zinc-800 text-zinc-500 tracking-wider">
                    AI
                  </span>
                </h1>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  <p className="text-[10px] text-zinc-500">Always on · Your career advisor</p>
                </div>
              </div>
            </div>
          </div>

          {/* Mobile new chat */}
          <Button
            size="sm"
            className="md:hidden bg-brand/10 border border-brand/20 text-brand hover:bg-brand/20 gap-1.5 text-xs"
            onClick={newSession}
          >
            <Plus size={12} /> New
          </Button>
        </header>

        {/* ── Messages ──────────────────────────────────────────────────── */}
        <div
          ref={scrollAreaRef}
          className="flex-1 min-h-0 overflow-y-auto px-5 md:px-8 py-6 scrollbar-thin scrollbar-thumb-zinc-800 scrollbar-track-transparent"
        >
          {isEmpty ? (
            /* Empty state */
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35 }}
              className="flex h-full flex-col items-center justify-center gap-8 max-w-2xl mx-auto pb-6"
            >
              {/* Icon */}
              <div className="relative">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-brand/10 border border-brand/20 shadow-[0_0_24px_rgba(249,115,22,0.15)]">
                  <Sparkles size={22} className="text-brand" />
                </div>
                <span className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-emerald-400 border-2 border-bg-base" />
              </div>

              {/* Copy */}
              <div className="text-center space-y-2">
                <h2 className="text-xl font-bold text-white tracking-tight">
                  What are we working on?
                </h2>
                <p className="text-sm text-zinc-500 max-w-sm leading-relaxed">
                  Resume feedback, interview prep, salary negotiation, outreach drafts — ask me anything about your career.
                </p>
              </div>

              {/* Quick prompts */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full">
                {QUICK_PROMPTS.map(({ icon: Icon, label, desc, color, bg }) => (
                  <button
                    key={label}
                    type="button"
                    onClick={() => sendMessage(desc)}
                    className="group flex items-start gap-3.5 rounded-xl border border-zinc-800/70 bg-zinc-900/20 hover:bg-zinc-900/40 hover:border-zinc-700 p-4 text-left transition-all duration-200 hover:scale-[1.01]"
                  >
                    <div className={cn("w-7 h-7 rounded-lg border flex items-center justify-center shrink-0 mt-0.5", bg)}>
                      <Icon size={13} className={color} />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-white mb-0.5">{label}</p>
                      <p className="text-[11px] text-zinc-500 leading-snug">{desc}</p>
                    </div>
                  </button>
                ))}
              </div>
            </motion.div>
          ) : (
            /* Message list */
            <div className="max-w-3xl mx-auto divide-y divide-zinc-900/50 w-full">
              {messages.map((m, i) => (
                <MessageBubble key={i} role={m.role} content={m.content} streaming={m.streaming} />
              ))}
            </div>
          )}

          {/* Error */}
          {error && (
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex items-center gap-3 rounded-xl border border-red-900/50 bg-red-950/20 px-4 py-3 text-xs text-red-400 max-w-3xl mx-auto mt-4"
            >
              <AlertCircle size={13} className="shrink-0" />
              <span>{error}</span>
            </motion.div>
          )}

          <div ref={bottomRef} />
        </div>

        {/* ── Input area — always at the bottom ─────────────────────────── */}
        <div className="shrink-0 px-5 md:px-8 pb-5 pt-3 bg-gradient-to-t from-bg-base via-bg-base/95 to-transparent">
          <div className="max-w-3xl mx-auto">

            {/* Input container */}
            <div className="flex items-end gap-2 bg-zinc-900/50 border border-zinc-800/80 rounded-2xl px-4 py-3 shadow-xl backdrop-blur-sm focus-within:border-zinc-700 focus-within:shadow-[0_0_0_1px_rgba(249,115,22,0.08)] transition-all duration-200">
              <textarea
                ref={textareaRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKey}
                placeholder="Message AXIOM Copilot… (Shift+Enter for new line)"
                disabled={loading}
                rows={1}
                className="flex-1 resize-none bg-transparent border-none text-white text-sm placeholder:text-zinc-600 focus:outline-none py-0.5 leading-relaxed scrollbar-none disabled:opacity-50"
                style={{ maxHeight: "160px", overflowY: "auto" }}
              />

              {loading ? (
                <button
                  onClick={stopStreaming}
                  className="flex items-center justify-center h-8 w-8 shrink-0 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-red-400 transition-colors"
                  title="Stop generation"
                >
                  <Square size={11} fill="currentColor" />
                </button>
              ) : (
                <button
                  onClick={handleSend}
                  disabled={!input.trim()}
                  className="flex items-center justify-center h-8 w-8 shrink-0 rounded-xl bg-brand hover:bg-brand-hover text-black transition-all duration-150 disabled:opacity-30 disabled:cursor-not-allowed shadow-[0_0_16px_rgba(249,115,22,0.2)] hover:shadow-[0_0_20px_rgba(249,115,22,0.35)]"
                  title="Send (Enter)"
                >
                  <Send size={12} />
                </button>
              )}
            </div>

            {/* Footer hint */}
            <p className="text-center text-[10px] text-zinc-700 mt-2.5 select-none">
              AXIOM reads your resume & job matches for context · Enter to send · Shift+Enter for new line
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}
