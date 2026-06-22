"use client";

import { useState, useEffect } from "react";
import { Navbar } from "@/components/landing/Navbar";
import { Footer } from "@/components/landing/Footer";
import { SmoothScroll } from "@/components/SmoothScroll";
import { FileText, ShieldAlert, ArrowRight, HelpCircle } from "lucide-react";
import { motion } from "framer-motion";

interface TermsSection {
  id: string;
  title: string;
  content: React.ReactNode;
}

const termsSections: TermsSection[] = [
  {
    id: "acceptance",
    title: "1. Acceptance of Terms",
    content: (
      <>
        By accessing or using AXIOM (collectively, the "Platform", "we", "us", or "our"), including uploading resumes, matching with jobs, or utilizing AI interview prep tools, you agree to be bound by these Terms and Conditions. If you do not agree to these terms, do not access or use the Platform.
      </>
    ),
  },
  {
    id: "registration",
    title: "2. User Accounts & Security",
    content: (
      <>
        To access certain features of the Platform (such as resume analysis history or custom interview plans), you must create a secure user account. You agree to provide accurate, complete, and current information. You are solely responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account.
      </>
    ),
  },
  {
    id: "subscriptions",
    title: "3. Subscriptions & Billing",
    content: (
      <>
        We offer free access and premium subscription plans (Pro). Subscriptions are billed on a recurring monthly or annual basis. You may cancel your subscription at any time via your account settings. Payments are non-refundable, and you will maintain access to premium features until the end of your active billing period.
      </>
    ),
  },
  {
    id: "use",
    title: "4. Permissible Use",
    content: (
      <>
        You agree to use AXIOM only for personal, professional career development purposes. You must not upload malicious files, attempt to reverse-engineer our AI matching models, scrape job listings systematically, or deploy automated scrapers/bots to scrape user data from the platform.
      </>
    ),
  },
  {
    id: "ip",
    title: "5. Intellectual Property",
    content: (
      <>
        AXIOM's interface, source code, logos, visual designs, vector matching algorithms, and custom branding are the exclusive property of AXIOM and protected by copyright and intellectual property laws. You are granted a limited, non-exclusive license to use the platform for private professional purposes.
      </>
    ),
  },
  {
    id: "disclaimers",
    title: "6. Disclaimers & Warranties",
    content: (
      <>
        AXIOM is provided "as is" and "as available". While our ATS analyzer and vector matching models are calibrated against leading enterprise applicant tracking systems, we do not guarantee job interview selections, recruiter responses, or employment offers as a result of using the platform.
      </>
    ),
  },
  {
    id: "liability",
    title: "7. Limitation of Liability",
    content: (
      <>
        To the maximum extent permitted by law, AXIOM shall not be liable for any indirect, incidental, special, consequential, or punitive damages, or any loss of profits or revenues, arising out of your inability to access or use the platform or any information provided therein.
      </>
    ),
  },
  {
    id: "governing",
    title: "8. Governing Law & Changes",
    content: (
      <>
        These terms shall be governed by and construed in accordance with the local laws, without regard to conflict of law principles. We reserve the right to modify these terms at any time. Continued use of the platform after updates constitute acceptance of the updated terms.
      </>
    ),
  },
];

export default function TermsPage() {
  const [activeId, setActiveId] = useState("acceptance");

  // Highlight the active section using IntersectionObserver (synchronized precisely with Lenis scroll)
  useEffect(() => {
    const ids = termsSections.map((sec) => sec.id);
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
            Terms & Conditions
          </h1>
          <p className="text-base text-zinc-400 leading-relaxed max-w-xl">
            Last Updated: June 22, 2026. Please read these terms carefully before accessing or using our services.
          </p>
        </div>

        {/* Layout Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          
          {/* Left Column: Sticky Navigation Index */}
          <div className="lg:col-span-4 lg:sticky lg:top-28 space-y-6">
            <div className="border border-zinc-800/80 bg-zinc-950/40 backdrop-blur-md rounded-2xl p-6 space-y-4">
              <h2 className="text-xs font-mono tracking-[0.2em] uppercase text-zinc-500">
                Document Index
              </h2>
              <nav className="flex flex-col gap-1">
                {termsSections.map((sec) => {
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
                      {isActive && <motion.div layoutId="activeIndex" className="w-1.5 h-1.5 rounded-full bg-brand" />}
                    </a>
                  );
                })}
              </nav>
            </div>

            {/* Quick Contact Widget */}
            <div className="border border-zinc-800/80 bg-zinc-950/20 rounded-2xl p-6 space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-400">
                  <ShieldAlert className="w-4 h-4" />
                </div>
                <h3 className="text-sm font-bold text-white">Need Clarification?</h3>
              </div>
              <p className="text-xs text-zinc-400 leading-relaxed">
                If you have questions regarding our software license, user guidelines, or data policies, get in touch.
              </p>
              <div>
                <a
                  href="mailto:legal@axiom.ai"
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-brand hover:text-brand-hover transition-colors group/link"
                >
                  Contact Legal{" "}
                  <ArrowRight className="w-3 h-3 group-hover/link:translate-x-0.5 transition-transform" />
                </a>
              </div>
            </div>
          </div>

          {/* Right Column: Terms Text Content */}
          <div className="lg:col-span-8 space-y-10 border border-zinc-800/60 bg-zinc-950/20 rounded-2xl p-8 md:p-10">
            {termsSections.map((sec) => (
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
