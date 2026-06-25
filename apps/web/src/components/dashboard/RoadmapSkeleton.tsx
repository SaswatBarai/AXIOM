import { cn } from "@/lib/utils";

// ── Bone ─────────────────────────────────────────────────────────────────────
// Shimmer primitive. Requires the skeleton-shimmer @keyframe from globals.css.

function Bone({ className }: { className?: string }) {
  return (
    <div className={cn("relative overflow-hidden rounded-md bg-zinc-800/60", className)}>
      <div className="absolute inset-0 -translate-x-full animate-[skeleton-shimmer_1.8s_ease-in-out_infinite] bg-gradient-to-r from-transparent via-white/[0.04] to-transparent" />
    </div>
  );
}

// ── RoadmapHistoryCardSkeleton ────────────────────────────────────────────────
// Mirrors: div.rounded-xl.border.border-zinc-800.bg-zinc-900/10.p-3.5
//
// The roadmap history card has THREE rows (unlike the interview card):
//   1. targetRole  — text-xs font-semibold leading-tight
//   2. progress bar row — flex items-center gap-2 mt-1.5
//        flex-1 h-1.5 rounded-full bar  +  text-[9px] font-bold pct
//   3. "vN · N weeks"  — text-[9px] font-medium mt-1
//
// Card height:
//   14(p-3.5) + 13(title) + 6(mt-1.5) + 6(h-1.5 row) + 4(mt-1) + 9(meta) + 14(p-3.5)
//   = 66px  (matches real card)

const ROADMAP_TITLE_WIDTHS = ["w-3/4", "w-2/3", "w-4/5"] as const;

export function RoadmapHistoryCardSkeleton({ index = 0 }: { index?: number }) {
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const titleW = ROADMAP_TITLE_WIDTHS[index % ROADMAP_TITLE_WIDTHS.length]!;
  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900/10 p-3.5">
      {/* targetRole — text-xs font-semibold leading-tight pr-4 */}
      <Bone className={cn("h-[13px]", titleW)} />

      {/* Mini progress bar row — flex items-center gap-2 mt-1.5 */}
      <div className="flex items-center gap-2 mt-1.5">
        {/* flex-1 h-1.5 rounded-full bg-zinc-950 border overflow-hidden */}
        <Bone className="flex-1 h-1.5 rounded-full" />
        {/* text-[9px] font-bold leading-none  e.g. "42%" */}
        <Bone className="h-[9px] w-5 shrink-0 rounded" />
      </div>

      {/* "vN · N weeks" — text-[9px] font-medium mt-1 */}
      <Bone className="h-[9px] w-24 mt-1 rounded" />
    </div>
  );
}

// ── RoadmapSidebarSkeleton ────────────────────────────────────────────────────
// Mirrors the full sidebar:
//   <aside className="w-full md:w-56 shrink-0 flex flex-col gap-3">
//     <div className="flex items-center justify-between border-b border-zinc-800/80 pb-2">
//       <span className="text-[10px] font-bold uppercase tracking-widest font-mono">Roadmaps</span>
//     </div>
//     <div className="space-y-1.5 …">
//       {roadmaps.map(…)}
//
// "ROADMAPS" at text-[10px] font-mono uppercase tracking-widest:
//   8 chars × ~7px + tracking-widest (0.25em × 10px × 7 gaps) = 56 + 17.5 ≈ 73px → w-20 (80px)

export function RoadmapSidebarSkeleton() {
  return (
    <aside className="w-full md:w-56 shrink-0 flex flex-col gap-3">
      {/* Header row */}
      <div className="flex items-center justify-between border-b border-zinc-800/80 pb-2">
        <Bone className="h-[10px] w-20 rounded" />
      </div>

      {/* Roadmap cards */}
      <div className="space-y-1.5">
        <RoadmapHistoryCardSkeleton index={0} />
        <RoadmapHistoryCardSkeleton index={1} />
        <RoadmapHistoryCardSkeleton index={2} />
      </div>
    </aside>
  );
}

// ── InputFieldSkeleton ────────────────────────────────────────────────────────
// Mirrors: <div className="space-y-2 {containerClassName}">
//   <label className="text-xs font-semibold uppercase tracking-wider">…</label>
//   <input className="w-full rounded-xl border px-3.5 py-2.5 text-xs" />
//
// Input height: py-2.5(10+10) + text-xs line-height(16) + border(2) = 38px
// containerClassName allows "w-full sm:w-32" for the weeks field.

export function InputFieldSkeleton({
  labelWidth = "w-24",
  containerClassName,
}: {
  labelWidth?: string;
  containerClassName?: string;
}) {
  return (
    <div className={cn("space-y-2", containerClassName)}>
      <Bone className={cn("h-3 rounded", labelWidth)} />
      <Bone className="h-[38px] w-full rounded-xl" />
    </div>
  );
}

// ── ButtonSkeleton ────────────────────────────────────────────────────────────
// Mirrors: <Button className="w-full bg-brand h-[38px] rounded-xl text-xs …" />
//
// bg-brand/20 preserves the CTA's visual prominence — users can locate the
// primary action before the skeleton resolves. Not using bg-zinc-800/60 here
// because that would make the CTA visually indistinguishable from the inputs.

export function ButtonSkeleton() {
  return <Bone className="h-[38px] w-full rounded-xl bg-brand/20" />;
}

// ── HelperTextSkeleton ────────────────────────────────────────────────────────
// Mirrors the two-sentence helper paragraph:
//   "Uses your latest skill gap report to prioritize missing skills."
//   "Re-generating creates a versioned new roadmap; old ones are preserved."
//
// text-[10px] leading-normal → each line ≈ 12–14px tall.
// Two separate bones (not one rectangle) communicate "text content" not "block".
// At desktop container width (~550px), both sentences fit on one line each.
// Line widths approximate character-count-based proportions.

export function HelperTextSkeleton() {
  return (
    <div className="space-y-1.5">
      {/* "Uses your latest skill gap report to prioritize missing skills." ~62 chars */}
      <Bone className="h-[10px] w-4/5 rounded" />
      {/* "Re-generating creates a versioned new roadmap; old ones are preserved." ~70 chars */}
      <Bone className="h-[10px] w-full rounded" />
    </div>
  );
}

// ── RoadmapFormSkeleton ───────────────────────────────────────────────────────
// Mirrors the GeneratePanel shell:
//   <div className="rounded-2xl border border-zinc-800 bg-zinc-900/25 backdrop-blur-md p-6 space-y-5 shadow-xl">
//
// Children separated by space-y-5 (20px):
//   1. Target role field  (label + full-width input)
//   2. Weeks field        (label + w-full sm:w-32 input)
//   3. Generate button    (w-full h-[38px] bg-brand)
//   4. Helper text        (2 lines at text-[10px])
//
// Label widths derived from character count at text-xs (12px) font-semibold uppercase tracking-wider:
//   "TARGET ROLE *" → 13 chars × ~8.7px = 113px → w-28 (112px)
//   "WEEKS (4–52)"  → 12 chars × ~8.7px = 104px → w-28 (112px)

export function RoadmapFormSkeleton() {
  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-900/25 backdrop-blur-md p-6 space-y-5 shadow-xl">
      {/* Target role — w-full */}
      <InputFieldSkeleton labelWidth="w-28" />

      {/* Weeks — w-full sm:w-32 (mirrors source exactly) */}
      <InputFieldSkeleton
        labelWidth="w-28"
        containerClassName="w-full sm:w-32"
      />

      {/* Generate Roadmap button */}
      <ButtonSkeleton />

      {/* Two-line helper text */}
      <HelperTextSkeleton />
    </div>
  );
}

// ── PageHeaderSkeleton ────────────────────────────────────────────────────────
// Mirrors:
//   <div className="flex items-center justify-between">
//     <div>
//       <h1 className="text-xl font-bold tracking-tight flex items-center gap-2">
//         Career Roadmap
//         <span className="text-[9px] px-1.5 py-0.5 rounded …">AI</span>
//       </h1>
//       <p className="text-xs text-zinc-400 mt-1">Week-by-week skill plan…</p>
//     </div>
//
// h1: text-xl → line-height 1.75rem = 28px → h-7
// "Career Roadmap" at 20px bold: 13 chars × ~11px = 143px → w-36 (144px)
// AI badge: text-[9px] px-1.5 py-0.5 rounded → ~18px tall × ~28px wide
// description: text-xs mt-1 → h-3 at mt-2
// "Week-by-week skill plan tailored to your target role" → ~52 chars × 6px = 312px → w-72
//
// Buttons after header ("New Roadmap" / "Hide Configuration") only appear when
// current roadmap exists — excluded from skeleton, not visible on initial load.

export function PageHeaderSkeleton() {
  return (
    <div className="flex items-center justify-between">
      <div>
        {/* h1 row */}
        <div className="flex items-center gap-2">
          {/* "Career Roadmap" — text-xl font-bold */}
          <Bone className="h-7 w-36 rounded-lg" />
          {/* "AI" badge — text-[9px] px-1.5 py-0.5 rounded */}
          <Bone className="h-[18px] w-7 rounded" />
        </div>
        {/* Description — text-xs mt-1 */}
        <Bone className="h-3 w-72 max-w-full mt-2 rounded" />
      </div>
    </div>
  );
}

// ── RoadmapPageSkeleton ───────────────────────────────────────────────────────
// Root component. Mirrors the page shell exactly:
//   <div className="relative min-h-[calc(100vh)] bg-bg-base bg-grid-dots overflow-hidden">
//     ambient orbs × 2
//     <div className="relative z-10 mx-auto max-w-4xl py-8 px-6 flex flex-col md:flex-row gap-6">
//
// Ambient orbs and bg-grid-dots are always-visible chrome — keeping them in
// the skeleton means zero visual flash when real content replaces the skeleton.
//
// Responsive behavior (verbatim from source):
//   Mobile  → flex-col: sidebar stacks ABOVE the form
//   md+     → flex-row: sidebar beside the form (w-56 fixed, form takes flex-1)

export function RoadmapPageSkeleton() {
  return (
    <div className="relative min-h-[calc(100vh)] bg-bg-base bg-grid-dots overflow-hidden">
      {/* Ambient glow — always-visible UI chrome */}
      <div className="ambient-glow-orb w-[600px] h-[600px] -top-40 -left-20 animate-float-1" />
      <div className="ambient-glow-orb w-[500px] h-[500px] bottom-5 right-5 animate-float-2" />

      <div className="relative z-10 mx-auto max-w-4xl py-8 px-6 flex flex-col md:flex-row gap-6">
        {/* Sidebar */}
        <RoadmapSidebarSkeleton />

        {/* Main content */}
        <div className="flex-1 min-w-0 space-y-6">
          <PageHeaderSkeleton />
          <RoadmapFormSkeleton />
        </div>
      </div>
    </div>
  );
}
