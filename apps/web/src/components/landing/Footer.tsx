"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Github, Twitter, Linkedin } from "lucide-react";

function AxiomLogo({ size = 28 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" aria-label="AXIOM" xmlns="http://www.w3.org/2000/svg">
      <rect x="1" y="1" width="30" height="30" rx="7" fill="white" />
      <path d="M10 23L16 9L22 23" stroke="#09090b" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      <line x1="12.5" y1="18.5" x2="19.5" y2="18.5" stroke="#09090b" strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  );
}

const navLinks = {
  Product: [
    { label: "Features", href: "#features" },
    { label: "Pricing", href: "#pricing" },
    { label: "Changelog", href: "#" },
  ],
  Company: [
    { label: "About Us", href: "#" },
    { label: "Career Blog", href: "#" },
    { label: "Careers", href: "#" },
  ],
  Legal: [
    { label: "Privacy Policy", href: "#" },
    { label: "Terms of Service", href: "#" },
    { label: "Support", href: "mailto:support@axiom.ai" },
  ],
};

export function Footer() {
  return (
    <footer className="border-t border-zinc-900 bg-[#09090b] pt-16 pb-10 px-6">
      <div className="max-w-7xl mx-auto space-y-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12">

          {/* Brand */}
          <div className="lg:col-span-2 space-y-5">
            <Link href="/" className="flex items-center gap-2.5 w-fit">
              <AxiomLogo size={28} />
              <span className="font-bold text-lg tracking-tight text-white">AXIOM</span>
            </Link>
            <p className="text-sm text-zinc-500 leading-relaxed max-w-sm">
              AI-powered career copilot. Analyze resume compatibility, match jobs semantically,
              prep for interviews, and track every application — all in one place.
            </p>
            <div className="flex items-center gap-4 pt-1">
              {[
                { href: "https://github.com", Icon: Github, label: "GitHub" },
                { href: "https://twitter.com", Icon: Twitter, label: "Twitter" },
                { href: "https://linkedin.com", Icon: Linkedin, label: "LinkedIn" },
              ].map(({ href, Icon, label }) => (
                <Link key={label} href={href} target="_blank" rel="noopener noreferrer" aria-label={label}
                  className="text-zinc-600 hover:text-zinc-300 transition-colors duration-200">
                  <Icon className="w-4 h-4" />
                </Link>
              ))}
            </div>
          </div>

          {/* Nav columns */}
          {Object.entries(navLinks).map(([group, links]) => (
            <div key={group} className="space-y-4">
              <h4 className="text-xs font-semibold text-zinc-400 uppercase tracking-[0.12em]">{group}</h4>
              <ul className="space-y-2.5">
                {links.map(({ label, href }) => (
                  <li key={label}>
                    <Link href={href} className="text-sm text-zinc-500 hover:text-zinc-200 transition-colors duration-200">
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <hr className="border-zinc-900" />

        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <p className="text-xs text-zinc-600">
            © {new Date().getFullYear()} AXIOM. All rights reserved.
          </p>
          <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
            <Input
              type="email"
              placeholder="Your email address"
              className="bg-zinc-900/50 border-zinc-800 text-sm h-9 w-full sm:w-56 text-zinc-300 placeholder:text-zinc-600 focus:border-zinc-600"
              aria-label="Newsletter email"
            />
            <Button className="bg-white hover:bg-zinc-100 text-black font-semibold h-9 px-5 text-sm shrink-0">
              Subscribe
            </Button>
          </div>
        </div>
      </div>
    </footer>
  );
}