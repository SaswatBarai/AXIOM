import { Skeleton } from "@/components/ui/skeleton";

function ResumeCardSkeleton() {
  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-4">
      <div className="flex items-center gap-4">
        <Skeleton className="h-10 w-10 rounded-lg shrink-0" />
        <div className="flex-1 min-w-0 space-y-2">
          <Skeleton className="h-3.5 w-48 max-w-full" />
          <div className="flex items-center gap-2">
            <Skeleton className="h-2.5 w-8" />
            <Skeleton className="h-2.5 w-6" />
            <Skeleton className="h-2.5 w-20" />
          </div>
        </div>
        <Skeleton className="h-6 w-14 rounded-full shrink-0" />
      </div>
    </div>
  );
}

export function DashboardResumeSkeleton() {
  return (
    <div className="p-6 md:p-8 max-w-3xl">
      {/* Header */}
      <div className="mb-8 space-y-2">
        <Skeleton className="h-8 w-32" />
        <Skeleton className="h-4 w-full max-w-md" />
        <Skeleton className="h-4 w-3/4 max-w-sm" />
      </div>

      {/* Upload zone */}
      <div className="mb-4 rounded-2xl border-2 border-dashed border-zinc-800 p-10">
        <div className="flex flex-col items-center gap-3">
          <Skeleton className="h-14 w-14 rounded-2xl" />
          <Skeleton className="h-4 w-40" />
          <Skeleton className="h-3 w-56 max-w-full" />
        </div>
      </div>

      {/* Resume list */}
      <div className="mt-6">
        <div className="flex items-center justify-between mb-3">
          <Skeleton className="h-3.5 w-28" />
          <Skeleton className="h-3 w-36 hidden sm:block" />
        </div>
        <div className="space-y-2">
          {Array.from({ length: 2 }).map((_, i) => (
            <ResumeCardSkeleton key={i} />
          ))}
        </div>
      </div>
    </div>
  );
}
