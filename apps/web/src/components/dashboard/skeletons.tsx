import { Skeleton } from "@/components/ui/skeleton";

// ── Shared pulse shimmer ──────────────────────────────────────────────────────

function S({ className }: { className?: string }) {
  return <Skeleton className={className} />;
}

// ─────────────────────────────────────────────────────────────────────────────
// Analytics skeleton
// ─────────────────────────────────────────────────────────────────────────────

function KpiCardSkeleton() {
  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-950/40 p-5 space-y-3">
      <div className="flex items-center justify-between">
        <S className="h-3 w-24" />
        <S className="h-7 w-7 rounded-lg" />
      </div>
      <S className="h-8 w-16" />
      <S className="h-2.5 w-32" />
    </div>
  );
}

function ChartSkeleton({ height = "h-48" }: { height?: string }) {
  return (
    <div className={`rounded-xl border border-zinc-800 bg-zinc-950/40 p-5 space-y-4 ${height}`}>
      <div className="flex items-center justify-between">
        <S className="h-3.5 w-36" />
        <S className="h-3 w-20" />
      </div>
      <div className="flex-1 flex items-end gap-2 h-32">
        {Array.from({ length: 8 }).map((_, i) => (
          <S
            key={i}
            className="flex-1 rounded-t-md"
            style={{ height: `${30 + Math.abs(Math.sin(i) * 70)}%` }}
          />
        ))}
      </div>
    </div>
  );
}

export function AnalyticsSkeleton() {
  return (
    <div className="h-full overflow-y-auto p-6 space-y-6 max-w-5xl">
      {/* Header + date range */}
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <S className="h-7 w-40" />
          <S className="h-3.5 w-56" />
        </div>
        <div className="flex gap-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <S key={i} className="h-8 w-20 rounded-full" />
          ))}
        </div>
      </div>

      {/* KPI grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => <KpiCardSkeleton key={i} />)}
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <ChartSkeleton height="h-64" />
        <ChartSkeleton height="h-64" />
      </div>

      {/* Single wide chart */}
      <ChartSkeleton height="h-64" />
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Applications (Kanban) skeleton
// ─────────────────────────────────────────────────────────────────────────────

function KanbanCardSkeleton() {
  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-950/20 p-3.5 space-y-2.5">
      <div className="flex items-start justify-between gap-2">
        <div className="space-y-1.5 flex-1">
          <S className="h-3 w-3/4" />
          <S className="h-2.5 w-1/2" />
        </div>
        <S className="h-5 w-5 rounded shrink-0" />
      </div>
      <div className="flex gap-1.5 pt-0.5">
        <S className="h-4 w-16 rounded-full" />
        <S className="h-4 w-12 rounded-full" />
      </div>
    </div>
  );
}

function KanbanColumnSkeleton({ cards = 2 }: { cards?: number }) {
  return (
    <div className="min-w-[220px] flex-1 rounded-xl border border-zinc-800 bg-zinc-950/10 p-3 space-y-3">
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-2">
          <S className="h-2 w-2 rounded-full" />
          <S className="h-3 w-20" />
        </div>
        <S className="h-5 w-5 rounded-full" />
      </div>
      <div className="space-y-2">
        {Array.from({ length: cards }).map((_, i) => <KanbanCardSkeleton key={i} />)}
      </div>
    </div>
  );
}

export function ApplicationsSkeleton() {
  return (
    <div className="h-full overflow-y-auto p-6 space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <S className="h-7 w-44" />
          <S className="h-3.5 w-60" />
        </div>
        <S className="h-9 w-32 rounded-lg" />
      </div>

      {/* Filter bar */}
      <div className="flex gap-3 flex-wrap">
        <S className="h-8 w-56 rounded-lg" />
        <S className="h-8 w-28 rounded-lg" />
        <S className="h-8 w-28 rounded-lg" />
        <S className="h-8 w-20 rounded-lg" />
      </div>

      {/* Kanban board */}
      <div className="flex gap-3 overflow-x-auto pb-2">
        {[3, 2, 1, 2, 1, 1, 1].map((cards, i) => (
          <KanbanColumnSkeleton key={i} cards={cards} />
        ))}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Jobs skeleton
// ─────────────────────────────────────────────────────────────────────────────

function JobListCardSkeleton() {
  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-950/20 p-4 space-y-3">
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-1.5 flex-1">
          <S className="h-4 w-3/5" />
          <S className="h-3 w-2/5" />
        </div>
        <S className="h-6 w-16 rounded" />
      </div>
      <div className="flex gap-2 flex-wrap">
        <S className="h-4 w-20 rounded-full" />
        <S className="h-4 w-16 rounded-full" />
        <S className="h-4 w-24 rounded-full" />
      </div>
      <div className="space-y-1.5">
        <S className="h-2.5 w-full" />
        <S className="h-2.5 w-4/5" />
      </div>
      <div className="flex items-center justify-between pt-1 border-t border-zinc-900">
        <S className="h-3 w-20" />
        <div className="flex gap-2">
          <S className="h-7 w-16 rounded-lg" />
          <S className="h-7 w-20 rounded-lg" />
        </div>
      </div>
    </div>
  );
}

export function JobsSkeleton() {
  return (
    <div className="h-full overflow-y-auto p-6 space-y-5 max-w-4xl">
      {/* Search + filters */}
      <div className="space-y-3">
        <S className="h-10 w-full rounded-xl" />
        <div className="flex gap-2 flex-wrap">
          {Array.from({ length: 6 }).map((_, i) => (
            <S key={i} className="h-7 w-20 rounded-full" />
          ))}
        </div>
      </div>

      {/* Result count */}
      <S className="h-3 w-28" />

      {/* Job cards */}
      <div className="space-y-3">
        {Array.from({ length: 5 }).map((_, i) => <JobListCardSkeleton key={i} />)}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Settings skeleton
// ─────────────────────────────────────────────────────────────────────────────

function FieldSkeleton() {
  return (
    <div className="grid md:grid-cols-3 gap-2 md:gap-4 items-start py-4 border-b border-zinc-800/60">
      <S className="h-4 w-28 mt-2" />
      <div className="md:col-span-2">
        <S className="h-9 w-full rounded-lg" />
      </div>
    </div>
  );
}

export function SettingsSkeleton() {
  return (
    <div className="h-full overflow-y-auto p-6 max-w-3xl space-y-6">
      {/* Tab bar */}
      <div className="flex gap-1 border-b border-zinc-800 pb-1">
        {Array.from({ length: 4 }).map((_, i) => (
          <S key={i} className="h-9 w-28 rounded-lg" />
        ))}
      </div>

      {/* Form section */}
      <div className="rounded-xl border border-zinc-800 bg-zinc-950/20 p-5 space-y-1">
        <S className="h-5 w-32 mb-4" />
        {Array.from({ length: 6 }).map((_, i) => <FieldSkeleton key={i} />)}
        <div className="flex justify-end pt-3">
          <S className="h-9 w-28 rounded-lg" />
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Skills skeleton
// ─────────────────────────────────────────────────────────────────────────────

export function SkillsSkeleton() {
  return (
    <div className="h-full overflow-y-auto p-6 max-w-3xl space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <S className="h-7 w-36" />
        <S className="h-3.5 w-64" />
      </div>

      {/* Role input */}
      <div className="rounded-xl border border-zinc-800 bg-zinc-950/20 p-4 space-y-3">
        <S className="h-3 w-24" />
        <div className="flex gap-2">
          <S className="h-10 flex-1 rounded-lg" />
          <S className="h-10 w-28 rounded-lg" />
        </div>
      </div>

      {/* Readiness meter */}
      <div className="rounded-xl border border-zinc-800 bg-zinc-950/20 p-5 space-y-4">
        <div className="flex justify-between">
          <S className="h-3.5 w-36" />
          <S className="h-3.5 w-12" />
        </div>
        <S className="h-2 w-full rounded-full" />
      </div>

      {/* Skill tier sections */}
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="rounded-xl border border-zinc-800 bg-zinc-950/20 p-5 space-y-3">
          <div className="flex items-center gap-2">
            <S className="h-4 w-24 rounded" />
            <S className="h-4 w-10 rounded" />
          </div>
          <div className="flex flex-wrap gap-2">
            {Array.from({ length: 6 + i * 2 }).map((_, j) => (
              <S key={j} className="h-8 w-20 rounded-lg" />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Roadmap skeleton
// ─────────────────────────────────────────────────────────────────────────────

function StepCardSkeleton() {
  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-950/20 p-4 space-y-3">
      <div className="flex items-start gap-3">
        <S className="h-5 w-5 rounded-full shrink-0 mt-0.5" />
        <div className="flex-1 space-y-2">
          <S className="h-4 w-3/4" />
          <S className="h-3 w-full" />
          <S className="h-3 w-4/5" />
        </div>
        <S className="h-5 w-16 rounded shrink-0" />
      </div>
      <div className="flex gap-1.5 pl-8">
        {Array.from({ length: 3 }).map((_, i) => (
          <S key={i} className="h-4 w-14 rounded" />
        ))}
      </div>
    </div>
  );
}

export function RoadmapSkeleton() {
  return (
    <div className="h-full overflow-y-auto p-6 max-w-3xl space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <S className="h-7 w-44" />
        <S className="h-3.5 w-72" />
      </div>

      {/* Generate panel */}
      <div className="rounded-xl border border-zinc-800 bg-zinc-950/20 p-4 space-y-3">
        <S className="h-3 w-28" />
        <div className="flex gap-2">
          <S className="h-10 flex-1 rounded-lg" />
          <S className="h-10 w-32 rounded-lg" />
        </div>
      </div>

      {/* Week headers + step cards */}
      {Array.from({ length: 3 }).map((_, week) => (
        <div key={week} className="space-y-3">
          <div className="flex items-center gap-3">
            <S className="h-5 w-16 rounded-full" />
            <S className="h-px flex-1" />
            <S className="h-3 w-20" />
          </div>
          {Array.from({ length: 2 + week }).map((_, i) => (
            <StepCardSkeleton key={i} />
          ))}
        </div>
      ))}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Interview skeleton
// ─────────────────────────────────────────────────────────────────────────────

function QuestionCardSkeleton() {
  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-950/20 p-4 space-y-3">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3 flex-1">
          <S className="h-5 w-5 rounded shrink-0 mt-0.5" />
          <div className="flex-1 space-y-2">
            <S className="h-4 w-full" />
            <S className="h-3.5 w-3/4" />
          </div>
        </div>
        <div className="flex gap-1.5 shrink-0">
          <S className="h-6 w-6 rounded" />
          <S className="h-6 w-6 rounded" />
          <S className="h-6 w-6 rounded" />
        </div>
      </div>
      <div className="flex gap-2">
        <S className="h-5 w-20 rounded" />
        <S className="h-5 w-16 rounded" />
      </div>
    </div>
  );
}

export function InterviewSkeleton() {
  return (
    <div className="h-full overflow-y-auto p-6 max-w-3xl space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <S className="h-7 w-48" />
        <S className="h-3.5 w-72" />
      </div>

      {/* Generate panel */}
      <div className="rounded-xl border border-zinc-800 bg-zinc-950/20 p-4 space-y-4">
        <S className="h-3 w-28" />
        <div className="flex gap-2 flex-wrap">
          {Array.from({ length: 6 }).map((_, i) => (
            <S key={i} className="h-8 w-28 rounded-lg" />
          ))}
        </div>
        <div className="flex gap-2 flex-wrap">
          {Array.from({ length: 3 }).map((_, i) => (
            <S key={i} className="h-8 w-20 rounded-full" />
          ))}
        </div>
        <S className="h-10 w-40 rounded-lg" />
      </div>

      {/* Progress bar */}
      <div className="flex items-center gap-3">
        <S className="h-2 flex-1 rounded-full" />
        <S className="h-3 w-20" />
      </div>

      {/* Question cards */}
      <div className="space-y-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <QuestionCardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Copilot skeleton  (full-bleed, no route padding wrapper)
// ─────────────────────────────────────────────────────────────────────────────

export function CopilotSkeleton() {
  return (
    <div className="relative flex h-full w-full overflow-hidden bg-bg-base">
      {/* Sidebar */}
      <div className="flex flex-col h-full w-[248px] p-4 border-r border-zinc-800/40 shrink-0 space-y-3">
        <div className="flex items-center justify-between shrink-0">
          <S className="h-4 w-20" />
          <S className="h-6 w-6 rounded" />
        </div>
        <S className="h-9 w-full rounded-xl shrink-0" />
        <S className="h-3 w-14 shrink-0" />
        <div className="flex-1 space-y-1.5 overflow-hidden">
          {Array.from({ length: 6 }).map((_, i) => (
            <S key={i} className="h-9 w-full rounded-lg" />
          ))}
        </div>
      </div>

      {/* Main chat column */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Chat header */}
        <div className="flex shrink-0 items-center gap-3 px-5 py-3.5 border-b border-zinc-800/40">
          <S className="h-8 w-8 rounded-xl shrink-0" />
          <div className="space-y-1.5 flex-1">
            <S className="h-4 w-40" />
            <S className="h-3 w-24" />
          </div>
        </div>

        {/* Messages area */}
        <div className="flex-1 min-h-0 px-5 md:px-8 py-6 space-y-6 overflow-hidden">
          {/* Assistant bubble */}
          <div className="flex gap-3 max-w-2xl">
            <S className="h-7 w-7 rounded-full shrink-0 mt-0.5" />
            <div className="space-y-2 flex-1">
              <S className="h-3.5 w-full" />
              <S className="h-3.5 w-5/6" />
              <S className="h-3.5 w-3/4" />
            </div>
          </div>
          {/* User bubble */}
          <div className="flex gap-3 max-w-md ml-auto">
            <div className="space-y-2 flex-1">
              <S className="h-3.5 w-full" />
              <S className="h-3.5 w-2/3 ml-auto" />
            </div>
          </div>
          {/* Assistant bubble */}
          <div className="flex gap-3 max-w-2xl">
            <S className="h-7 w-7 rounded-full shrink-0 mt-0.5" />
            <div className="space-y-2 flex-1">
              <S className="h-3.5 w-full" />
              <S className="h-3.5 w-4/5" />
            </div>
          </div>
        </div>

        {/* Input area */}
        <div className="shrink-0 px-5 md:px-8 pb-5 pt-3">
          <S className="h-14 w-full rounded-2xl" />
        </div>
      </div>
    </div>
  );
}
