"use client";

import { motion } from "framer-motion";
import { CheckCircle2, TrendingUp, Bot } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const floatA = { y: [0, -8, 0] };
const floatB = { y: [0, 8, 0] };
const floatC = { y: [0, -6, 0] };

export function FloatingStats() {
  return (
    <div className="relative w-full max-w-md h-[400px] flex items-center justify-center">
      {/* Mock dashboard canvas background blur */}
      <div className="absolute inset-0 bg-brand/5 rounded-[32px] filter blur-xl opacity-30 pointer-events-none" />

      {/* Card 1: ATS Score */}
      <motion.div
        animate={floatA}
        transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-4 left-4 w-[210px] z-10"
      >
        <Card className="border border-border-subtle bg-bg-card/75 backdrop-blur-md p-5 shadow-2xl rounded-2xl">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider">ATS Score</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="flex items-end gap-1.5">
            <span className="text-4xl font-extrabold text-text-primary tracking-tight">87</span>
            <span className="text-sm font-semibold text-text-secondary mb-1">%</span>
          </div>
          <div className="mt-3.5 h-1.5 bg-bg-elevated rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-brand rounded-full"
              initial={{ width: 0 }}
              animate={{ width: "87%" }}
              transition={{ duration: 1.5, delay: 0.5, ease: "easeOut" }}
            />
          </div>
          <p className="text-[11px] text-emerald-500 font-medium mt-2">Ready for submission</p>
        </Card>
      </motion.div>

      {/* Card 2: Job Match */}
      <motion.div
        animate={floatB}
        transition={{ duration: 5.5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
        className="absolute top-16 right-4 w-[190px] z-20"
      >
        <Card className="border border-border-subtle bg-bg-card/75 backdrop-blur-md p-4 shadow-2xl rounded-2xl">
          <div className="flex items-center gap-2.5 mb-3">
            <div className="w-8 h-8 rounded-lg bg-bg-elevated border border-border-subtle flex items-center justify-center text-xs font-bold text-text-primary">
              V
            </div>
            <div>
              <div className="text-xs font-semibold text-text-primary">Vercel</div>
              <div className="text-[9px] font-medium text-text-muted">Remote · US</div>
            </div>
          </div>
          <Badge className="bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20 border border-emerald-500/20 text-[10px] font-semibold py-0.5 px-2.5 rounded-full">
            94% Match
          </Badge>
        </Card>
      </motion.div>

      {/* Card 3: Career Copilot */}
      <motion.div
        animate={floatC}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 1 }}
        className="absolute bottom-10 left-6 w-[230px] z-30"
      >
        <Card className="border border-border-subtle bg-bg-card/75 backdrop-blur-md p-4.5 shadow-2xl rounded-2xl">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-6 h-6 rounded-md bg-brand/10 flex items-center justify-center">
              <Bot className="w-3.5 h-3.5 text-brand" />
            </div>
            <span className="text-xs font-semibold text-text-primary">Career Copilot</span>
            <span className="ml-auto w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
          </div>
          <p className="text-[11px] text-text-secondary leading-relaxed">
            &ldquo;Your profile matches <span className="text-text-primary font-semibold">23 new roles</span> this week.&rdquo;
          </p>
        </Card>
      </motion.div>

      {/* Card 4: Monthly Stats */}
      <motion.div
        animate={floatA}
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1.5 }}
        className="absolute bottom-6 right-6 w-[170px] z-10"
      >
        <Card className="border border-border-subtle bg-bg-card/75 backdrop-blur-md p-4 shadow-2xl rounded-2xl">
          <div className="flex items-center gap-1.5 mb-2.5">
            <TrendingUp className="w-3.5 h-3.5 text-emerald-500" />
            <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider">This Month</span>
          </div>
          <div className="flex gap-4">
            <div>
              <div className="text-lg font-extrabold text-text-primary tracking-tight">127</div>
              <div className="text-[9px] font-medium text-text-muted">Applied</div>
            </div>
            <div className="border-l border-border-subtle pl-4">
              <div className="text-lg font-extrabold text-text-primary tracking-tight">12</div>
              <div className="text-[9px] font-medium text-text-muted">Interviews</div>
            </div>
          </div>
        </Card>
      </motion.div>
    </div>
  );
}
