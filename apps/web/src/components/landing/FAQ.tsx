"use client";

import { useState, useRef } from "react";
import { Plus, Minus, HelpCircle, ArrowRight } from "lucide-react";
import { motion, AnimatePresence, useInView } from "framer-motion";

interface FAQItem {
  id: string;
  question: string;
  answer: string;
}

const faqs: FAQItem[] = [
  {
    id: "ats",
    question: "How accurate is the ATS score analyzer?",
    answer:
      "Our parser is calibrated against the parsing algorithms of major enterprise ATS platforms like Workday, Greenhouse, and Lever. We check formatting compatibility, keyword density metrics, section naming layouts, and semantic skill gaps to produce an ATS score that correlates strongly with real screen-pass rates.",
  },
  {
    id: "match",
    question: "How does the Job Matching Engine recommend roles?",
    answer:
      "We use semantic vector embeddings rather than generic keyword matching. The engine converts your parsed experience, achievements, and projects into a vector space, measuring the cosine similarity against thousands of active job requirements to surface matches with a high precision score.",
  },
  {
    id: "security",
    question: "Is my resume data secure?",
    answer:
      "Yes. All uploaded files and profile information are encrypted in transit via SSL/TLS and stored with AES-256 encryption at rest. We do not sell data to third-party brokers, and your profile is only visible to employers you explicitly apply to.",
  },
  {
    id: "billing",
    question: "Can I cancel my Pro subscription at any time?",
    answer:
      "Absolutely. You can cancel your subscription from your Account Settings at any time with a single click. You will retain full access to all Pro features until the end of your current billing period.",
  },
  {
    id: "markets",
    question: "Does AXIOM work for international job markets?",
    answer:
      "Yes. The job matching system syncs with active listings across major international platforms. While ATS formats are calibrated against global standards, region-specific guidelines are parsed automatically.",
  },
];

// Spotlight Card component for dynamic cursor glow
function SpotlightCard({
  children,
  className = "",
  intensity = 0.035,
  featured = false,
}: {
  children: React.ReactNode;
  className?: string;
  intensity?: number;
  featured?: boolean;
}) {
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const [opacity, setOpacity] = useState(0);

  return (
    <div
      onMouseMove={(e) => {
        const r = e.currentTarget.getBoundingClientRect();
        setPos({ x: e.clientX - r.left, y: e.clientY - r.top });
      }}
      onMouseEnter={() => setOpacity(1)}
      onMouseLeave={() => setOpacity(0)}
      className={`relative overflow-hidden rounded-2xl border transition-all duration-300 group ${
        featured
          ? "border-brand/25 bg-brand/[0.02] hover:border-brand/40 shadow-[0_0_30px_rgba(250,204,21,0.015)]"
          : "border-border-subtle bg-bg-card/20 hover:border-border-medium hover:bg-bg-card/30"
      } ${className}`}
    >
      {/* Featured Top Edge Shimmer */}
      {featured && (
        <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-brand/50 to-transparent z-30" />
      )}

      {/* Featured Background Glow Blob */}
      {featured && (
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-20 bg-brand/[0.06] blur-3xl pointer-events-none z-0" />
      )}

      {/* Spotlight Hover Overlay */}
      <div
        className="absolute inset-0 transition-opacity duration-300 pointer-events-none z-20"
        style={{
          opacity,
          background: `radial-gradient(300px circle at ${pos.x}px ${pos.y}px, var(--spotlight-color), transparent 80%)`,
        }}
      />

      <div className="relative z-10">{children}</div>
    </div>
  );
}

// Extracted FAQ Card to solve hooks in loops and keep logic clean
function FAQItemCard({
  faq,
  index,
  isOpen,
  onToggle,
}: {
  faq: FAQItem;
  index: number;
  isOpen: boolean;
  onToggle: () => void;
}) {
  const isFeatured = index === 0;
  const contentId = `faq-content-${faq.id}`;

  return (
    <SpotlightCard featured={isFeatured} className="w-full">
      {/* Accordion Trigger */}
      <button
        onClick={onToggle}
        aria-expanded={isOpen}
        aria-controls={contentId}
        className="w-full px-6 py-5 flex items-center justify-between text-left gap-4 group focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-brand/40"
      >
        <span
          className={`text-sm font-semibold leading-snug transition-colors duration-200 ${
            isOpen ? "text-text-primary" : "text-text-secondary group-hover:text-text-primary"
          }`}
        >
          {faq.question}
        </span>

        {/* Plus/Minus wrapped in icon containers */}
        <div
          className={`shrink-0 w-6 h-6 rounded-lg flex items-center justify-center border transition-all duration-300 ${
            isOpen
              ? isFeatured
                ? "bg-brand/10 border-brand/20 text-brand"
                : "bg-bg-elevated border-border-subtle text-text-primary"
              : isFeatured
              ? "bg-brand/5 border-brand/10 text-brand/70 group-hover:border-brand/35 group-hover:text-brand"
              : "bg-bg-card border-border-subtle text-text-muted group-hover:border-border-medium group-hover:text-text-secondary"
          }`}
        >
          {isOpen ? <Minus className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
        </div>
      </button>

      {/* Accordion Content */}
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            id={contentId}
            key="content"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="px-6 pb-6 pt-4 text-xs text-text-secondary leading-relaxed border-t border-border-subtle/40">
              {faq.answer}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </SpotlightCard>
  );
}

export function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Gate animations on viewport scroll entrance
  const inView = useInView(containerRef, { once: true, margin: "-60px" });

  return (
    <section id="faq" ref={containerRef} className="relative py-32 px-6 bg-bg-base overflow-hidden">
      {/* Top Section Divider */}
      <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-border-subtle/80 to-transparent" />

      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 14 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="grid grid-cols-1 lg:grid-cols-5 gap-12 lg:gap-16 items-start"
        >
          {/* Left Column: Title Block & Help Card */}
          <div className="lg:col-span-2 space-y-8 lg:sticky lg:top-28">
            <div className="space-y-4">
              <span className="text-[10px] font-semibold text-text-muted uppercase tracking-[0.15em]">
                FAQ
              </span>
              <h2 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-text-primary leading-[1.06]">
                Common questions
              </h2>
              <p className="text-base text-text-secondary leading-relaxed max-w-md">
                Everything you need to know before getting started with AXIOM.
              </p>
            </div>

            {/* Support Widget Card */}
            <SpotlightCard className="p-6 space-y-4 border-border-subtle bg-bg-card/5">
              <div className="flex items-center gap-3">
                {/* Standard icon treatment container */}
                <div className="w-8 h-8 rounded-lg bg-brand/10 border border-brand/20 flex items-center justify-center text-brand">
                  <HelpCircle className="w-4 h-4" />
                </div>
                <h3 className="text-sm font-bold text-text-primary">Still have questions?</h3>
              </div>
              <p className="text-xs text-text-secondary leading-relaxed">
                Can't find the exact answer you need? Write to our development team for immediate support.
              </p>
              <div>
                <a
                  href="mailto:support@axiom.careers"
                  className="inline-flex items-center gap-2 text-xs font-semibold text-brand hover:text-brand-hover transition-colors duration-200 group/link"
                >
                  Contact support{" "}
                  <ArrowRight className="w-3.5 h-3.5 group-hover/link:translate-x-0.5 transition-transform duration-200" />
                </a>
              </div>
            </SpotlightCard>
          </div>

          {/* Right Column: FAQ Accordion Panel */}
          <div className="lg:col-span-3 space-y-3.5">
            {faqs.map((faq, index) => (
              <FAQItemCard
                key={faq.id}
                faq={faq}
                index={index}
                isOpen={openIndex === index}
                onToggle={() => setOpenIndex(openIndex === index ? null : index)}
              />
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}