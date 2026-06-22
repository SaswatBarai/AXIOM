import { cn } from "@/lib/utils";

// ── Bone ─────────────────────────────────────────────────────────────────────
// Base shimmer primitive. The `skeleton-shimmer` keyframe is in globals.css.
// Every skeleton element in this file uses Bone — no mixing with animate-pulse.

function Bone({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-md bg-zinc-800/60",
        className
      )}
    >
      <div className="absolute inset-0 -translate-x-full animate-[skeleton-shimmer_1.8s_ease-in-out_infinite] bg-gradient-to-r from-transparent via-white/[0.04] to-transparent" />
    </div>
  );
}

// ── Card widths ───────────────────────────────────────────────────────────────
// Three presets to give natural variation across cards without randomness.

const CARD_PRESETS = [
  { title: "w-3/4", company: "w-1/2",  location: "w-16", date: "w-12" },
  { title: "w-2/3", company: "w-2/5",  location: "w-20", date: "w-10" },
  { title: "w-4/5", company: "w-3/5",  location: "w-14", date: "w-14" },
] as const;

// ── ApplicationCardSkeleton ───────────────────────────────────────────────────
// Mirrors: div.rounded-lg.border.border-zinc-850.bg-zinc-900/60.p-3
//   h3.text-xs.font-semibold  → h-[14px]  (text-xs line-height = 1rem = 16px, -2px visual)
//   p.text-[11px]             → h-[11px]  (exact font-size match)
//   metadata row: MapPin(9) + text + Clock(9) + text  → 10px tall

export function ApplicationCardSkeleton({ preset = 0 }: { preset?: number }) {
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const p = CARD_PRESETS[preset % CARD_PRESETS.length]!;
  return (
    <div className="rounded-lg border border-zinc-800/80 bg-zinc-900/60 p-3">
      {/* Job title — text-xs font-semibold */}
      <Bone className={cn("h-[14px]", p.title)} />

      {/* Company — text-[11px] */}
      <Bone className={cn("h-[11px] mt-1.5", p.company)} />

      {/* Metadata row — text-[10px], flex justify-between */}
      <div className="flex items-center justify-between mt-3">
        {/* MapPin(9) + location text */}
        <div className="flex items-center gap-1">
          <Bone className="h-[9px] w-[9px] rounded-sm shrink-0" />
          <Bone className={cn("h-[10px]", p.location)} />
        </div>
        {/* Clock(9) + date text */}
        <div className="flex items-center gap-1">
          <Bone className="h-[9px] w-[9px] rounded-sm shrink-0" />
          <Bone className={cn("h-[10px]", p.date)} />
        </div>
      </div>
    </div>
  );
}

// ── Column config ─────────────────────────────────────────────────────────────
// Exactly matches the COLUMNS array in page.tsx — dot colors, border/bg tints,
// and label widths derived from character count at text-xs font-semibold.

const COLUMN_CONFIGS = [
  {
    dot: "bg-zinc-500",
    labelW: "w-10",    // "Saved" (5 chars)
    border: "border-zinc-900/60 bg-zinc-900/10",
    cards: 3,
  },
  {
    dot: "bg-blue-500",
    labelW: "w-14",    // "Applied" (7 chars)
    border: "border-blue-900/60 bg-blue-950/10",
    cards: 2,
  },
  {
    dot: "bg-amber-500",
    labelW: "w-28",    // "Online Assessment" (17 chars)
    border: "border-amber-900/60 bg-amber-950/10",
    cards: 1,
  },
  {
    dot: "bg-teal-500",
    labelW: "w-20",    // "Interviewing" (12 chars)
    border: "border-teal-900/60 bg-teal-950/10",
    cards: 1,
  },
  {
    dot: "bg-emerald-500",
    labelW: "w-12",    // "Offers" (6 chars)
    border: "border-emerald-900/60 bg-emerald-950/10",
    cards: 1,
  },
  {
    dot: "bg-rose-500",
    labelW: "w-16",    // "Rejected" (8 chars)
    border: "border-rose-900/60 bg-rose-950/10",
    cards: 0,
  },
  {
    dot: "bg-zinc-600",
    labelW: "w-20",    // "Withdrawn" (9 chars)
    border: "border-zinc-800/40 bg-zinc-950/10",
    cards: 0,
  },
] as const;

// ── KanbanColumnSkeleton ──────────────────────────────────────────────────────
// Mirrors: div.flex-shrink-0.w-80.rounded-xl.border.p-4.min-h-[500px].flex.flex-col.gap-3
//   Column header: dot + label skeleton + count badge skeleton
//   Cards area: flex flex-col gap-2.5 with ApplicationCardSkeleton instances
//   Empty state: dashed border placeholder (matches the real empty-state div)

export function KanbanColumnSkeleton({
  dot,
  labelW,
  border,
  cards,
}: (typeof COLUMN_CONFIGS)[number]) {
  return (
    <div
      className={cn(
        "flex-shrink-0 w-80 rounded-xl border p-4 min-h-[500px] flex flex-col gap-3",
        border
      )}
    >
      {/* Column header — pb-2 border-b border-zinc-850 */}
      <div className="flex items-center justify-between pb-2 border-b border-zinc-800/60">
        <div className="flex items-center gap-2">
          {/* Dot — real color preserved, it's UI chrome not data */}
          <div className={cn("w-1.5 h-1.5 rounded-full shrink-0", dot)} />
          {/* Label text */}
          <Bone className={cn("h-[13px]", labelW)} />
        </div>
        {/* Count badge — px-2 py-0.5 rounded font-mono text-[10px] */}
        <Bone className="h-5 w-7 rounded" />
      </div>

      {/* Cards or empty drop zone */}
      <div className="flex-1 flex flex-col gap-2.5">
        {cards > 0
          ? Array.from({ length: cards }).map((_, i) => (
              <ApplicationCardSkeleton key={i} preset={i} />
            ))
          : (
            <div className="flex-1 min-h-[80px] rounded-lg border border-dashed border-zinc-800/50" />
          )}
      </div>
    </div>
  );
}

// ── KanbanBoardSkeleton ───────────────────────────────────────────────────────
// Mirrors: div.flex.gap-4.overflow-x-auto.pb-6.scrollbar-thin
// Always horizontally scrollable — real page never collapses to single column.

export function KanbanBoardSkeleton() {
  return (
    <div className="flex gap-4 overflow-x-auto pb-6 scrollbar-thin scrollbar-thumb-zinc-800 scrollbar-track-transparent">
      {COLUMN_CONFIGS.map((col, i) => (
        <KanbanColumnSkeleton key={i} {...col} />
      ))}
    </div>
  );
}

// ── FilterBarSkeleton ─────────────────────────────────────────────────────────
// Mirrors: div.flex.flex-col.gap-3.p-4.rounded-xl.border.border-zinc-800.bg-zinc-900/40.mb-8
//   Inner row: flex flex-wrap items-center gap-3
//   Input heights: py-2 text-xs → line-height 16px + 8+8px padding + 2px border = 34px

export function FilterBarSkeleton() {
  return (
    <div className="flex flex-col gap-3 p-4 rounded-xl border border-zinc-800 bg-zinc-900/40 mb-8">
      <div className="flex flex-wrap items-center gap-3">
        {/* Search input — flex-1 min-w-[200px], Search icon inside */}
        <Bone className="h-[34px] flex-1 min-w-[200px] rounded-lg" />

        {/* Status select */}
        <Bone className="h-[34px] w-32 rounded-lg" />

        {/* Date range: [date input] "to" [date input] */}
        <div className="flex items-center gap-2">
          <Bone className="h-[34px] w-36 rounded-lg" />
          <span className="text-zinc-700 text-xs font-mono select-none">to</span>
          <Bone className="h-[34px] w-36 rounded-lg" />
        </div>

        {/* Apply Filters button — bg-brand text-black px-4 py-2 */}
        <Bone className="h-[34px] w-24 rounded-lg" />

        {/* Clear button — bg-zinc-800 px-3 py-2 */}
        <Bone className="h-[34px] w-14 rounded-lg" />
      </div>
    </div>
  );
}

// ── MetricsSkeleton ───────────────────────────────────────────────────────────
// Mirrors: div.grid.grid-cols-2.sm:grid-cols-4.gap-3.bg-zinc-900/30.p-3.rounded-xl.border.border-zinc-800
//   Each cell: px-3 py-1 flex flex-col border-r border-zinc-800 last:border-0
//   Label: text-[10px] uppercase tracking-wider  → h-[10px]
//   Value: text-lg font-bold                      → h-[26px]  (text-lg = 18px + leading)

const METRIC_CELLS = [
  { label: "w-8",  value: "w-8"  },   // "Total"          → value like "12"
  { label: "w-10", value: "w-7"  },   // "Active"         → value like "5"
  { label: "w-10", value: "w-5"  },   // "Offers"         → value like "1"
  { label: "w-20", value: "w-9"  },   // "Avg Interview"  → value like "14d"
] as const;

export function MetricsSkeleton() {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-zinc-900/30 p-3 rounded-xl border border-zinc-800">
      {METRIC_CELLS.map((cell, i) => (
        <div
          key={i}
          className={cn(
            "px-3 py-1 flex flex-col gap-2",
            i < METRIC_CELLS.length - 1 && "border-r border-zinc-800"
          )}
        >
          <Bone className={cn("h-[10px]", cell.label)} />
          <Bone className={cn("h-[26px]", cell.value)} />
        </div>
      ))}
    </div>
  );
}

// ── ApplicationPageSkeleton ───────────────────────────────────────────────────
// Root component. Mirrors the page's root div:
//   div.p-6.md:p-8.max-w-7xl.mx-auto.min-h-screen.text-white
//
// Header row: flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8
//   Left: h1 (text-2xl md:text-3xl font-bold) + p (text-sm text-zinc-500 mt-1)
//   Right: <MetricsSkeleton />

export function ApplicationPageSkeleton() {
  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto min-h-screen text-white">
      {/* Header ── matches: flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8 */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
        <div className="space-y-2">
          {/* h1 — text-2xl md:text-3xl font-bold tracking-tight */}
          <Bone className="h-8 w-52 md:w-60 rounded-lg" />
          {/* p — text-sm text-zinc-500 mt-1 */}
          <Bone className="h-4 w-72 max-w-full" />
        </div>

        {/* Stats widget */}
        <MetricsSkeleton />
      </div>

      {/* Filter bar */}
      <FilterBarSkeleton />

      {/* Kanban board */}
      <KanbanBoardSkeleton />
    </div>
  );
}
