import { Skeleton } from "@/components/ui/skeleton";
import { Card } from "@/components/ui/card";

function StatCardSkeleton() {
  return (
    <Card className="border border-zinc-800 bg-zinc-950/40 p-5 shadow-lg">
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-2 flex-1">
          <Skeleton className="h-2.5 w-16" />
          <Skeleton className="h-8 w-12" />
          <Skeleton className="h-2 w-24 mt-1" />
        </div>
        <Skeleton className="h-8 w-8 rounded-lg shrink-0" />
      </div>
    </Card>
  );
}

function QuickActionSkeleton() {
  return (
    <div className="flex items-start gap-4 p-4.5 rounded-xl border border-zinc-800 bg-zinc-950/20">
      <Skeleton className="h-9 w-9 rounded-lg shrink-0" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-3.5 w-28" />
        <Skeleton className="h-3 w-full max-w-[180px]" />
      </div>
      <Skeleton className="h-4 w-4 rounded shrink-0 mt-0.5" />
    </div>
  );
}

function JobCardSkeleton() {
  return (
    <div className="shrink-0 w-72 rounded-xl border border-zinc-800 bg-zinc-950/20 p-4.5 space-y-3">
      <div className="flex items-center justify-between">
        <Skeleton className="h-4 w-16 rounded" />
        <Skeleton className="h-3 w-14" />
      </div>
      <Skeleton className="h-3.5 w-3/4" />
      <Skeleton className="h-3 w-1/2" />
      <div className="flex gap-1 pt-1">
        <Skeleton className="h-4 w-12 rounded-md" />
        <Skeleton className="h-4 w-14 rounded-md" />
        <Skeleton className="h-4 w-10 rounded-md" />
      </div>
      <div className="space-y-1.5 pt-1">
        <Skeleton className="h-2.5 w-full" />
        <Skeleton className="h-2.5 w-4/5" />
      </div>
      <div className="pt-3 border-t border-zinc-900 flex justify-between">
        <Skeleton className="h-3 w-16" />
        <Skeleton className="h-3 w-10" />
      </div>
    </div>
  );
}

export function DashboardOverviewSkeleton() {
  return (
    <div className="h-full overflow-y-auto">
      <div className="p-6 md:p-8 max-w-5xl space-y-8">
        {/* Header */}
        <div className="space-y-2">
          <Skeleton className="h-8 w-56 max-w-full" />
          <Skeleton className="h-4 w-72 max-w-full" />
        </div>

        {/* Profile completion banner */}
        <Card className="border border-zinc-800 bg-zinc-950/40 p-4.5">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Skeleton className="h-3.5 w-48" />
              <Skeleton className="h-3 w-20" />
            </div>
            <Skeleton className="h-1.5 w-full rounded-full" />
          </div>
        </Card>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <StatCardSkeleton key={i} />
          ))}
        </div>

        {/* Quick actions */}
        <div className="space-y-3.5">
          <Skeleton className="h-2.5 w-24" />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <QuickActionSkeleton key={i} />
            ))}
          </div>
        </div>

        {/* Recommended jobs */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Skeleton className="h-2.5 w-32" />
            <Skeleton className="h-3 w-16" />
          </div>
          <div className="flex gap-4 overflow-hidden pb-1">
            {Array.from({ length: 3 }).map((_, i) => (
              <JobCardSkeleton key={i} />
            ))}
          </div>
        </div>

        {/* Application funnel */}
        <div className="rounded-xl border border-zinc-800 bg-zinc-950/40 p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-zinc-900 pb-3">
            <div className="flex items-center gap-2">
              <Skeleton className="h-4 w-4 rounded" />
              <Skeleton className="h-3 w-32" />
            </div>
            <Skeleton className="h-3 w-24" />
          </div>
          <div className="grid grid-cols-4 gap-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-20 rounded-xl" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export function RecommendedJobsSkeleton() {
  return (
    <div className="flex gap-4 overflow-hidden pb-1">
      {Array.from({ length: 3 }).map((_, i) => (
        <JobCardSkeleton key={i} />
      ))}
    </div>
  );
}
