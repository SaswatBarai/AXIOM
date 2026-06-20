"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";

interface ScrollRevealProps {
  children: React.ReactNode;
  delay?: number;
  once?: boolean;
  className?: string;
}

export function ScrollReveal({
  children,
  delay = 0,
  once = false,
  className,
}: ScrollRevealProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [isInView, setIsInView] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined" || !ref.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (!entry) return;

        if (entry.isIntersecting) {
          setIsInView(true);
          if (once) {
            observer.disconnect();
          }
        } else if (!once) {
          setIsInView(false);
        }
      },
      {
        threshold: 0.1, // Trigger early when 10% is visible
        rootMargin: "0px 0px -50px 0px", // Trigger slightly before it fully crosses the bottom fold
      }
    );

    observer.observe(ref.current);

    return () => {
      observer.disconnect();
    };
  }, [once]);

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: isInView ? 1 : 0, y: isInView ? 0 : 8 }}
      transition={{
        duration: 0.45,
        ease: [0.16, 1, 0.3, 1], // Expo-out curve
        delay: delay,
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

