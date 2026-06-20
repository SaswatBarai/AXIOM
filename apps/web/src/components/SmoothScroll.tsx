"use client";

import { useEffect, useRef } from "react";
import Lenis from "lenis";
import { motion, useScroll, useSpring } from "framer-motion";

export function SmoothScroll({ children }: { children: React.ReactNode }) {
  const lenisRef = useRef<Lenis | null>(null);

  // Set up progress bar scroll trackers
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001,
  });

  useEffect(() => {
    if (typeof window === "undefined") return;

    // Instantiate Lenis smooth scrolling
    const lenis = new Lenis({
      duration: 1.8, // Slower, more luxurious scrolling glide time
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), // Smooth decelerating expo curve
      orientation: "vertical",
      gestureOrientation: "vertical",
      smoothWheel: true,
      wheelMultiplier: 0.8, // Reduced speed per wheel notch
      touchMultiplier: 1.2, // Reduced touch inertia speed
    });

    lenisRef.current = lenis;

    // Frame loops to sync scroll behavior
    let rafId: number;
    function raf(time: number) {
      lenis.raf(time);
      rafId = requestAnimationFrame(raf);
    }
    rafId = requestAnimationFrame(raf);

    // Listen to hash anchor clicks globally for smooth transition scrolls
    const handleAnchorClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const anchor = target.closest("a");
      if (
        anchor &&
        anchor.hash &&
        anchor.origin === window.location.origin &&
        anchor.pathname === window.location.pathname
      ) {
        const targetElement = document.querySelector(anchor.hash);
        if (targetElement) {
          e.preventDefault();
          lenis.scrollTo(targetElement as HTMLElement, {
            offset: -80, // Navbar height buffer
            duration: 1.8, // Match slower 1.8s page scroll duration
            easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
          });
        }
      }
    };

    document.addEventListener("click", handleAnchorClick, { capture: true });

    return () => {
      cancelAnimationFrame(rafId);
      lenis.destroy();
      document.removeEventListener("click", handleAnchorClick, { capture: true });
    };
  }, []);

  return (
    <>
      {/* Top scroll progress indicator */}
      <motion.div
        className="fixed top-0 left-0 right-0 h-[2px] bg-white origin-[0%] z-[100]"
        style={{ scaleX }}
      />
      {children}
    </>
  );
}

