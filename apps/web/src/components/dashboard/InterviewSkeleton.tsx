import { cn } from "@/lib/utils";

// ── Bone ─────────────────────────────────────────────────────────────────────
// Shimmer primitive. Requires the skeleton-shimmer @keyframe from globals.css.
// via-white/[0.04] — intentionally faint for a premium, calm sweep.

function Bone({ className }: { className?: string }) {
  return (
    <div className={cn("relative overflow-hidden rounded-md bg-zinc-800/60", className)}>
      <div className="absolute inset-0 -translate-x-full animate-[skeleton-shimmer_1.8s_ease-in-out_infinite] bg-gradient-to-r from-transparent via-white/[0.04] to-transparent" />
    </div>
  );
}

// ── HistoryCardSkeleton ───────────────────────────────────────────────────────
// Mirrors: div.rounded-xl.border.border-zinc-800.bg-zinc-900/10.p-3.5
//
//   title  → text-xs font-semibold leading-tight  → line-height 1.25 × 12px = 15px  → h-[13px]
//   meta   → text-[9px] font-medium mt-1          → line-height ~12px               → h-[9px]
//
// Total card: 14(p-3.5) + 13 + 6(mt-1.5) + 9 + 14(p-3.5) = 56px
// Three width presets give natural variation across cards.

const HISTORY_TITLE_WIDTHS = ["w-3/4", "w-2/3", "w-4/5"] as const;

export function HistoryCardSkeleton({ index = 0 }: { index?: number }) {
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const titleW = HISTORY_TITLE_WIDTHS[index % HISTORY_TITLE_WIDTHS.length]!;
  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900/10 p-3.5">
      {/* Job title — text-xs font-semibold truncate leading-tight */}
      <Bone className={cn("h-[13px]", titleW)} />
      {/* "difficulty · date" — text-[9px] font-medium mt-1 */}
      <Bone className="h-[9px] w-2/5 mt-1.5" />
    </div>
  );
}

// ── InterviewHistorySkeleton ──────────────────────────────────────────────────
// Mirrors the entire session sidebar:
//   <aside className="w-full md:w-56 shrink-0 flex flex-col gap-3">
//     <div className="flex items-center justify-between border-b border-zinc-800/80 pb-2">
//       <span className="text-[10px] uppercase tracking-widest">History</span>
//     </div>
//     <div className="space-y-1.5 ...">
//       {sessions.map(…)}
//
// Shows 3 history cards — realistic session count for a returning user.
// gap-3 in the aside matches source; space-y-1.5 in the card list matches source.

export function InterviewHistorySkeleton() {
  return (
    <aside className="w-full md:w-56 shrink-0 flex flex-col gap-3">
      {/* Header row — border-b pb-2 */}
      <div className="flex items-center justify-between border-b border-zinc-800/80 pb-2">
        {/* "HISTORY" — text-[10px] uppercase tracking-widest */}
        <Bone className="h-[10px] w-14 rounded" />
      </div>

      {/* Session cards — space-y-1.5 to match source */}
      <div className="space-y-1.5">
        <HistoryCardSkeleton index={0} />
        <HistoryCardSkeleton index={1} />
        <HistoryCardSkeleton index={2} />
      </div>
    </aside>
  );
}

// ── InputFieldSkeleton ────────────────────────────────────────────────────────
// Mirrors a label + text input pair inside the config card.
//   <div className="space-y-2">
//     <label className="text-xs font-semibold uppercase tracking-wider">…</label>
//     <input className="w-full rounded-xl border px-3.5 py-2.5 text-xs" />
//
// Input height: py-2.5(10+10) + text-xs line-height(16) + border(2) = 38px

export function InputFieldSkeleton({
  labelWidth = "w-16",
}: {
  labelWidth?: string;
}) {
  return (
    <div className="space-y-2">
      {/* Label — text-xs uppercase tracking-wider */}
      <Bone className={cn("h-3 rounded", labelWidth)} />
      {/* Input — exact 38px height */}
      <Bone className="h-[38px] w-full rounded-xl" />
    </div>
  );
}

// ── TextareaSkeleton ──────────────────────────────────────────────────────────
// Mirrors label + textarea with rows={3}.
//   height = py-2.5(10+10) + 3 × text-xs line-height(16) + border(2) = 70px

export function TextareaSkeleton({
  labelWidth = "w-28",
}: {
  labelWidth?: string;
}) {
  return (
    <div className="space-y-2">
      {/* Label — includes "(optional)" sub-text, captured in a wider bone */}
      <Bone className={cn("h-3 rounded", labelWidth)} />
      {/* Textarea — 3 rows at text-xs = 70px */}
      <Bone className="h-[70px] w-full rounded-xl" />
    </div>
  );
}

// ── DifficultySelectorSkeleton ────────────────────────────────────────────────
// Mirrors:
//   <div className="space-y-2">
//     <label>Difficulty Level</label>
//     <div className="flex gap-2">
//       <button className="flex-1 rounded-xl border px-3 py-2.5 text-xs">Easy</button>
//       <button className="flex-1 rounded-xl border px-3 py-2.5 text-xs">Medium</button>
//       <button className="flex-1 rounded-xl border px-3 py-2.5 text-xs">Hard</button>
//
// Initial state has difficulty = "medium" selected (amber tint).
// Preserving the selected state on the skeleton tells users a choice is pre-made,
// reducing confusion when real content appears.

export function DifficultySelectorSkeleton() {
  return (
    <div className="space-y-2">
      <Bone className="h-3 w-28 rounded" />
      <div className="flex gap-2">
        {/* Easy */}
        <Bone className="flex-1 h-[38px] rounded-xl" />
        {/* Medium — default selected, subtle amber tint preserves pre-selection */}
        <Bone className="flex-1 h-[38px] rounded-xl bg-amber-900/30" />
        {/* Hard */}
        <Bone className="flex-1 h-[38px] rounded-xl" />
      </div>
    </div>
  );
}

// ── CategoryChipsSkeleton ─────────────────────────────────────────────────────
// Mirrors:
//   <div className="flex flex-wrap gap-2">
//     {ALL_SECTIONS.map(…) → 6 pills:
//       <button className="px-3.5 py-1.5 rounded-full border text-[11px] font-medium">
//
// Chip height: py-1.5(6+6) + text-[11px] line-height(16) + border(2) = 30px
//
// Per-chip widths derived from character count at text-[11px] font-medium (~6px/char):
//   "Data Structures & Algorithms" = 28 chars × 6 + 2×14(px-3.5) + 2(border) = 204px → w-52 (208px)
//   "System Design"                = 13 chars × 6 + 30 = 108px                        → w-28 (112px)
//   "SQL & Databases"              = 15 chars × 6 + 30 = 120px                        → w-32 (128px)
//   "Behavioral"                   = 10 chars × 6 + 30 =  90px                        → w-24  (96px)
//   "Coding Practices"             = 16 chars × 6 + 30 = 126px                        → w-32 (128px)
//   "Language Specific"            = 17 chars × 6 + 30 = 132px                        → w-36 (144px)
//
// These widths cause the same flex-wrap break points as the real text on all viewports.

const CHIP_CONFIGS = [
  { width: "w-52",       label: "dsa"               },  // Data Structures & Algorithms
  { width: "w-28",       label: "system_design"      },  // System Design
  { width: "w-32",       label: "sql"                },  // SQL & Databases
  { width: "w-24",       label: "behavioral"         },  // Behavioral
  { width: "w-32",       label: "coding"             },  // Coding Practices
  { width: "w-36",       label: "language_specific"  },  // Language Specific
] as const;

export function CategoryChipsSkeleton() {
  return (
    <div className="space-y-2">
      {/* "QUESTION CATEGORIES (leave empty…)" — main label + sub-label approximated */}
      <Bone className="h-3 w-40 rounded" />
      {/* Chips — same container classes as source */}
      <div className="flex flex-wrap gap-2">
        {CHIP_CONFIGS.map((chip) => (
          <Bone
            key={chip.label}
            className={cn("h-[30px] rounded-full", chip.width)}
          />
        ))}
      </div>
    </div>
  );
}

// ── ActionSectionSkeleton ─────────────────────────────────────────────────────
// Mirrors:
//   <div className="flex flex-col sm:flex-row items-end gap-3 pt-2">
//     <div className="space-y-2 w-full sm:w-32 shrink-0">
//       <label>Count</label>
//       <input type="number" className="w-full rounded-xl ... py-2.5" />
//     </div>
//     <Button className="w-full bg-brand h-[38px] rounded-xl">Generate Mock Interview</Button>
//   </div>
//
// Count input: w-full on mobile, w-32 (128px) on sm+, h-[38px]
// Generate button: w-full, h-[38px] exactly, bg-brand/20 to preserve CTA visual weight

export function ActionSectionSkeleton() {
  return (
    <div className="flex flex-col sm:flex-row items-end gap-3 pt-2">
      {/* Count input + label */}
      <div className="space-y-2 w-full sm:w-32 shrink-0">
        <Bone className="h-3 w-12 rounded" />
        <Bone className="h-[38px] w-full rounded-xl" />
      </div>
      {/* Generate Mock Interview button — bg-brand/20 preserves primary CTA prominence */}
      <Bone className="h-[38px] w-full rounded-xl bg-brand/20" />
    </div>
  );
}

// ── InterviewFormSkeleton ─────────────────────────────────────────────────────
// Mirrors the config panel shell:
//   <div className="rounded-2xl border border-zinc-800 bg-zinc-900/25 backdrop-blur-md p-6 space-y-5 shadow-xl">
//
// space-y-5 (20px) between each section matches the source.
// Helper text at the bottom: text-[10px] — shown when jobTitle is empty (initial state).
// "Enter a target role title above to begin drafting." ≈ 50 chars at 10px ≈ 290px → w-72

export function InterviewFormSkeleton() {
  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-900/25 backdrop-blur-md p-6 space-y-5 shadow-xl">
      {/* Job Title * */}
      <InputFieldSkeleton labelWidth="w-16" />

      {/* Job Description (optional — boosts relevance) */}
      <TextareaSkeleton labelWidth="w-52" />

      {/* Difficulty Level */}
      <DifficultySelectorSkeleton />

      {/* Question Categories (leave empty for automated select) */}
      <CategoryChipsSkeleton />

      {/* Count + Generate */}
      <ActionSectionSkeleton />

      {/* Helper text — always visible when jobTitle is empty (initial state) */}
      <Bone className="h-[10px] w-72 rounded" />
    </div>
  );
}

// ── PageHeaderSkeleton ────────────────────────────────────────────────────────
// Mirrors:
//   <div className="flex items-center justify-between">
//     <div>
//       <h1 className="text-xl font-bold tracking-tight flex items-center gap-2">
//         Interview Prep Coach
//         <span className="text-[9px] px-1.5 py-0.5 rounded bg-zinc-900 border border-zinc-800">AI</span>
//       </h1>
//       <p className="text-xs text-zinc-400 mt-1">…description…</p>
//
// h1: text-xl → line-height 1.75rem = 28px → h-7
// AI badge: text-[9px] px-1.5 py-0.5 → ~18px tall × ~27px wide
// description: text-xs mt-1 → h-3 (12px) at mt-2 (visual gap)
//
// The "Edit Setup" button is excluded — only visible when questions exist (not on initial load).

export function PageHeaderSkeleton() {
  return (
    <div className="flex items-center justify-between">
      <div>
        {/* h1 row — flex items-center gap-2 */}
        <div className="flex items-center gap-2">
          {/* "Interview Prep Coach" — text-xl font-bold */}
          <Bone className="h-7 w-48 rounded-lg" />
          {/* "AI" badge — text-[9px] px-1.5 py-0.5 rounded */}
          <Bone className="h-[18px] w-7 rounded" />
        </div>
        {/* Description — text-xs mt-1 */}
        <Bone className="h-3 w-72 max-w-full mt-2 rounded" />
      </div>
    </div>
  );
}

// ── InterviewPageSkeleton ─────────────────────────────────────────────────────
// Root skeleton. Mirrors the page shell exactly:
//   <div className="relative min-h-[calc(100vh)] bg-bg-base bg-grid-dots overflow-hidden">
//     ambient orbs × 2
//     <div className="relative z-10 mx-auto max-w-4xl py-8 px-6 flex flex-col md:flex-row gap-6">
//       aside (sidebar)
//       main  (flex-1 min-w-0 space-y-6)
//
// Ambient orbs are real divs — they're always-visible chrome, not data.
// Keeping bg-grid-dots + orbs means zero visual flash on transition.
//
// Responsive behavior matches source exactly:
//   Mobile  → flex-col: sidebar stacks ABOVE the form
//   md+     → flex-row: sidebar beside the form (w-56 fixed, form takes flex-1)

export function InterviewPageSkeleton() {
  return (
    <div className="relative min-h-[calc(100vh)] bg-bg-base bg-grid-dots overflow-hidden">
      {/* Ambient glow — always-visible chrome, preserved in skeleton */}
      <div className="ambient-glow-orb w-[600px] h-[600px] -top-40 -left-20 animate-float-1" />
      <div className="ambient-glow-orb w-[500px] h-[500px] bottom-5 right-5 animate-float-2" />

      <div className="relative z-10 mx-auto max-w-4xl py-8 px-6 flex flex-col md:flex-row gap-6">
        {/* Sidebar */}
        <InterviewHistorySkeleton />

        {/* Main content */}
        <div className="flex-1 min-w-0 space-y-6">
          <PageHeaderSkeleton />
          <InterviewFormSkeleton />
        </div>
      </div>
    </div>
  );
}
