"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { ScrollReveal } from "@/components/ScrollReveal";

interface FAQItem {
  question: string;
  answer: string;
}

const faqs: FAQItem[] = [
  {
    question: "How accurate is the ATS score analyzer?",
    answer: "Our parser is trained on standard layouts and matching parameters used by modern applicant tracking systems (such as Workday, Greenhouse, and Lever). We check formatting elements, keyword density, section header naming, and skill matches to provide a scoring assessment that correlates heavily with screen success rates."
  },
  {
    question: "How does the Job Matching Engine recommend jobs?",
    answer: "Instead of simplistic exact keyword checks, our matching engine employs semantic vector embeddings. It analyzes the context of your achievements, project definitions, and past roles, matching them against scraped requirements and responsibilities of thousands of real-time listings to yield a high-precision percentage score."
  },
  {
    question: "Is my personal data/resume data secure?",
    answer: "Absolutely. AXIOM prioritizes user privacy. All uploaded resumes and profile information are encrypted in transit and at rest. We never sell your personal data or profile information to third-party advertisers."
  },
  {
    question: "Can I cancel my Pro subscription at any time?",
    answer: "Yes, you can cancel your subscription from your Account settings at any time. Once canceled, you will still retain access to all Pro features until the end of your current billing cycle."
  }
];

const fadeInUp = {
  hidden: { opacity: 0, y: 8 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.45, ease: [0.16, 1, 0.3, 1] } }
};

const staggerContainer = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.04
    }
  }
};

export function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section id="faq" className="py-24 px-6 bg-[#09090b]">
      <div className="max-w-4xl mx-auto space-y-16">
        
        {/* Header */}
        <ScrollReveal>
          <div className="text-center space-y-4 max-w-3xl mx-auto">
            <Badge variant="outline" className="border-zinc-800 text-zinc-400 px-3 py-1 font-medium bg-zinc-900/30">
              FAQ
            </Badge>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-white leading-tight">
              Frequently Asked Questions
            </h2>
            <p className="text-base text-zinc-400 font-normal">
              Have questions? We have compiled answers to help you navigate AXIOM.
            </p>
          </div>
        </ScrollReveal>

        {/* Collapsible Accordion Grid */}
        <div className="space-y-4">
          {faqs.map((faq, index) => {
            const isOpen = openIndex === index;
            return (
              <ScrollReveal
                key={index}
                className="border border-zinc-800 rounded-2xl bg-zinc-900/10 hover:border-zinc-700 transition-all duration-300 overflow-hidden"
              >
                {/* Trigger Button */}
                <button
                  onClick={() => toggleFAQ(index)}
                  className="w-full px-6 py-5 flex items-center justify-between text-left text-white font-medium text-base focus:outline-none"
                >
                  <span>{faq.question}</span>
                  <ChevronDown
                    className={`w-5 h-5 text-zinc-400 transition-transform duration-300 ${
                      isOpen ? "transform rotate-180 text-white" : ""
                    }`}
                  />
                </button>

                {/* Content Panel */}
                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25, ease: "easeInOut" }}
                    >
                      <div className="px-6 pb-6 text-sm text-zinc-400 leading-relaxed font-normal border-t border-zinc-800/40 pt-4">
                        {faq.answer}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </ScrollReveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
