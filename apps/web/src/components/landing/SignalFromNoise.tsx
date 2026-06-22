"use client";

import { useEffect, useRef } from "react";
import { useScroll } from "framer-motion";

// ── Config ────────────────────────────────────────────────────────────────────

const PARTICLE_COUNT = 140; // 120 map to grid, 20 fade out
const GRID_COLS = 10;
const GRID_ROWS = 12;
const GRID_COUNT = GRID_COLS * GRID_ROWS; // 120

const P1_END = 0.25; // chaos → organize
const P2_END = 0.60; // organize → clarity
const P3_END = 0.90; // clarity → dissolve

// ── Math utils ────────────────────────────────────────────────────────────────

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));
const easeOutQuart = (t: number) => 1 - Math.pow(1 - t, 4);
const easeInOutCubic = (t: number) =>
  t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

// ── Particle ──────────────────────────────────────────────────────────────────

interface Particle {
  // Normalized chaos position (mutated each frame during drift)
  cx: number;
  cy: number;
  // Drift velocity (normalized per-frame)
  dvx: number;
  dvy: number;
  // Wobble
  wobblePhase: number;
  wobbleFreq: number;
  wobbleAmp: number;
  // Visual
  chaosSize: number;
  chaosOpacity: number;
  // Normalized grid target; null → fade out during organize
  gx: number | null;
  gy: number | null;
  // Per-particle stagger delay (0–1) so the grid forms organically
  delay: number;
}

function buildParticles(): Particle[] {
  const padX = 0.13;
  const padY = 0.10;

  // Build 120 grid positions (normalized 0-1)
  const gPositions = Array.from({ length: GRID_COUNT }, (_, i) => ({
    gx: padX + ((i % GRID_COLS) / (GRID_COLS - 1)) * (1 - 2 * padX),
    gy: padY + (Math.floor(i / GRID_COLS) / (GRID_ROWS - 1)) * (1 - 2 * padY),
  }));

  return Array.from({ length: PARTICLE_COUNT }, (_, i) => ({
    cx: Math.random(),
    cy: Math.random(),
    dvx: (Math.random() - 0.5) * 0.00007,
    dvy: (Math.random() - 0.5) * 0.00007,
    wobblePhase: Math.random() * Math.PI * 2,
    wobbleFreq: 0.2 + Math.random() * 0.6,
    wobbleAmp: 0.004 + Math.random() * 0.007,
    chaosSize: 1 + Math.random() * 2,
    chaosOpacity: 0.15 + Math.random() * 0.30,
    gx: i < GRID_COUNT ? (gPositions[i]?.gx ?? null) : null,
    gy: i < GRID_COUNT ? (gPositions[i]?.gy ?? null) : null,
    delay: Math.random(),
  }));
}

// ── Component ─────────────────────────────────────────────────────────────────

export function SignalFromNoise() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const boundsRef = useRef<[number, number]>([0, 10000]);
  const rafRef    = useRef(0);

  const reducedMotion =
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const { scrollY } = useScroll();

  // Measure [heroTop, footerTop] in document pixels; re-measure on layout change
  useEffect(() => {
    function measure() {
      const hero   = document.getElementById("hero");
      const footer = document.getElementById("footer");
      if (!hero || !footer) return;
      const hy = hero.getBoundingClientRect().top   + window.scrollY;
      const fy = footer.getBoundingClientRect().top + window.scrollY;
      // End just before the footer enters the viewport (i.e. top of footer reaches bottom of window)
      const endScroll = fy - window.innerHeight;
      boundsRef.current = [hy, Math.max(hy + 1, endScroll)];
    }

    measure();

    // Observe body for resizes (which captures all layout shifts, dynamic mounts, and accordion expansions)
    const ro = new ResizeObserver(measure);
    ro.observe(document.body);

    window.addEventListener("resize", measure);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, []);

  // Canvas setup + RAF draw loop (single effect → stable closure)
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    canvas.width  = window.innerWidth;
    canvas.height = window.innerHeight;

    const particles = buildParticles();
    const ctx = canvas.getContext("2d")!;

    function onResize() {
      canvas!.width  = window.innerWidth;
      canvas!.height = window.innerHeight;
    }
    window.addEventListener("resize", onResize);

    // If user prefers reduced motion, skip to phase 3 immediately
    const staticP = reducedMotion ? 0.75 : -1;

    function draw(ts: number) {
      rafRef.current = requestAnimationFrame(draw);
      const w = canvas!.width;
      const h = canvas!.height;
      if (!w || !h) return;

      // Scroll progress [0, 1] mapped to hero→footer
      const [start, end] = boundsRef.current;
      const rawSY = scrollY.get();
      const p = staticP >= 0
        ? staticP
        : clamp((rawSY - start) / (end - start), 0, 1);

      const t = ts / 1000; // seconds

      // Phase 4 global dissolve
      let globalAlpha = 1;
      if (p > P3_END) {
        globalAlpha = 1 - easeInOutCubic(clamp((p - P3_END) / (1 - P3_END), 0, 1));
      }

      ctx.clearRect(0, 0, w, h);
      if (globalAlpha < 0.005) return;

      // Phase 3 clarity: compute clarityT for settling opacity + breathe
      const clarityT = clamp((p - P2_END) / (P3_END - P2_END), 0, 1);

      // Breathe pulse: scale 1 → 1.015 → 1 every 3 s, fades in during clarity
      const breathe = p >= P2_END
        ? 1 + 0.015 * Math.sin(t * (Math.PI * 2 / 3)) * easeInOutCubic(clarityT)
        : 1;
      const bcx = w / 2;
      const bcy = h / 2;

      ctx.fillStyle = "#ffffff";

      for (const pt of particles) {
        // ── Drift (chaos phase only) ──────────────────────────────────────
        if (p < P1_END && !reducedMotion) {
          pt.cx += pt.dvx;
          pt.cy += pt.dvy;
          if (pt.cx < 0 || pt.cx > 1) { pt.dvx *= -1; pt.cx = clamp(pt.cx, 0, 1); }
          if (pt.cy < 0 || pt.cy > 1) { pt.dvy *= -1; pt.cy = clamp(pt.cy, 0, 1); }
        }

        // ── Per-particle organize progress (staggered) ────────────────────
        let orgT = 0;
        if (p >= P1_END) {
          const raw = clamp((p - P1_END) / (P2_END - P1_END), 0, 1);
          // shift the window per particle so they arrive at different times
          const local = clamp(
            (raw - pt.delay * 0.45) / (1 - pt.delay * 0.45 + 0.001),
            0, 1,
          );
          orgT = easeOutQuart(local);
        }
        if (p >= P2_END) orgT = 1;

        // ── Wobble decreases as particle locks into grid ───────────────────
        const wobble = pt.wobbleAmp * Math.sin(t * pt.wobbleFreq + pt.wobblePhase) * (1 - orgT);

        // ── Position ──────────────────────────────────────────────────────
        let px: number, py: number;

        if (pt.gx !== null && pt.gy !== null) {
          const gxPx = pt.gx * w;
          const gyPx = pt.gy * h;

          if (p >= P2_END) {
            // Clarity / breathe: scale from canvas center
            px = bcx + (gxPx - bcx) * breathe;
            py = bcy + (gyPx - bcy) * breathe;
          } else {
            px = lerp((pt.cx + wobble) * w, gxPx, orgT);
            py = lerp((pt.cy + wobble) * h, gyPx, orgT);
          }
        } else {
          // Non-grid: stay in chaos position until fully faded
          px = (pt.cx + wobble) * w;
          py = (pt.cy + wobble) * h;
        }

        // ── Opacity ───────────────────────────────────────────────────────
        let opacity: number;

        if (p < P1_END) {
          opacity = pt.chaosOpacity;
        } else if (pt.gx !== null) {
          // Grid particle: nudge down slightly during organize, settle to 0.12 in clarity
          const midOp = lerp(pt.chaosOpacity, 0.16, orgT * 0.6);
          opacity = p >= P2_END
            ? lerp(midOp, 0.12, easeInOutCubic(clarityT))
            : midOp;
        } else {
          // Non-grid: fade to 0 during organize
          opacity = lerp(pt.chaosOpacity, 0, orgT);
        }

        if (opacity < 0.005) continue;

        // ── Size ──────────────────────────────────────────────────────────
        const size = p >= P2_END
          ? lerp(pt.chaosSize, 1.5, easeInOutCubic(clarityT))
          : lerp(pt.chaosSize, pt.chaosSize * 0.85 + 1.5 * 0.15, orgT);

        // ── Draw ──────────────────────────────────────────────────────────
        ctx.globalAlpha = globalAlpha * opacity;
        ctx.beginPath();
        ctx.arc(px, py, Math.max(0.5, size / 2), 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.globalAlpha = 1;
    }

    rafRef.current = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener("resize", onResize);
    };
  }, []); // stable — reads scrollY.get() and boundsRef.current directly

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none"
      style={{ zIndex: 0 }}
      aria-hidden="true"
    />
  );
}
