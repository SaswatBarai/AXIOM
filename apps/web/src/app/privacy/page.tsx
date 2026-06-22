"use client";

import { useState, useEffect } from "react";
import { Navbar } from "@/components/landing/Navbar";
import { Footer } from "@/components/landing/Footer";
import { SmoothScroll } from "@/components/SmoothScroll";
import { FileText, ShieldCheck, ArrowRight, HelpCircle } from "lucide-react";
import { motion } from "framer-motion";

interface TermsSection {
  id: string;
  title: string;
  content: React.ReactNode;
}

const privacySections: TermsSection[] = [
  {
    id: "collection",
    title: "1. Information We Collect",
    content: (
      <>
        We collect information to provide better career services to our users. This includes:
        <span className="block mt-2 text-zinc-400">
          • Personal details: Name, email address, and professional background.
          <br />
          • Resume profiles: PDF and DOCX files uploaded for ATS analysis and parsing.
          <br />
          • Technical data: Cookies, IP addresses, and device identifiers used to monitor platform performance.
        </span>
      </>
    ),
  },
  {
    id: "usage",
    title: "2. How We Use Information",
    content: (
      <>
        Your data is processed to run our core platforms. Specifically, we use it to calculate your ATS formatting scores, match your resume against live roles semantically using vector database embeddings, generate cover letters, and provide tailored mock interview guidance.
      </>
    ),
  },
  {
    id: "sharing",
    title: "3. Information Sharing",
    content: (
      <>
        We believe in data ownership. AXIOM does not sell, trade, or rent user resumes or personal profiles to third-party advertisers. Your profile is shared with employers only when you explicitly opt to apply for a role through the semantic search board.
      </>
    ),
  },
  {
    id: "retention",
    title: "4. Data Retention & Deletion",
    content: (
      <>
        Resumes and parsed profiles are retained as long as your user account remains active. You can delete individual resumes or purge your entire user account from settings at any time. Doing so will permanently wipe your files and vectors from our server indexes.
      </>
    ),
  },
  {
    id: "security",
    title: "5. Data Security Measures",
    content: (
      <>
        We protect your data using industry-leading security practices. All database connections enforce SSL/TLS encryption in transit, and uploaded documents are encrypted with AES-256 at rest. Access to backend systems is restricted using role-based access keys.
      </>
    ),
  },
  {
    id: "rights",
    title: "6. Your Privacy Rights",
    content: (
      <>
        Under GDPR, CCPA, and global privacy rules, you hold rights to access, update, correct, or request the deletion of your personal data. You can exercise these rights directly within your dashboard or by submitting a ticket to our compliance team.
      </>
    ),
  },
  {
    id: "changes",
    title: "7. Policy Modifications",
    content: (
      <>
        We may update our Privacy Policy as AXIOM expands. We will notify you of major changes by posting the new policy here with an updated timestamp. Continued use of the platform constitutes consent to updated data practices.
      </>
    ),
  },
];

export default function PrivacyPage() {
  const [activeId, setActiveId] = useState("collection");

  // Highlight the active section using IntersectionObserver (synchronized precisely with Lenis scroll)
  useEffect(() => {
    const ids = privacySections.map((sec) => sec.id);
    const observers: IntersectionObserver[] = [];

    ids.forEach((id) => {
      const el = document.getElementById(id);
      if (!el) return;
      const obs = new IntersectionObserver(
        ([entry]) => {
          if (entry?.isIntersecting) {
            setActiveId(id);
          }
        },
        { rootMargin: "-120px 0px -60% 0px", threshold: 0 }
      );
      obs.observe(el);
      observers.push(obs);
    });

    return () => observers.forEach((o) => o.disconnect());
  }, []);

  const handleLinkClick = (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    const el = document.getElementById(id);
    if (el) {
      const rect = el.getBoundingClientRect();
      const absoluteTop = rect.top + window.scrollY;
      window.scrollTo({
        top: absoluteTop - 120,
        behavior: "smooth",
      });
      setActiveId(id);
    }
  };

  return (
    <SmoothScroll>
      <main className="min-h-screen bg-bg-base text-white relative">
        <Navbar />

        {/* Clipped background container to prevent vertical scroll overflow */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
          <div className="absolute top-[8%] left-[5%] w-[500px] h-[500px] ambient-glow-orb opacity-40" />
          <div className="absolute bottom-[20%] right-[5%] w-[600px] h-[600px] ambient-glow-orb opacity-30" />
        </div>

        {/* Section Divider Line */}
        <div className="absolute top-16 inset-x-0 h-px bg-gradient-to-r from-transparent via-zinc-800/80 to-transparent" />

        <div className="max-w-7xl mx-auto px-6 py-20 relative z-10">
          
          {/* Header Block */}
          <div className="max-w-3xl mb-16 space-y-5">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-brand/10 border border-brand/20 rounded-full text-xs font-semibold text-brand">
              <FileText className="w-3.5 h-3.5" />
              Legal Center
            </div>
            <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-white leading-tight">
              Privacy Policy
            </h1>
            <p className="text-base text-zinc-400 leading-relaxed max-w-xl">
              Last Updated: June 22, 2026. Review how we protect, process, and respect your resume profile data.
            </p>
          </div>

          {/* Layout Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
            
            {/* Left Column: Sticky Index */}
            <div className="lg:col-span-4 lg:sticky lg:top-28 space-y-6">
              <div className="border border-zinc-800/80 bg-zinc-950/40 backdrop-blur-md rounded-2xl p-6 space-y-4">
                <h2 className="text-xs font-mono tracking-[0.2em] uppercase text-zinc-500">
                  Document Index
                </h2>
                <nav className="flex flex-col gap-1">
                  {privacySections.map((sec) => {
                    const isActive = activeId === sec.id;
                    return (
                      <a
                        key={sec.id}
                        href={`#${sec.id}`}
                        onClick={(e) => handleLinkClick(e, sec.id)}
                        className={`text-xs font-medium py-2.5 px-3 rounded-lg flex items-center justify-between transition-all duration-200 ${
                          isActive
                            ? "bg-brand/10 border border-brand/20 text-brand font-semibold"
                            : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/30 border border-transparent"
                        }`}
                      >
                        {sec.title.split(". ")[1]}
                        {isActive && <motion.div layoutId="activePrivacyIndex" className="w-1.5 h-1.5 rounded-full bg-brand" />}
                      </a>
                    );
                  })}
                </nav>
              </div>

              {/* Security Trust Widget */}
              <div className="border border-zinc-800/80 bg-zinc-950/20 rounded-2xl p-6 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-400">
                    <ShieldCheck className="w-4 h-4 text-brand" />
                  </div>
                  <h3 className="text-sm font-bold text-white">Privacy Compliance</h3>
                </div>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  Have questions about resume encryption keys, vector data safety, or how to erase your records?
                </p>
                <div>
                  <a
                    href="mailto:privacy@axiom.ai"
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-brand hover:text-brand-hover transition-colors group/link"
                  >
                    Contact Compliance{" "}
                    <ArrowRight className="w-3 h-3 group-hover/link:translate-x-0.5 transition-transform" />
                  </a>
                </div>
              </div>
            </div>

            {/* Right Column: Copy Panel */}
            <div className="lg:col-span-8 space-y-10 border border-zinc-800/60 bg-zinc-950/20 rounded-2xl p-8 md:p-10">
              {privacySections.map((sec) => (
                <section key={sec.id} id={sec.id} className="space-y-4 scroll-mt-28">
                  <h2 className="text-lg font-bold text-white border-b border-zinc-900 pb-3">
                    {sec.title}
                  </h2>
                  <p className="text-sm text-zinc-400 leading-relaxed font-normal">
                    {sec.content}
                  </p>
                </section>
              ))}
            </div>

          </div>

        </div>

        <Footer />
      </main>
    </SmoothScroll>
  );
}
