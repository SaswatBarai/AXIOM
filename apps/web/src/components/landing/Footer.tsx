"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Github, Twitter, Linkedin, Heart } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-zinc-850 bg-[#09090b] py-16 px-6 relative">
      <div className="max-w-7xl mx-auto space-y-12">
        {/* Top footer grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12">
          {/* Brand Col */}
          <div className="lg:col-span-2 space-y-6">
            <Link href="/" className="flex items-center gap-2.5">
              <div className="w-8 h-8 bg-white text-black rounded-lg flex items-center justify-center font-bold text-lg">
                A
              </div>
              <span className="font-bold text-lg tracking-tight text-white">AXIOM</span>
            </Link>
            <p className="text-sm text-zinc-400 leading-relaxed font-normal max-w-sm">
              AXIOM is a state-of-the-art AI career copilot, helping you analyze resume compatibility, match jobs semantically, prepare for interviews, and track applications.
            </p>
          </div>

          {/* Links Col 1 */}
          <div className="space-y-4">
            <h4 className="text-sm font-semibold text-white uppercase tracking-wider">Product</h4>
            <ul className="space-y-2.5">
              <li>
                <Link href="#features" className="text-sm text-zinc-400 hover:text-white transition-colors">
                  Features
                </Link>
              </li>
              <li>
                <Link href="#pricing" className="text-sm text-zinc-400 hover:text-white transition-colors">
                  Pricing
                </Link>
              </li>
              <li>
                <Link href="#" className="text-sm text-zinc-400 hover:text-white transition-colors">
                  Changelog
                </Link>
              </li>
            </ul>
          </div>

          {/* Links Col 2 */}
          <div className="space-y-4">
            <h4 className="text-sm font-semibold text-white uppercase tracking-wider">Company</h4>
            <ul className="space-y-2.5">
              <li>
                <Link href="#" className="text-sm text-zinc-400 hover:text-white transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="#" className="text-sm text-zinc-400 hover:text-white transition-colors">
                  Career Blog
                </Link>
              </li>
              <li>
                <Link href="#" className="text-sm text-zinc-400 hover:text-white transition-colors">
                  Careers
                </Link>
              </li>
            </ul>
          </div>

          {/* Links Col 3 */}
          <div className="space-y-4">
            <h4 className="text-sm font-semibold text-white uppercase tracking-wider">Legal</h4>
            <ul className="space-y-2.5">
              <li>
                <Link href="#" className="text-sm text-zinc-400 hover:text-white transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="#" className="text-sm text-zinc-400 hover:text-white transition-colors">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link href="mailto:support@axiom.ai" className="text-sm text-zinc-400 hover:text-white transition-colors">
                  Support
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Separator line */}
        <hr className="border-zinc-800" />

        {/* Bottom row: copyright, socials, and newsletter */}
        <div className="flex flex-col lg:flex-row items-center justify-between gap-8 pt-4">
          <div className="flex flex-col items-center lg:items-start gap-2">
            <p className="text-xs text-zinc-500 font-semibold">
              © {new Date().getFullYear()} AXIOM. All rights reserved.
            </p>
            <p className="text-xs text-zinc-650 flex items-center gap-1">
              Made with <Heart className="w-3 h-3 text-zinc-500 fill-zinc-500" /> for global professionals.
            </p>
          </div>

          {/* Social Icons */}
          <div className="flex items-center gap-6">
            <Link href="https://github.com" target="_blank" className="text-zinc-500 hover:text-white transition-colors">
              <Github className="w-5 h-5" />
            </Link>
            <Link href="https://twitter.com" target="_blank" className="text-zinc-500 hover:text-white transition-colors">
              <Twitter className="w-5 h-5" />
            </Link>
            <Link href="https://linkedin.com" target="_blank" className="text-zinc-500 hover:text-white transition-colors">
              <Linkedin className="w-5 h-5" />
            </Link>
          </div>

          {/* Newsletter subscription Form */}
          <div className="w-full sm:w-auto flex flex-col sm:flex-row gap-2">
            <Input
              type="email"
              placeholder="Enter your email"
              className="bg-zinc-950 border-zinc-800 text-sm h-10 w-full sm:w-64"
            />
            <Button className="bg-white hover:bg-zinc-200 text-black font-semibold h-10 px-5 text-sm shrink-0">
              Subscribe
            </Button>
          </div>
        </div>
      </div>
    </footer>
  );
}
