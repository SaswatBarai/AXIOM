import { cn } from "@/lib/utils";

// ── Bone ─────────────────────────────────────────────────────────────────────
// Shimmer primitive. Uses the skeleton-shimmer @keyframes from globals.css.
// via-white/[0.04] — intentionally faint so the sweep reads as premium, not loading-bar.

function Bone({ className }: { className?: string }) {
  return (
    <div className={cn("relative overflow-hidden rounded-md bg-zinc-800/60", className)}>
      <div className="absolute inset-0 -translate-x-full animate-[skeleton-shimmer_1.8s_ease-in-out_infinite] bg-gradient-to-r from-transparent via-white/[0.04] to-transparent" />
    </div>
  );
}

// ── RoleCardSkeleton ──────────────────────────────────────────────────────────
// Mirrors: button.rounded-xl.border.border-zinc-800.bg-zinc-900/30.px-3.py-3.text-left
//
// Card interior heights derived from source typography:
//   title  → text-xs font-semibold truncate → line-height 1rem → 16px → h-[14px] (visual ink, not cap-height)
//   desc   → text-[9px] truncate mt-0.5     → line-height ~13px → h-[9px]
//   mt-0.5 → 2px between title and desc
//
// Total card: 12(py-3) + 14 + 2 + 9 + 12(py-3) = 49px → matches source without border height.

const ROLE_PRESETS = [
  { titleW: "w-3/4", descW: "w-full"  },
  { titleW: "w-2/3", descW: "w-5/6"  },
  { titleW: "w-4/5", descW: "w-full"  },
  { titleW: "w-1/2", descW: "w-3/4"  },
  { titleW: "w-3/5", descW: "w-full"  },
  { titleW: "w-4/5", descW: "w-5/6"  },
] as const;

export function RoleCardSkeleton({ index = 0 }: { index?: number }) {
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const preset = ROLE_PRESETS[index % ROLE_PRESETS.length]!;
  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900/30 px-3 py-3">
      {/* Role title — text-xs font-semibold truncate */}
      <Bone className={cn("h-[14px]", preset.titleW)} />
      {/* Description — text-[9px] truncate mt-0.5 */}
      <Bone className={cn("h-[9px] mt-[6px]", preset.descW)} />
    </div>
  );
}

// ── RoleGridSkeleton ──────────────────────────────────────────────────────────
// Mirrors the inner role picker section:
//   <div className="space-y-2">
//     <label className="text-xs font-semibold uppercase tracking-wider">…</label>
//     <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
//       {roles.map(…)}
//
// 6 cards fills 2 rows on desktop (3-col) and 3 rows on mobile (2-col).
// This matches the expected role count from the API.

export function RoleGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="space-y-2">
      {/* "Select Target Role" label — text-xs uppercase tracking-wider */}
      <Bone className="h-3 w-36 rounded" />
      {/* Role grid — exact same breakpoint classes as source */}
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
        {Array.from({ length: count }).map((_, i) => (
          <RoleCardSkeleton key={i} index={i} />
        ))}
      </div>
    </div>
  );
}

// ── AnalyzeButtonSkeleton ─────────────────────────────────────────────────────
// Mirrors: <Button className="w-full bg-brand h-10 rounded-xl …" />
// h-10 = 40px. rounded-xl = 12px radius.
// Using bg-brand/20 instead of bg-zinc-800/60 to preserve the button's visual weight
// and prominence — users should understand this is the primary CTA.

export function AnalyzeButtonSkeleton() {
  return <Bone className="h-10 w-full rounded-xl bg-brand/20" />;
}

// ── PageHeaderSkeleton ────────────────────────────────────────────────────────
// Mirrors:
//   <h1 className="text-xl font-bold tracking-tight flex items-center gap-2">
//     Skill Gap Analyzer
//     <span className="text-[9px] px-1.5 py-0.5 rounded …">ATS</span>
//   </h1>
//   <p className="mt-1 text-xs text-zinc-400">Compare your resume…</p>
//
// h1: text-xl → line-height 1.75rem = 28px → h-7
// ATS badge: text-[9px] px-1.5 py-0.5 → ~18px tall × ~30px wide
// Description: text-xs mt-1 → h-3 (12px) at mt-1

export function PageHeaderSkeleton() {
  return (
    <div>
      {/* h1 row — flex items-center gap-2 */}
      <div className="flex items-center gap-2">
        {/* "Skill Gap Analyzer" — text-xl font-bold */}
        <Bone className="h-7 w-44 rounded-lg" />
        {/* "ATS" badge — text-[9px] px-1.5 py-0.5 rounded */}
        <Bone className="h-[18px] w-8 rounded" />
      </div>
      {/* Description — text-xs mt-1 */}
      <Bone className="h-3 w-4/5 mt-2 rounded" />
    </div>
  );
}

// ── SkillGapPageSkeleton ──────────────────────────────────────────────────────
// Root component. Mirrors the page shell exactly:
//   <div className="relative min-h-[calc(100vh)] bg-bg-base bg-grid-dots overflow-hidden">
//     <div ambient-glow-orb × 2 />
//     <div className="relative z-10 mx-auto max-w-3xl space-y-8 py-8 px-6">
//       …header…
//       …controls card…
//
// Ambient orbs are rendered as real divs — they're always-visible chrome, not data.
// The bg-grid-dots and glow preserve visual context so the skeleton reads as a
// continuation of the app rather than a blank white flash.

export function SkillGapPageSkeleton() {
  return (
    <div className="relative min-h-[calc(100vh)] bg-bg-base bg-grid-dots overflow-hidden">
      {/* Ambient glow — always visible, kept as real elements */}
      <div className="ambient-glow-orb w-[600px] h-[600px] -top-40 -left-20 animate-float-1" />
      <div className="ambient-glow-orb w-[500px] h-[500px] bottom-5 right-5 animate-float-2" />

      <div className="relative z-10 mx-auto max-w-3xl space-y-8 py-8 px-6">
        {/* Header */}
        <PageHeaderSkeleton />

        {/* Controls card — exact shell from source */}
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/25 backdrop-blur-md p-6 space-y-5 shadow-xl">
          <RoleGridSkeleton />
          <AnalyzeButtonSkeleton />
        </div>
      </div>
    </div>
  );
}
