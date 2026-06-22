"use client";

import Link from "next/link";
import { useState } from "react";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-50 w-full bg-[#09090b]/80 backdrop-blur-md border-b border-zinc-800/50 transition-all duration-300">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        {/* Logo & Branding */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-9 h-9 bg-white text-black rounded-lg flex items-center justify-center font-bold text-xl group-hover:scale-105 transition-transform duration-200">
            A
          </div>
          <span className="font-bold text-xl tracking-tight text-white animate-pulse-slow">AXIOM</span>
        </Link>

        {/* Navigation Menu (Desktop) */}
        <div className="hidden md:flex items-center gap-8">
          <Link href="#features" className="text-sm text-zinc-400 hover:text-white transition-colors duration-200">
            Features
          </Link>
          <Link href="#showcase" className="text-sm text-zinc-400 hover:text-white transition-colors duration-200">
            Showcase
          </Link>
          <Link href="#pricing" className="text-sm text-zinc-400 hover:text-white transition-colors duration-200">
            Pricing
          </Link>
          <Link href="#faq" className="text-sm text-zinc-400 hover:text-white transition-colors duration-200">
            FAQ
          </Link>
        </div>

        {/* Action Buttons (Desktop) */}
        <div className="hidden md:flex items-center gap-4">
          <Link href="/login">
            <Button variant="ghost" className="text-zinc-300 hover:text-white">
              Sign In
            </Button>
          </Link>
          <Link href="/signup">
            <Button className="bg-white hover:bg-zinc-200 text-black font-medium">
              Get Started
            </Button>
          </Link>
        </div>

        {/* Mobile Menu Trigger */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="md:hidden p-2 text-zinc-400 hover:text-white focus:outline-none"
          aria-label="Toggle menu"
        >
          {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Drawer */}
      {isOpen && (
        <div className="md:hidden absolute top-16 left-0 w-full bg-[#09090b]/95 border-b border-zinc-800/80 py-6 px-6 flex flex-col gap-6 animate-in fade-in slide-in-from-top-5 duration-200">
          <nav className="flex flex-col gap-4">
            <Link
              href="#features"
              onClick={() => setIsOpen(false)}
              className="text-base text-zinc-400 hover:text-white py-1 transition-colors"
            >
              Features
            </Link>
            <Link
              href="#showcase"
              onClick={() => setIsOpen(false)}
              className="text-base text-zinc-400 hover:text-white py-1 transition-colors"
            >
              Showcase
            </Link>
            <Link
              href="#pricing"
              onClick={() => setIsOpen(false)}
              className="text-base text-zinc-400 hover:text-white py-1 transition-colors"
            >
              Pricing
            </Link>
            <Link
              href="#faq"
              onClick={() => setIsOpen(false)}
              className="text-base text-zinc-400 hover:text-white py-1 transition-colors"
            >
              FAQ
            </Link>
          </nav>
          <hr className="border-zinc-800" />
          <div className="flex flex-col gap-3">
            <Link href="/login" className="w-full">
              <Button variant="ghost" className="w-full text-zinc-300 hover:text-white justify-center">
                Sign In
              </Button>
            </Link>
            <Link href="/signup" className="w-full">
              <Button className="w-full bg-white hover:bg-zinc-200 text-black font-medium justify-center">
                Get Started
              </Button>
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}
