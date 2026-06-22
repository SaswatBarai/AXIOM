"use client";

import { useState } from "react";
import { Plus, Minus } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { ScrollReveal } from "@/components/ScrollReveal";

interface FAQItem {
  question: string;
  answer: string;
}

const faqs: FAQItem[] = [
  {
    question: "How accurate is the ATS score analyzer?",
    answer:
      "Our parser is trained on standard layouts used by modern ATS platforms — Workday, Greenhouse, and Lever. We check formatting compliance, keyword density, section header naming, and skill matches to produce a score that correlates strongly with real screen-pass rates.",
  },
  {
    question: "How does the Job Matching Engine recommend jobs?",
    answer:
      "We use semantic vector embeddings — not keyword matching. The engine analyzes the context of your achievements, project definitions, and past roles, then matches them against live job requirements to yield a high-precision percentage score.",
  },
  {
    question: "Is my resume data secure?",
    answer:
      "Yes. All uploaded resumes and profile data are encrypted in transit and at rest. We never sell your personal information to third-party advertisers or data brokers.",
  },
  {
    question: "Can I cancel my Pro subscription at any time?",
    answer:
      "Absolutely. Cancel from Account Settings at any time. You keep full Pro access until the end of your current billing period — no questions asked.",
  },
  {
    question: "Does AXIOM work for international job markets?",
    answer:
      "Yes. The job matching engine queries listings across major international boards. ATS scoring is calibrated against global formatting standards, though some region-specific norms may vary.",
  },
];

export function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section id="faq" className="py-24 px-6 bg-[#09090b]">
      <div className="max-w-3xl mx-auto space-y-16">

        {/* Header — left-aligned, consistent with rest of page */}
        <ScrollReveal>
          <div className="space-y-4">
            <span className="text-[10px] font-semibold text-zinc-500 uppercase tracking-[0.15em]">
              FAQ
            </span>
            <h2 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-white leading-[1.06]">
              Common questions
            </h2>
            <p className="text-base text-zinc-400 leading-relaxed max-w-lg">
              Everything you need to know before getting started with AXIOM.
            </p>
          </div>
        </ScrollReveal>

        {/* Accordion */}
        <div className="space-y-2">
          {faqs.map((faq, index) => {
            const isOpen = openIndex === index;
            return (
              <ScrollReveal key={index}>
                <div
                  className={`rounded-xl border transition-all duration-200 overflow-hidden ${
                    isOpen
                      ? "border-zinc-700/80 bg-zinc-900/30"
                      : "border-zinc-800/60 bg-zinc-900/10 hover:border-zinc-800 hover:bg-zinc-900/20"
                  }`}
                >
                  {/* Trigger */}
                  <button
                    onClick={() => setOpenIndex(isOpen ? null : index)}
                    className="w-full px-6 py-5 flex items-center justify-between text-left gap-4 group focus-visible:outline-none"
                    aria-expanded={isOpen}
                  >
                    <span
                      className={`text-sm font-semibold leading-snug transition-colors duration-200 ${
                        isOpen ? "text-white" : "text-zinc-300 group-hover:text-white"
                      }`}
                    >
                      {faq.question}
                    </span>
                    {/* +/− icon — cleaner than chevron for accordions */}
                    <span className={`shrink-0 w-5 h-5 flex items-center justify-center rounded-full border transition-all duration-200 ${
                      isOpen
                        ? "border-zinc-600 text-white bg-zinc-800"
                        : "border-zinc-700 text-zinc-500 group-hover:border-zinc-600 group-hover:text-zinc-300"
                    }`}>
                      {isOpen
                        ? <Minus className="w-3 h-3" />
                        : <Plus className="w-3 h-3" />
                      }
                    </span>
                  </button>

                  {/* Answer panel */}
                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div
                        key="content"
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
                      >
                        <p className="px-6 pb-6 pt-0 text-sm text-zinc-400 leading-relaxed border-t border-zinc-800/40 pt-4">
                          {faq.answer}
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </ScrollReveal>
            );
          })}
        </div>

        {/* Bottom CTA — surface a contact option */}
        <ScrollReveal>
          <div className="flex items-center gap-4 pt-2">
            <span className="text-sm text-zinc-500">Still have questions?</span>
            <a
              href="mailto:support@axiom.ai"
              className="text-sm font-medium text-zinc-300 hover:text-white underline underline-offset-4 decoration-zinc-700 hover:decoration-zinc-400 transition-all duration-200"
            >
              Contact support →
            </a>
          </div>
        </ScrollReveal>

      </div>
    </section>
  );
}