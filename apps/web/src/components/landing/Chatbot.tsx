"use client";

import { useState, useRef, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Send, Sparkles, User, ShieldAlert } from "lucide-react";
import { motion, AnimatePresence, useInView } from "framer-motion";
import { ScrollReveal } from "@/components/ScrollReveal";

interface Message {
  id: number;
  sender: "user" | "ai";
  text: string;
}

const containerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.18
    }
  }
};

const messageVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.45, ease: [0.16, 1, 0.3, 1] }
  }
};

const promptContainerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.06
    }
  }
};

const promptItemVariants = {
  hidden: { opacity: 0, y: 8 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] }
  }
};

export function Chatbot() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      sender: "ai",
      text: "Hello! I am your AXIOM Career Copilot. Ask me anything about matching job requirements, interview prep advice, cover letter tailoring, or resume improvements!"
    },
    {
      id: 2,
      sender: "user",
      text: "How can I highlight my Next.js and Tailwind experience on my resume for a Senior role?"
    },
    {
      id: 3,
      sender: "ai",
      text: "For a Senior role, focus on outcomes rather than just listing technologies. Mention specific metrics, e.g., 'Optimized image loading and page routing using Next.js App Router, boosting Lighthouse speed performance score by 35%.' or 'Engineered reusable utility layouts using Tailwind CSS, streamlining frontend development speed by 25%.'"
    }
  ]);
  const [inputText, setInputText] = useState("");
  const [isTyping, setIsTyping] = useState(false);

  const [coords, setCoords] = useState({ x: 0, y: 0 });
  const cardRef = useRef<HTMLDivElement>(null);
  const isCardInView = useInView(cardRef, { once: true, margin: "-80px" });

  const promptsRef = useRef<HTMLDivElement>(null);
  const isPromptsInView = useInView(promptsRef, { once: true, margin: "-80px" });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    setCoords({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    });
  };

  const handleSendMessage = (textToSend: string) => {
    if (!textToSend.trim()) return;

    const userMsg: Message = {
      id: Date.now(),
      sender: "user",
      text: textToSend
    };

    setMessages(prev => [...prev, userMsg]);
    setInputText("");
    setIsTyping(true);

    // Simulate AI response delay
    setTimeout(() => {
      const aiResponseText = `That is a great question regarding "${textToSend}". Under a production context, AXIOM analyzes target job specs to tailor standard resumes with precise alignment parameters. Try checking your Skill Gap page in the main dashboard.`;
      
      const aiMsg: Message = {
        id: Date.now() + 1,
        sender: "ai",
        text: aiResponseText
      };
      
      setMessages(prev => [...prev, aiMsg]);
      setIsTyping(false);
    }, 1500);
  };

  return (
    <section id="chatbot" className="py-24 px-6 bg-[#09090b]">
      <div className="max-w-7xl mx-auto space-y-16">
        {/* Header */}
        <ScrollReveal>
          <div className="text-center space-y-4 max-w-3xl mx-auto">
            <Badge variant="outline" className="border-zinc-800 text-zinc-400 px-3 py-1 font-medium bg-zinc-900/30">
              AI Companion
            </Badge>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-white">
              Meet your AI Career Copilot
            </h2>
            <p className="text-base sm:text-lg text-zinc-400 font-normal">
              Ask resume improvement suggestions, draft cover letters, simulate salary conversations, and check job alignment levels live.
            </p>
          </div>
        </ScrollReveal>

        {/* Chat window structure */}
        <ScrollReveal className="max-w-3xl mx-auto">
          <div
            ref={cardRef}
            onMouseMove={handleMouseMove}
            className="relative overflow-hidden group border border-zinc-850 bg-zinc-900/20 backdrop-blur-md rounded-2xl shadow-2xl flex flex-col h-[520px] transition-all duration-300 hover:border-zinc-700/50"
          >
            {/* Dynamic Cursor Spotlight Overlay */}
            <div
              className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none z-0"
              style={{
                background: `radial-gradient(350px circle at ${coords.x}px ${coords.y}px, rgba(255,255,255,0.035), transparent 80%)`
              }}
            />
            
            {/* Chat header */}
            <div className="relative z-10 border-b border-zinc-800 px-6 py-4 flex items-center justify-between bg-zinc-900/50">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-white text-black flex items-center justify-center font-bold text-sm">
                  C
                </div>
                <div>
                  <h3 className="font-semibold text-white text-sm">AXIOM Assistant</h3>
                  <p className="text-xs text-zinc-500 font-medium">Always online</p>
                </div>
              </div>
              <Badge variant="outline" className="border-zinc-800 text-zinc-400">
                GPT-4o Engine
              </Badge>
            </div>

            {/* Chat body containing scroll messages */}
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate={isCardInView ? "visible" : "hidden"}
              className="relative z-10 flex-1 overflow-y-auto p-6 space-y-4 scrollbar-thin scrollbar-thumb-zinc-800"
            >
              <AnimatePresence initial={false}>
                {messages.map(msg => (
                  <motion.div
                    key={msg.id}
                    variants={messageVariants}
                    className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[85%] rounded-2xl p-4 text-sm leading-relaxed ${
                        msg.sender === "user"
                          ? "bg-white text-black rounded-tr-none"
                          : "bg-zinc-800 text-zinc-100 rounded-tl-none border border-zinc-700/50"
                      }`}
                    >
                      <p>{msg.text}</p>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>

              {/* Typing indicator */}
              {isTyping && (
                <div className="flex justify-start pt-2">
                  <div className="flex gap-1.5 p-3 rounded-2xl bg-zinc-800 text-zinc-100 rounded-tl-none border border-zinc-700/50">
                    <span className="w-2 h-2 bg-zinc-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                    <span className="w-2 h-2 bg-zinc-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                    <span className="w-2 h-2 bg-zinc-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                  </div>
                </div>
              )}
            </motion.div>

            {/* Chat footer input bar */}
            <div className="relative z-10 border-t border-zinc-800 px-6 py-4 bg-zinc-900/30">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSendMessage(inputText);
                }}
                className="flex gap-2"
              >
                <Input
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder="Ask your career copilot a question..."
                  className="flex-1 bg-zinc-950 border-zinc-850 focus:border-zinc-800"
                />
                <Button type="submit" size="icon" className="bg-white hover:bg-zinc-200 text-black hover:scale-105 active:scale-95 transition-transform duration-200">
                  <Send className="w-4 h-4" />
                </Button>
              </form>
            </div>
          </div>
        </ScrollReveal>

        {/* Prompt suggestions layout */}
        <ScrollReveal delay={0.15} className="max-w-3xl mx-auto mt-8">
          <motion.div
            ref={promptsRef}
            variants={promptContainerVariants}
            initial="hidden"
            animate={isPromptsInView ? "visible" : "hidden"}
            className="space-y-4"
          >
            <p className="text-xs text-zinc-500 font-semibold uppercase tracking-wider text-center">Suggested prompts to try</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[
                "How do I optimize my resume ATS format?",
                "Draft a cover letter for a Principal Designer role",
                "Simulate a salary negotiation conversation",
                "How do I structure my achievements on my resume?"
              ].map((prompt, idx) => (
                <motion.div key={idx} variants={promptItemVariants}>
                  <Button
                    variant="outline"
                    onClick={() => handleSendMessage(prompt)}
                    className="w-full text-left justify-start px-4 py-5 bg-zinc-900/60 border-zinc-800 hover:bg-zinc-800/80 text-zinc-300 text-xs font-normal hover:scale-[1.01] active:scale-[0.99] transition-all duration-300"
                  >
                    {prompt}
                  </Button>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </ScrollReveal>
      </div>
    </section>
  );
}
