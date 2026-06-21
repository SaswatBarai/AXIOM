"use client";

import { useEffect, useRef, useState } from "react";
import {
  Send, Square, Plus, Trash2, MessageSquare, Bot, User, AlertCircle, Sparkles, Terminal,
  ChevronLeft, ChevronRight, Copy, Check, Info
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useChat } from "@/hooks/useChat";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

const QUICK_PROMPTS = [
  { text: "How can I improve my resume summary?", icon: "📝", desc: "Optimize your bio" },
  { text: "What are common interview questions for my target role?", icon: "💡", desc: "Practice prep" },
  { text: "Help me write a cold email to a recruiter", icon: "✉️", desc: "Outreach template" },
  { text: "What skills should I learn to get promoted?", icon: "🚀", desc: "Career scaling" },
];

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy", err);
    }
  };

  return (
    <button
      onClick={handleCopy}
      className="p-1 rounded bg-zinc-900/50 hover:bg-zinc-800 text-zinc-500 hover:text-zinc-350 transition-colors border border-zinc-800/80"
      title="Copy to clipboard"
    >
      {copied ? <Check size={11} className="text-emerald-400" /> : <Copy size={11} />}
    </button>
  );
}

// Helper to parse simple markdown syntax into React elements
function parseMarkdown(text: string) {
  if (!text) return null;

  // Split content by code blocks first
  const sections = text.split(/(```[\s\S]*?```)/g);

  return sections.map((section, sIdx) => {
    if (section.startsWith("```") && section.endsWith("```")) {
      const lines = section.split("\n");
      const codeLines = lines.slice(1, -1);
      const language = lines[0] ? lines[0].replace("```", "").trim() : "";
      const codeText = codeLines.join("\n");
      return (
        <div key={sIdx} className="my-4 rounded-xl overflow-hidden border border-zinc-800/80 bg-zinc-950 font-mono text-[11px] leading-relaxed shadow-lg">
          <div className="flex items-center justify-between px-4 py-2 bg-zinc-900/80 border-b border-zinc-850 text-[10px] text-zinc-400 font-semibold select-none">
            <span>{language ? language.toUpperCase() : "CODE"}</span>
            <CopyButton text={codeText} />
          </div>
          <pre className="p-4 overflow-x-auto text-zinc-300">
            <code>{codeText}</code>
          </pre>
        </div>
      );
    }

    // Split by double newlines for paragraphs
    const paragraphs = section.split("\n\n");
    return paragraphs.map((para, pIdx) => {
      const trimmedPara = para.trim();
      if (!trimmedPara) return null;

      // Handle Bullet Lists
      const lines = trimmedPara.split("\n");
      const isBulletList = lines.every(line => line.trim().startsWith("* ") || line.trim().startsWith("- ") || line.trim().match(/^\d+\.\s/));
      
      if (isBulletList) {
        return (
          <ul key={`${sIdx}-${pIdx}`} className="list-disc pl-5 space-y-2 my-3 text-zinc-200">
            {lines.map((line, lIdx) => {
              const cleanLine = line.replace(/^[\s*-]+|^\d+\.\s+/, "");
              return (
                <li key={lIdx} className="text-zinc-300 leading-relaxed text-[13px]">
                  {renderInlineMarkdown(cleanLine)}
                </li>
              );
            })}
          </ul>
        );
      }

      // Handle Headings (e.g. **Heading**) or standalone lines
      return (
        <p key={`${sIdx}-${pIdx}`} className="mb-3.5 last:mb-0 text-zinc-300 leading-relaxed text-[13px] font-sans">
          {renderInlineMarkdown(trimmedPara)}
        </p>
      );
    });
  });
}

function renderInlineMarkdown(text: string) {
  // Matches **bold** and `code`
  const parts = text.split(/(\*\*.*?\*\*|`.*?`)/g);
  return parts.map((part, index) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return (
        <strong key={index} className="font-semibold text-white tracking-wide">
          {part.slice(2, -2)}
        </strong>
      );
    }
    if (part.startsWith("`") && part.endsWith("`")) {
      return (
        <code key={index} className="bg-zinc-900/90 px-1.5 py-0.5 rounded text-[11px] font-mono text-zinc-350 border border-zinc-800">
          {part.slice(1, -1)}
        </code>
      );
    }
    return part;
  });
}

function TypingDots() {
  return (
    <span className="inline-flex items-center gap-1.5 py-1">
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className="h-1.5 w-1.5 rounded-full bg-zinc-650 animate-bounce"
          style={{ animationDelay: `${i * 0.15}s` }}
        />
      ))}
    </span>
  );
}

function MessageBubble({ role, content, streaming }: { role: string; content: string; streaming?: boolean }) {
  const isUser = role === "user";
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className={cn("flex w-full py-4", isUser ? "justify-end" : "justify-start")}
    >
      <div className={cn("flex gap-4 max-w-[85%] sm:max-w-[78%]", isUser ? "flex-row-reverse" : "flex-row")}>
        {/* Avatar */}
        <div className={cn(
          "flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border text-xs shadow-xs transition-all",
          isUser
            ? "bg-white border-zinc-200 text-zinc-950 font-bold"
            : "bg-zinc-900 border-zinc-850 text-zinc-400",
        )}>
          {isUser ? <User size={12} /> : <Bot size={12} className="text-zinc-300" />}
        </div>
        
        {/* Bubble content */}
        <div className={cn(
          "transition-all leading-relaxed",
          isUser
            ? "bg-zinc-900/60 backdrop-blur-sm text-zinc-100 rounded-xl rounded-tr-none border border-zinc-800/80 px-4 py-3 text-[13px] shadow-sm"
            : "text-zinc-200 text-[13.5px] border-l-2 border-zinc-800 pl-4 py-0.5 space-y-2", // Frameless design for AI assistant responses
        )}>
          {content ? parseMarkdown(content) : (streaming ? <TypingDots /> : null)}
          {streaming && content && (
            <span className="ml-1 inline-block h-3.5 w-1 bg-zinc-450 animate-pulse align-middle" />
          )}
        </div>
      </div>
    </motion.div>
  );
}

function SessionItem({
  session,
  active,
  onSelect,
  onDelete,
}: {
  session: { sessionId: string; title: string };
  active: boolean;
  onSelect: () => void;
  onDelete: () => void;
}) {
  const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(session.title || session.sessionId);
  const formattedTitle = session.title 
    ? (isUUID ? `Chat Session ${session.title.slice(0, 6)}` : session.title)
    : `Chat Session ${session.sessionId.slice(0, 6)}`;

  return (
    <motion.div
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -8 }}
      className={cn(
        "group flex items-center gap-2.5 rounded-lg px-3 py-2 cursor-pointer transition-all border text-left",
        active
          ? "bg-white/10 border-white/5 text-white shadow-sm font-medium"
          : "border-transparent text-zinc-450 hover:bg-white/5 hover:text-zinc-200",
      )}
      onClick={onSelect}
    >
      <MessageSquare size={13} className="shrink-0 opacity-80" />
      <span className="flex-1 truncate text-xs">{formattedTitle}</span>
      <button
        type="button"
        onClick={(e) => { e.stopPropagation(); onDelete(); }}
        className="opacity-0 group-hover:opacity-100 text-zinc-500 hover:text-red-400 transition-all rounded p-0.5 hover:bg-white/5"
      >
        <Trash2 size={12} />
      </button>
    </motion.div>
  );
}

export default function CopilotPage() {
  const {
    messages, sessions, sessionId, loading, error,
    sendMessage, fetchSessions, loadSession, deleteSession, newSession, stopStreaming,
  } = useChat();

  const [input, setInput] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const bottomRef = useRef<HTMLDivElement>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  useEffect(() => { fetchSessions(); }, [fetchSessions]);

  // Auto-scroll logic
  useEffect(() => {
    const el = scrollAreaRef.current;
    if (!el) return;
    const nearBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 240;
    if (nearBottom || messages.length > 0) {
      bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
    }
  }, [messages]);

  function handleSend() {
    const text = input.trim();
    if (!text) return;
    setInput("");
    sendMessage(text);
  }

  function handleKey(e: React.KeyboardEvent) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  const isEmpty = messages.length === 0;

  return (
    <div className="relative flex h-full min-h-[calc(100vh)] w-full overflow-hidden bg-bg-base bg-grid-dots">
      {/* Background Glow Orbs */}
      <div className="ambient-glow-orb w-[600px] h-[600px] -top-40 -left-20 animate-float-1" />
      <div className="ambient-glow-orb w-[500px] h-[500px] bottom-5 right-5 animate-float-2" />

      {/* ── Sidebar (History) ── */}
      <AnimatePresence initial={false}>
        {sidebarOpen && (
          <motion.aside
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 256, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
            className="relative z-10 hidden md:flex flex-col border-r border-zinc-850/80 bg-zinc-950/20 backdrop-blur-md p-4 gap-4 overflow-hidden shrink-0"
          >
            <div className="w-[223px]"> {/* Fixed width inner wrapper to prevent text squishing on slide */}
              <Button
                variant="outline"
                size="sm"
                className="w-full justify-start gap-2 border-zinc-850 hover:border-zinc-700 bg-zinc-900/30 text-zinc-355 hover:text-white transition-all shadow-xs"
                onClick={newSession}
              >
                <Plus size={13} /> New Session
              </Button>
              
              <div className="flex-1 overflow-y-auto space-y-1 pr-1 mt-4 scrollbar-thin scrollbar-thumb-zinc-800 scrollbar-track-transparent max-h-[75vh]">
                <div className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest px-2 mb-2 select-none">History</div>
                {sessions.length === 0 && (
                  <p className="text-xs text-zinc-650 px-2 py-4">No sessions yet</p>
                )}
                {sessions.map((s) => (
                  <SessionItem
                    key={s.sessionId}
                    session={s}
                    active={s.sessionId === sessionId}
                    onSelect={() => loadSession(s.sessionId)}
                    onDelete={() => deleteSession(s.sessionId)}
                  />
                ))}
              </div>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* ── Main Chat Container ── */}
      <div className="relative z-10 flex flex-1 flex-col overflow-hidden bg-zinc-950/5 backdrop-blur-xs">
        {/* Header */}
        <header className="flex items-center justify-between border-b border-zinc-850/70 px-6 py-4 bg-zinc-950/20 backdrop-blur-md">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="hidden md:flex items-center justify-center h-8 w-8 rounded-lg border border-zinc-800 bg-zinc-900/50 hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors"
              title={sidebarOpen ? "Hide History" : "Show History"}
            >
              {sidebarOpen ? <ChevronLeft size={16} /> : <ChevronRight size={16} />}
            </button>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-zinc-800 bg-zinc-900 shadow-sm shrink-0">
              <Bot size={15} className="text-zinc-300" />
            </div>
            <div>
              <h1 className="text-sm font-semibold text-white tracking-tight flex items-center gap-1.5">
                AXIOM Copilot
                <span className="text-[9px] font-semibold px-1.5 py-0.5 rounded-full bg-zinc-900 border border-zinc-850 text-zinc-450 tracking-wider">AI</span>
              </h1>
              <p className="text-[11px] text-zinc-550">Your smart interactive career advisor</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              className="border-zinc-850 text-zinc-400 hover:text-white bg-zinc-900/20 md:hidden"
              onClick={newSession}
            >
              <Plus size={13} />
            </Button>
          </div>
        </header>

        {/* Message Panel */}
        <div 
          ref={scrollAreaRef} 
          className="flex-1 overflow-y-auto px-6 py-8 space-y-4 scrollbar-thin scrollbar-thumb-zinc-800 scrollbar-track-transparent"
        >
          {isEmpty ? (
            <motion.div 
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="flex h-full flex-col items-center justify-center gap-6 text-center max-w-2xl mx-auto py-12"
            >
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-zinc-900 border border-zinc-800 shadow-lg">
                <Sparkles size={18} className="text-white" />
              </div>
              <div className="space-y-2">
                <h2 className="text-lg font-semibold text-white tracking-tight">How can I help you, Career Builder?</h2>
                <p className="text-xs text-zinc-450 max-w-sm mx-auto leading-relaxed">
                  Tailor your job application resources, test your technical skills, or design a target career roadmap.
                </p>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full mt-4">
                {QUICK_PROMPTS.map((p) => (
                  <button
                    key={p.text}
                    type="button"
                    onClick={() => sendMessage(p.text)}
                    className="group flex flex-col gap-1 items-start rounded-xl border border-zinc-850 bg-zinc-900/10 hover:bg-zinc-900/40 hover:border-zinc-700 p-4 text-left transition-all hover:scale-[1.01]"
                  >
                    <div className="flex items-center gap-2 text-xs font-semibold text-white">
                      <span>{p.icon}</span>
                      <span>{p.text.split(" ").slice(0, 3).join(" ")}...</span>
                    </div>
                    <span className="text-[10px] text-zinc-500 font-medium leading-normal">{p.desc}</span>
                  </button>
                ))}
              </div>
            </motion.div>
          ) : (
            <div className="max-w-3xl mx-auto divide-y divide-zinc-900/60 w-full">
              {messages.map((m, i) => (
                <MessageBubble key={i} role={m.role} content={m.content} streaming={m.streaming} />
              ))}
            </div>
          )}

          {error && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex items-center gap-3 rounded-xl border border-red-900/50 bg-red-950/20 px-4 py-3 text-xs text-red-400 max-w-3xl mx-auto"
            >
              <AlertCircle size={14} className="shrink-0" />
              <span>{error}</span>
            </motion.div>
          )}
          <div ref={bottomRef} />
        </div>

        {/* Floating Input Controls */}
        <div className="relative z-10 px-6 pb-6 pt-2 bg-gradient-to-t from-bg-base via-bg-base/90 to-transparent">
          <div className="max-w-3xl mx-auto">
            <div className="flex gap-2 items-center bg-zinc-900/45 border border-zinc-850 rounded-2xl p-2 shadow-xl backdrop-blur-md focus-within:border-zinc-750 focus-within:shadow-[0_0_20px_rgba(255,255,255,0.02)] transition-all">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKey}
                placeholder="Message AXIOM Copilot…"
                disabled={loading}
                className="flex-1 bg-transparent border-none text-white text-xs placeholder:text-zinc-550 focus-visible:ring-0 focus-visible:ring-offset-0 focus:outline-hidden py-2 px-3"
              />
              {loading ? (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={stopStreaming}
                  className="h-8 w-8 shrink-0 hover:bg-zinc-800 rounded-xl text-zinc-400 hover:text-red-450 transition-colors"
                  title="Stop generation"
                >
                  <Square size={12} fill="currentColor" />
                </Button>
              ) : (
                <Button
                  size="icon"
                  onClick={handleSend}
                  disabled={!input.trim()}
                  className="h-8 w-8 shrink-0 bg-white hover:bg-zinc-150 text-zinc-950 transition-all rounded-xl disabled:opacity-40 disabled:hover:bg-white"
                >
                  <Send size={12} />
                </Button>
              )}
            </div>
            
            <div className="mt-3 flex items-center justify-between text-[9px] text-zinc-600 px-2 select-none">
              <div className="flex items-center gap-1">
                <Terminal size={10} />
                <span>Reads from your resume & job matches context.</span>
              </div>
              <div className="hidden sm:flex items-center gap-1">
                <Info size={10} />
                <span>Shadcn theme active</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
