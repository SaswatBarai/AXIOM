"use client";

import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CheckCircle2 } from "lucide-react";

function AxiomLogo({ size = 28 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" aria-label="AXIOM" xmlns="http://www.w3.org/2000/svg">
      <rect x="1" y="1" width="30" height="30" rx="7" fill="var(--color-brand)" />
      <path d="M10 23L16 9L22 23" stroke="#09090b" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      <line x1="12.5" y1="18.5" x2="19.5" y2="18.5" stroke="#09090b" strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  );
}

const navLinks = {
  Product: [
    { label: "Features",  href: "#features" },
    { label: "Showcase",  href: "#showcase" },
    { label: "Pricing",   href: "#pricing"  },
  ],
  Legal: [
    { label: "Privacy Policy",   href: "/privacy" },
    { label: "Terms of Service", href: "/terms"   },
    { label: "Support",          href: "/support" },
  ],
};

type NewsletterStatus = "idle" | "loading" | "success" | "error";

export function Footer() {
  const [email,  setEmail]  = useState("");
  const [status, setStatus] = useState<NewsletterStatus>("idle");
  const [errMsg, setErrMsg] = useState("");

  async function handleSubscribe(e: React.SyntheticEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!email.trim()) return;
    setStatus("loading");
    setErrMsg("");
    try {
      const res = await fetch("/api/newsletter/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error((body as { error?: string }).error ?? "Subscription failed.");
      }
      setStatus("success");
      setEmail("");
    } catch (err: unknown) {
      setStatus("error");
      setErrMsg(err instanceof Error ? err.message : "Something went wrong.");
    }
  }

  return (
    <footer id="footer" className="border-t border-border-subtle bg-bg-base pt-16 pb-10 px-6">
      <div className="max-w-7xl mx-auto space-y-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">

          {/* Brand */}
          <div className="lg:col-span-2 space-y-5">
            <Link href="/" className="flex items-center gap-2.5 w-fit">
              <AxiomLogo size={28} />
              <span className="font-bold text-lg tracking-tight text-text-primary">AXIOM</span>
            </Link>
            <p className="text-sm text-text-secondary leading-relaxed max-w-sm">
              AI-powered career copilot. Analyze resume compatibility, match jobs semantically,
              prep for interviews, and track every application — all in one place.
            </p>
          </div>

          {/* Nav columns */}
          {Object.entries(navLinks).map(([group, links]) => (
            <div key={group} className="space-y-4">
              <h4 className="text-xs font-semibold text-text-muted uppercase tracking-[0.12em]">{group}</h4>
              <ul className="space-y-2.5">
                {links.map(({ label, href }) => (
                  <li key={label}>
                    <Link href={href} className="text-sm text-text-secondary hover:text-text-primary transition-colors duration-200">
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <hr className="border-border-subtle" />

        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <p className="text-xs text-text-muted">
            © {new Date().getFullYear()} AXIOM. All rights reserved.
          </p>

          {/* Newsletter */}
          {status === "success" ? (
            <div className="flex items-center gap-2 text-sm text-emerald-400">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              You&apos;re subscribed — we&apos;ll be in touch.
            </div>
          ) : (
            <form
              onSubmit={handleSubscribe}
              className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto"
              aria-label="Newsletter signup"
            >
              <div className="flex flex-col sm:flex-row gap-2">
                <Input
                  type="email"
                  placeholder="Your email address"
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); setStatus("idle"); }}
                  required
                  disabled={status === "loading"}
                  className="bg-bg-elevated/50 border-border-subtle text-sm h-9 w-full sm:w-56 text-text-secondary placeholder:text-text-muted focus:border-border-medium disabled:opacity-50"
                  aria-label="Newsletter email"
                />
                <Button
                  type="submit"
                  disabled={status === "loading"}
                  className="bg-brand hover:bg-brand-hover text-black font-semibold h-9 px-5 text-sm shrink-0 disabled:opacity-50"
                >
                  {status === "loading" ? (
                    <span className="flex items-center gap-2">
                      <span className="w-3.5 h-3.5 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                      Subscribing…
                    </span>
                  ) : "Subscribe"}
                </Button>
              </div>
              {status === "error" && (
                <p className="text-xs text-red-400 sm:self-center">{errMsg}</p>
              )}
            </form>
          )}
        </div>
      </div>
    </footer>
  );
}
