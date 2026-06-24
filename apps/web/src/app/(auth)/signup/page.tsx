"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { SignupHero } from "@/components/auth/SignupHero";
import { SignupForm } from "@/components/auth/SignupForm";
import { useAuth } from "@/hooks/useAuth";
import Link from "next/link";

export default function SignupPage() {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isAuthenticated) {
      router.replace("/dashboard");
    }
  }, [isAuthenticated, router]);

  if (isLoading || isAuthenticated) {
    return (
      <div className="flex min-h-screen w-full items-center justify-center bg-bg-base text-text-primary">
        <div className="w-6 h-6 border-2 border-brand border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen w-full bg-bg-base text-text-primary">
      {/* Left Column: Visual Panel */}
      <SignupHero />

      {/* Right Column: Form Panel */}
      <div className="flex-1 flex flex-col justify-center items-center px-6 sm:px-12 md:px-16 py-12 relative overflow-hidden bg-bg-base">
        {/* Decorative ambient radial spotlight */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-brand/5 rounded-full blur-[140px] pointer-events-none" />

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
          className="w-full max-w-sm relative z-10 flex flex-col items-center"
        >
          {/* Mobile brand Logo (Hidden on Desktop) */}
          <Link href="/" className="lg:hidden flex items-center gap-2.5 mb-8 group">
            <div className="w-9 h-9 bg-brand rounded-xl flex items-center justify-center font-bold text-xl text-black shadow-lg shadow-brand/10">
              A
            </div>
            <span className="font-bold text-xl tracking-tight text-text-primary">
              AXIOM
            </span>
          </Link>

          {/* Onboarding Register Form */}
          <SignupForm />
        </motion.div>
      </div>
    </div>
  );
}
