"use client";

import { motion, useScroll } from "framer-motion";
import { useRef } from "react";

export function HeaderLine() {
  const ref = useRef<HTMLDivElement>(null);
  
  // Track scroll progress of this specific heading container
  const { scrollYProgress } = useScroll({
    target: ref,
    // Start drawing as the text crosses 95% height of viewport
    // Finish drawing when it reaches 65% height of viewport (near center)
    offset: ["start 0.95", "end 0.65"],
  });

  return (
    <div ref={ref} className="absolute bottom-0 left-0 w-full h-[1px] overflow-hidden mt-1.5">
      <motion.div
        style={{ scaleX: scrollYProgress }}
        className="w-full h-full bg-gradient-to-r from-white via-zinc-500 to-transparent origin-left"
      />
    </div>
  );
}
