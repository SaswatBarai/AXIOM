import { cn } from "@/lib/utils";

function Bone({ className, style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <div className={cn("relative overflow-hidden rounded-md bg-zinc-800/60", className)} style={style}>
      <div className="absolute inset-0 -translate-x-full animate-[skeleton-shimmer_1.8s_ease-in-out_infinite] bg-gradient-to-r from-transparent via-white/[0.04] to-transparent" />
    </div>
  );
}

function PageBackgroundSkeleton() {
  return (
    <>
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: "radial-gradient(var(--grid-dot-color) 1px, transparent 1px)",
          backgroundSize: "24px 24px",
          maskImage: "radial-gradient(ellipse 80% 55% at 50% 0%, #000 55%, transparent 100%)",
          WebkitMaskImage: "radial-gradient(ellipse 80% 55% at 50% 0%, #000 55%, transparent 100%)",
        }}
      />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[260px] bg-brand/[0.06] rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute top-20 right-0 w-[320px] h-[200px] bg-emerald-500/[0.04] rounded-full blur-[100px] pointer-events-none" />
    </>
  );
}

function KpiCardSkeleton() {
  return (
    <div className="relative rounded-2xl border border-border-subtle bg-bg-card/40 backdrop-blur-md p-5 sm:p-6 shadow-lg overflow-hidden h-full">
      <Bone className="w-9 h-9 rounded-xl mb-4" />
      <Bone className="h-9 w-16 mb-2" />
      <Bone className="h-4 w-28 mb-1.5" />
      <Bone className="h-3 w-36" />
    </div>
  );
}

function PipelineStripSkeleton() {
  return (
    <div className="rounded-2xl border border-border-subtle bg-bg-card/40 backdrop-blur-md p-5 sm:p-6 shadow-lg">
      <div className="flex items-center justify-between mb-5">
        <Bone className="h-3 w-36" />
        <Bone className="h-3 w-28" />
      </div>
      <div className="flex items-center gap-2 overflow-hidden">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="flex items-center gap-2 shrink-0">
            <Bone className="h-[72px] w-[88px] rounded-xl" />
            {i < 3 && <Bone className="h-3.5 w-3.5 rounded hidden sm:block" />}
          </div>
        ))}
      </div>
    </div>
  );
}

function ChartPanelSkeleton({ tall = false }: { tall?: boolean }) {
  return (
    <div className="rounded-2xl border border-border-subtle bg-bg-card/40 backdrop-blur-md shadow-lg overflow-hidden h-full flex flex-col">
      <div className="p-5 sm:p-6 border-b border-border-subtle/80 flex items-start gap-3">
        <Bone className="w-8 h-8 rounded-lg shrink-0" />
        <div className="flex-1 space-y-2">
          <Bone className="h-3 w-32" />
          <Bone className="h-3 w-48 max-w-full" />
        </div>
        <Bone className="h-5 w-16 rounded-full shrink-0" />
      </div>
      <div className={cn("p-5 sm:p-6 flex items-end gap-2", tall ? "h-[280px]" : "h-[260px]")}>
        {Array.from({ length: 8 }).map((_, i) => (
          <Bone
            key={i}
            className="flex-1 rounded-t-md max-w-[28px]"
            style={{ height: `${35 + ((i * 17) % 55)}%` }}
          />
        ))}
      </div>
    </div>
  );
}

function SummarySkeleton() {
  return (
    <div className="rounded-2xl border border-border-subtle bg-bg-card/40 backdrop-blur-md p-5 sm:p-6 shadow-lg">
      <Bone className="h-3 w-36 mb-5" />
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="p-4 rounded-xl border border-border-subtle bg-bg-base/50 space-y-2">
            <Bone className="h-2.5 w-24" />
            <Bone className="h-6 w-10" />
          </div>
        ))}
      </div>
    </div>
  );
}

export function AnalyticsPageSkeleton() {
  return (
    <div className="relative min-h-full overflow-hidden" aria-busy="true" aria-label="Loading analytics">
      <PageBackgroundSkeleton />

      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 py-8 pb-12 space-y-8">
        {/* Hero */}
        <div className="space-y-4">
          <Bone className="h-7 w-36 rounded-full" />
          <Bone className="h-10 sm:h-11 w-72 max-w-full" />
          <Bone className="h-4 w-96 max-w-full" />
        </div>

        {/* Toolbar */}
        <div className="rounded-2xl border border-border-subtle bg-bg-card/40 backdrop-blur-md p-4 shadow-lg">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <Bone className="h-4 w-24" />
            <div className="flex flex-wrap gap-2">
              <div className="flex rounded-xl border border-border-subtle p-1 gap-1">
                {Array.from({ length: 3 }).map((_, i) => (
                  <Bone key={i} className="h-8 w-[72px] rounded-lg" />
                ))}
              </div>
              <Bone className="h-9 w-16 rounded-xl" />
              <Bone className="h-9 w-16 rounded-xl" />
            </div>
          </div>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <KpiCardSkeleton key={i} />
          ))}
        </div>

        <PipelineStripSkeleton />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ChartPanelSkeleton />
          <ChartPanelSkeleton />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ChartPanelSkeleton tall />
          <ChartPanelSkeleton tall />
        </div>

        <SummarySkeleton />
      </div>
    </div>
  );
}

/** @deprecated Use AnalyticsPageSkeleton */
export const AnalyticsSkeleton = AnalyticsPageSkeleton;
