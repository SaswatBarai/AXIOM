"use client";

import { motion } from "framer-motion";

const STATS = [
  { value: "14k+", label: "Active Candidates" },
  { value: "89%", label: "Interview Callback Rate" },
  { value: "3.2×", label: "Faster Application Search" },
];

export function StatsSection() {
  return (
    <div className="grid grid-cols-3 gap-6 pt-6 border-t border-border-subtle/60 w-full">
      {STATS.map((stat, index) => (
        <motion.div
          key={stat.label}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 * index }}
          className="space-y-1"
        >
          <div className="text-xl sm:text-2xl font-extrabold text-text-primary tracking-tight">
            {stat.value}
          </div>
          <div className="text-[10px] sm:text-xs font-semibold text-text-muted leading-tight">
            {stat.label}
          </div>
        </motion.div>
      ))}
    </div>
  );
}
