import { cn } from "@/lib/utils";

function Bone({ className }: { className?: string }) {
  return (
    <div className={cn("relative overflow-hidden rounded-md bg-zinc-800/60", className)}>
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
          maskImage: "radial-gradient(ellipse 85% 45% at 50% 0%, #000 50%, transparent 100%)",
          WebkitMaskImage: "radial-gradient(ellipse 85% 45% at 50% 0%, #000 50%, transparent 100%)",
        }}
      />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[520px] h-[200px] bg-brand/[0.06] rounded-full blur-[100px] pointer-events-none" />
    </>
  );
}

export function DashboardOverviewSkeleton() {
  return (
    <div className="relative min-h-full overflow-hidden" aria-busy="true" aria-label="Loading overview">
      <PageBackgroundSkeleton />

      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 py-8 pb-12">
        {/* Hero */}
        <div className="mb-8 flex flex-col lg:flex-row lg:justify-between gap-6">
          <div className="flex-1 space-y-3">
            <Bone className="h-4 w-32" />
            <Bone className="h-9 w-80 max-w-full" />
            <Bone className="h-4 w-96 max-w-full" />
            <Bone className="h-10 w-36 rounded-xl mt-2" />
          </div>
          <Bone className="h-28 w-full lg:w-72 rounded-2xl shrink-0" />
        </div>

        {/* Metrics strip */}
        <div className="mb-8 rounded-2xl border border-border-subtle bg-bg-card/40 overflow-hidden">
          <div className="grid grid-cols-2 lg:grid-cols-4 divide-y lg:divide-y-0 lg:divide-x divide-border-subtle/80">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="px-6 py-4 space-y-2">
                <Bone className="h-8 w-12" />
                <Bone className="h-3.5 w-20" />
                <Bone className="h-3 w-24" />
              </div>
            ))}
          </div>
        </div>

        {/* Main grid */}
        <div className="grid grid-cols-1 xl:grid-cols-[1fr_280px] gap-8">
          <div className="space-y-5">
            <div className="flex justify-between">
              <div className="space-y-1.5">
                <Bone className="h-4 w-40" />
                <Bone className="h-3 w-56" />
              </div>
              <Bone className="h-4 w-16" />
            </div>
            <Bone className="h-44 w-full rounded-2xl" />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Bone className="h-36 rounded-xl" />
              <Bone className="h-36 rounded-xl" />
            </div>
          </div>

          <aside className="space-y-5">
            <Bone className="h-56 w-full rounded-2xl" />
            <Bone className="h-64 w-full rounded-2xl" />
          </aside>
        </div>
      </div>
    </div>
  );
}

export function RecommendedJobsSkeleton() {
  return (
    <div className="space-y-4">
      <Bone className="h-44 w-full rounded-2xl" />
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Bone className="h-36 rounded-xl" />
        <Bone className="h-36 rounded-xl" />
      </div>
    </div>
  );
}
