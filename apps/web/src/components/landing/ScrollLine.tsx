"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { useEffect, useState } from "react";

interface SectionMarker {
  id: string;
  name: string;
  label: string;
}

const SECTIONS: SectionMarker[] = [
  { id: "features", name: "Features", label: "01" },
  { id: "showcase", name: "Showcase", label: "02" },
  { id: "chatbot", name: "Copilot", label: "03" },
  { id: "pricing", name: "Pricing", label: "04" },
  { id: "faq", name: "FAQ", label: "05" },
];

export function ScrollLine({ containerRef }: { containerRef: React.RefObject<HTMLDivElement | null> }) {
  const [activeSection, setActiveSection] = useState("");

  // Track scroll progress of the container
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start center", "end center"],
  });

  // Calculate the y-coordinate for the slider coordinate along the 160px gauge track
  const sliderY = useTransform(scrollYProgress, [0, 1], [0, 160]);

  // Monitor scrolling to highlight the active section currently in viewport center
  useEffect(() => {
    const handleScroll = () => {
      const viewportCenter = window.innerHeight / 2;
      let currentActive = "";

      for (const sec of SECTIONS) {
        const el = document.getElementById(sec.id);
        if (el) {
          const rect = el.getBoundingClientRect();
          if (rect.top <= viewportCenter && rect.bottom >= viewportCenter) {
            currentActive = sec.id;
            break;
          }
        }
      }
      setActiveSection(currentActive);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll(); // Initial check

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="fixed right-8 top-1/2 -translate-y-1/2 z-50 pointer-events-none hidden lg:flex flex-col items-center gap-6">
      {/* HUD Index List */}
      <div className="flex flex-col items-end gap-4.5">
        {SECTIONS.map((sec) => {
          const isActive = activeSection === sec.id;

          return (
            <div key={sec.id} className="flex items-center gap-3 h-4">
              {/* Sliding section label (reveals when active) */}
              <motion.span
                animate={{
                  opacity: isActive ? 0.75 : 0,
                  x: isActive ? 0 : 6,
                }}
                transition={{ duration: 0.25, ease: "easeOut" }}
                className="text-[9px] font-mono tracking-[0.2em] uppercase text-white select-none"
              >
                {sec.name}
              </motion.span>

              {/* Index Number */}
              <span
                className={`text-[10px] font-mono select-none transition-colors duration-300 ${
                  isActive ? "text-white font-bold" : "text-zinc-600"
                }`}
              >
                {sec.label}
              </span>
            </div>
          );
        })}
      </div>

      {/* Vertical Gauge Track */}
      <div className="relative w-4 h-40 flex justify-center">
        {/* Background track */}
        <div className="absolute inset-y-0 w-[1px] bg-zinc-900" />

        {/* Active scroll bar overlay */}
        <motion.div
          style={{ scaleY: scrollYProgress }}
          className="absolute top-0 w-[1px] bg-white origin-top shadow-[0_0_8px_rgba(255,255,255,0.4)]"
        />

        {/* Sliding target coordinate marker */}
        <motion.div
          style={{ y: sliderY }}
          className="absolute top-0 w-3.5 h-[1px] bg-white shadow-[0_0_8px_rgba(255,255,255,0.8)]"
        />
      </div>
    </div>
  );
}
