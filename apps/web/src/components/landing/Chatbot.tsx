"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Send, ArrowRight, Sparkles } from "lucide-react";
import { motion, AnimatePresence, useInView } from "framer-motion";
import { ScrollReveal } from "@/components/ScrollReveal";

interface Message {
  id: number;
  sender: "user" | "ai";
  text: string;
}

const INITIAL_MESSAGES: Message[] = [
  {
    id: 1,
    sender: "ai",
    text: "Hi! Ask me anything — resume improvements, cover letter drafts, salary negotiation tactics, or interview prep.",
  },
  {
    id: 2,
    sender: "user",
    text: "How do I highlight my Next.js experience for a Senior role?",
  },
  {
    id: 3,
    sender: "ai",
    text: "Lead with outcomes, not tools. Instead of 'Used Next.js', write: 'Migrated to Next.js App Router, improving Lighthouse performance score by 35% and reducing TTFB by 200ms.' Metrics make seniority legible to both ATS and hiring managers.",
  },
];

const SUGGESTED_PROMPTS = [
  "How do I pass an ATS screen for a PM role?",
  "Draft a cover letter for a Principal Designer role",
  "Simulate a salary negotiation conversation",
  "How do I structure achievements on my resume?",
];

export function Chatbot() {
  const [messages, setMessages] = useState<Message[]>(INITIAL_MESSAGES);
  const [inputText, setInputText] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const sectionRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(sectionRef, { once: true, margin: "-80px" });

  // Auto-scroll to bottom on new message
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const handleSend = (text: string) => {
    if (!text.trim()) return;

    setMessages((prev) => [...prev, { id: Date.now(), sender: "user", text }]);
    setInputText("");
    setIsTyping(true);

    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          sender: "ai",
          text: `Great question. In a production environment, AXIOM cross-references your resume against target job specs and surfaces precise alignment gaps. Try the Skill Gap page in your dashboard for a full breakdown.`,
        },
      ]);
      setIsTyping(false);
      inputRef.current?.focus();
    }, 1400);
  };

  return (
    <section id="chatbot" className="py-24 px-6 bg-bg-base">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-12 lg:gap-16 items-start">

          {/* Left: static copy — 2 cols */}
          <div className="lg:col-span-2 lg:sticky lg:top-28 space-y-6">
            <ScrollReveal>
              <div className="space-y-5">
                <span className="text-[10px] font-semibold text-zinc-500 uppercase tracking-[0.15em]">
                  AI Companion
                </span>
                <h2 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-white leading-[1.06]">
                  Your career<br />copilot,<br />always on
                </h2>
                <p className="text-sm text-zinc-400 leading-relaxed max-w-xs">
                  Draft cover letters, negotiate salary, prep for interviews, and fix your resume — all through a single chat interface powered by GPT-4o.
                </p>
              </div>
            </ScrollReveal>

            {/* Suggested prompts — now in the left column */}
            <ScrollReveal delay={0.1}>
              <div className="space-y-3 pt-2">
                <p className="text-[10px] font-semibold text-zinc-600 uppercase tracking-[0.12em]">
                  Try asking
                </p>
                <div className="flex flex-col gap-2">
                  {SUGGESTED_PROMPTS.map((prompt, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleSend(prompt)}
                      className="group flex items-center justify-between gap-3 text-left px-4 py-3 rounded-xl border border-zinc-800/60 bg-zinc-900/20 hover:border-zinc-700 hover:bg-zinc-900/40 text-xs text-zinc-400 hover:text-zinc-200 transition-all duration-200"
                    >
                      <span className="leading-snug">{prompt}</span>
                      <ArrowRight className="w-3 h-3 shrink-0 text-zinc-700 group-hover:text-zinc-400 group-hover:translate-x-0.5 transition-all duration-200" />
                    </button>
                  ))}
                </div>
              </div>
            </ScrollReveal>
          </div>

          {/* Right: chat window — 3 cols */}
          <div ref={sectionRef} className="lg:col-span-3">
            <ScrollReveal>
              <div className="border border-zinc-800/70 bg-zinc-900/10 rounded-2xl overflow-hidden flex flex-col h-[560px] shadow-2xl">

                {/* Chat header */}
                <div className="border-b border-zinc-900 px-5 py-4 flex items-center justify-between bg-zinc-950/60 shrink-0">
                  <div className="flex items-center gap-3">
                    <div className="w-7 h-7 rounded-md bg-white flex items-center justify-center">
                      <svg width="14" height="14" viewBox="0 0 32 32" fill="none">
                        <path d="M10 23L16 9L22 23" stroke="#09090b" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                        <line x1="12.5" y1="18.5" x2="19.5" y2="18.5" stroke="#09090b" strokeWidth="3" strokeLinecap="round" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-xs font-bold text-white leading-none">AXIOM Copilot</p>
                      <p className="text-[10px] text-zinc-600 mt-0.5">AXIOM AI · Always online</p>
                    </div>
                  </div>
                  {/* Live indicator */}
                  <div className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    <span className="text-[10px] text-zinc-500 font-medium">Live</span>
                  </div>
                </div>

                {/* Messages */}
                <motion.div
                  ref={scrollRef}
                  initial="hidden"
                  animate={isInView ? "visible" : "hidden"}
                  variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.15 } } }}
                  className="flex-1 overflow-y-auto px-5 py-5 space-y-4 scroll-smooth"
                  style={{ scrollbarWidth: "none" }}
                >
                  <AnimatePresence initial={false}>
                    {messages.map((msg) => (
                      <motion.div
                        key={msg.id}
                        variants={{
                          hidden: { opacity: 0, y: 8 },
                          visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] } },
                        }}
                        className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
                      >
                        {/* AI avatar dot */}
                        {msg.sender === "ai" && (
                          <div className="w-5 h-5 rounded-full bg-zinc-800 border border-zinc-700 shrink-0 mr-2 mt-1 flex items-center justify-center">
                            <svg width="8" height="8" viewBox="0 0 32 32" fill="none">
                              <path d="M10 23L16 9L22 23" stroke="white" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />
                              <line x1="12.5" y1="18.5" x2="19.5" y2="18.5" stroke="white" strokeWidth="3.5" strokeLinecap="round" />
                            </svg>
                          </div>
                        )}
                        <div
                          className={`max-w-[82%] rounded-2xl px-4 py-3 text-xs leading-relaxed ${
                            msg.sender === "user"
                              ? "bg-white text-black rounded-tr-sm font-medium"
                              : "bg-zinc-900/80 text-zinc-200 rounded-tl-sm border border-zinc-800/60"
                          }`}
                        >
                          {msg.text}
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>

                  {/* Typing indicator */}
                  <AnimatePresence>
                    {isTyping && (
                      <motion.div
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 4 }}
                        transition={{ duration: 0.2 }}
                        className="flex justify-start items-end gap-2"
                      >
                        <div className="w-5 h-5 rounded-full bg-zinc-800 border border-zinc-700 shrink-0 flex items-center justify-center">
                          <svg width="8" height="8" viewBox="0 0 32 32" fill="none">
                            <path d="M10 23L16 9L22 23" stroke="white" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />
                            <line x1="12.5" y1="18.5" x2="19.5" y2="18.5" stroke="white" strokeWidth="3.5" strokeLinecap="round" />
                          </svg>
                        </div>
                        <div className="bg-zinc-900/80 border border-zinc-800/60 rounded-2xl rounded-tl-sm px-4 py-3 flex gap-1.5 items-center">
                          {[0, 150, 300].map((delay) => (
                            <span
                              key={delay}
                              className="w-1.5 h-1.5 bg-zinc-500 rounded-full animate-bounce"
                              style={{ animationDelay: `${delay}ms` }}
                            />
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>

                {/* Input bar */}
                <div className="border-t border-zinc-900 px-4 py-3.5 bg-zinc-950/40 shrink-0">
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      handleSend(inputText);
                    }}
                    className="flex gap-2.5"
                  >
                    <Input
                      ref={inputRef}
                      value={inputText}
                      onChange={(e) => setInputText(e.target.value)}
                      placeholder="Ask your copilot anything..."
                      className="flex-1 bg-zinc-900/60 border-zinc-800 text-sm h-9 text-zinc-200 placeholder:text-zinc-600 focus:border-zinc-700 focus:bg-zinc-900"
                      disabled={isTyping}
                      aria-label="Message input"
                    />
                    <Button
                      type="submit"
                      size="icon"
                      disabled={isTyping || !inputText.trim()}
                      className="bg-brand hover:bg-brand-hover text-black h-9 w-9 shrink-0 disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-150 hover:scale-[1.04] active:scale-95"
                      aria-label="Send message"
                    >
                      <Send className="w-3.5 h-3.5" />
                    </Button>
                  </form>
                </div>

              </div>
            </ScrollReveal>
          </div>

        </div>

        {/* Conversion CTA — after the demo interaction */}
        <ScrollReveal>
          <div className="mt-14 flex flex-col sm:flex-row items-center justify-between gap-6 p-6 sm:p-8 rounded-2xl border border-zinc-800/60 bg-zinc-900/20">
            <div className="text-center sm:text-left space-y-1">
              <div className="flex items-center justify-center sm:justify-start gap-2 mb-1.5">
                <Sparkles className="w-3.5 h-3.5 text-brand" />
                <span className="text-[10px] font-semibold text-brand uppercase tracking-widest">Full access in your dashboard</span>
              </div>
              <h3 className="text-lg font-bold text-white">Ready to try the full copilot?</h3>
              <p className="text-sm text-zinc-400">Ask anything. Get real answers. Land more interviews.</p>
            </div>
            <Link href="/signup" className="shrink-0 w-full sm:w-auto">
              <Button className="w-full bg-brand hover:bg-brand-hover text-black font-semibold h-11 px-7 text-sm flex items-center justify-center gap-2 group shadow-[0_0_24px_rgba(249,115,22,0.2)] hover:shadow-[0_0_32px_rgba(249,115,22,0.35)] transition-all duration-200">
                Start free — no credit card
                <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </Button>
            </Link>
          </div>
        </ScrollReveal>

      </div>
    </section>
  );
}