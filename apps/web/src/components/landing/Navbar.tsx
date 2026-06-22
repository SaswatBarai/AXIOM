"use client";

import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";

const NAV_ITEMS = [
  { label: "Features",  href: "/#features"  },
  { label: "Showcase",  href: "/#showcase"  },
  { label: "Copilot",   href: "/#chatbot"   },
  { label: "Pricing",   href: "/#pricing"   },
  { label: "FAQ",       href: "/#faq"       },
] as const;

function AxiomLogo({ size = 32 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      aria-label="AXIOM"
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect x="1" y="1" width="30" height="30" rx="7" fill="var(--color-brand)" />
      <path
        d="M10 23L16 9L22 23"
        stroke="#09090b"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      <line x1="12.5" y1="18.5" x2="19.5" y2="18.5" stroke="#09090b" strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  );
}

export function Navbar() {
  const [isOpen, setIsOpen]         = useState(false);
  const [scrolled, setScrolled]     = useState(false);
  const [activeSection, setActive]  = useState<string>("");
  const menuRef                     = useRef<HTMLDivElement>(null);

  // Scroll → glass effect
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Active section via IntersectionObserver on the center stripe of the viewport
  useEffect(() => {
    const ids = NAV_ITEMS.map((item) => item.href.slice(1));
    const observers: IntersectionObserver[] = [];

    ids.forEach((id) => {
      const el = document.getElementById(id);
      if (!el) return;
      const obs = new IntersectionObserver(
        ([entry]) => { if (entry?.isIntersecting) setActive(id); },
        { rootMargin: "-45% 0px -45% 0px", threshold: 0 },
      );
      obs.observe(el);
      observers.push(obs);
    });

    return () => observers.forEach((o) => o.disconnect());
  }, []);

  // Escape key closes mobile menu
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsOpen(false);
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [isOpen]);

  // Focus trap inside mobile menu
  useEffect(() => {
    if (!isOpen || !menuRef.current) return;
    const el = menuRef.current;
    const focusable = el.querySelectorAll<HTMLElement>(
      "a[href], button:not([disabled])",
    );
    const first = focusable[0];
    const last  = focusable[focusable.length - 1];

    first?.focus();

    const trap = (e: KeyboardEvent) => {
      if (e.key !== "Tab") return;
      if (e.shiftKey) {
        if (document.activeElement === first) { e.preventDefault(); last?.focus(); }
      } else {
        if (document.activeElement === last)  { e.preventDefault(); first?.focus(); }
      }
    };

    document.addEventListener("keydown", trap);
    return () => document.removeEventListener("keydown", trap);
  }, [isOpen]);

  return (
    <nav
      className={`sticky top-0 z-50 w-full transition-all duration-300 ${
        scrolled
          ? "bg-bg-base/90 backdrop-blur-xl border-b border-zinc-800/70 shadow-[0_1px_0_0_rgba(255,255,255,0.04)]"
          : "bg-transparent border-b border-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5 group" aria-label="AXIOM home">
          <div className="group-hover:scale-105 transition-transform duration-200">
            <AxiomLogo size={32} />
          </div>
          <span className="font-bold text-xl tracking-tight text-white">AXIOM</span>
        </Link>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-8">
          {NAV_ITEMS.map((item) => {
            const id = item.href.slice(1);
            const isActive = activeSection === id;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`text-sm transition-colors duration-200 ${
                  isActive
                    ? "text-white font-medium"
                    : "text-zinc-400 hover:text-white"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </div>

        {/* Desktop CTAs */}
        <div className="hidden md:flex items-center gap-3">
          <Link href="/login">
            <Button variant="ghost" className="text-zinc-400 hover:text-white hover:bg-zinc-800/60 text-sm h-9 px-4">
              Sign In
            </Button>
          </Link>
          <Link href="/signup">
            <Button className="bg-brand hover:bg-brand-hover text-black font-semibold text-sm h-9 px-4 shadow-sm">
              Get Started
            </Button>
          </Link>
        </div>

        {/* Mobile hamburger */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="md:hidden p-2 text-zinc-400 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/20 rounded-md"
          aria-label={isOpen ? "Close menu" : "Open menu"}
          aria-expanded={isOpen}
          aria-controls="mobile-menu"
        >
          {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile menu */}
      {isOpen && (
        <div
          id="mobile-menu"
          ref={menuRef}
          role="dialog"
          aria-modal="true"
          aria-label="Navigation menu"
          className="md:hidden absolute top-16 left-0 w-full bg-bg-base/98 border-b border-zinc-800/80 py-6 px-6 flex flex-col gap-5 backdrop-blur-xl animate-in fade-in slide-in-from-top-3 duration-200"
        >
          <nav className="flex flex-col gap-1">
            {NAV_ITEMS.map((item) => {
              const id = item.href.slice(1);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsOpen(false)}
                  className={`text-sm py-2.5 px-3 rounded-lg transition-colors ${
                    activeSection === id
                      ? "text-white bg-zinc-800/60"
                      : "text-zinc-400 hover:text-white hover:bg-zinc-800/50"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
          <hr className="border-zinc-800/60" />
          <div className="flex flex-col gap-2.5">
            <Link href="/login" className="w-full" onClick={() => setIsOpen(false)}>
              <Button variant="ghost" className="w-full text-zinc-300 hover:text-white justify-center border border-zinc-800 h-10">
                Sign In
              </Button>
            </Link>
            <Link href="/signup" className="w-full" onClick={() => setIsOpen(false)}>
              <Button className="w-full bg-brand hover:bg-brand-hover text-black font-semibold justify-center h-10">
                Get Started
              </Button>
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}
