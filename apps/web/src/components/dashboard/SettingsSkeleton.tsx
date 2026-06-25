import { cn } from "@/lib/utils";

// ── Bone ─────────────────────────────────────────────────────────────────────
// Shimmer primitive — matches InterviewSkeleton / globals.css skeleton-shimmer.

function Bone({ className }: { className?: string }) {
  return (
    <div className={cn("relative overflow-hidden rounded-md bg-zinc-800/60", className)}>
      <div className="absolute inset-0 -translate-x-full animate-[skeleton-shimmer_1.8s_ease-in-out_infinite] bg-gradient-to-r from-transparent via-white/[0.04] to-transparent" />
    </div>
  );
}

// ── Nav item ─────────────────────────────────────────────────────────────────
// Mirrors: button.flex.items-center.gap-3.px-4.py-3.5.rounded-xl.border

function NavItemSkeleton({ showDesc = true }: { showDesc?: boolean }) {
  return (
    <div className="flex items-center gap-3 px-4 py-3.5 rounded-xl border border-border-subtle bg-bg-card/30 shrink-0 lg:shrink lg:w-full">
      <Bone className="w-9 h-9 rounded-lg shrink-0" />
      <div className="min-w-0 flex-1 hidden sm:block lg:block space-y-1.5">
        <Bone className="h-3.5 w-20" />
        {showDesc && <Bone className="h-2.5 w-32 hidden lg:block" />}
      </div>
    </div>
  );
}

// ── Field row ────────────────────────────────────────────────────────────────
// Mirrors: grid md:grid-cols-3 gap-2 md:gap-6 py-4 border-b

function FieldRowSkeleton({ labelWidth = "w-24" }: { labelWidth?: string }) {
  return (
    <div className="grid md:grid-cols-3 gap-2 md:gap-6 items-start py-4 border-b border-border-subtle/80 last:border-0">
      <Bone className={cn("h-3.5 pt-2", labelWidth)} />
      <Bone className="h-[42px] md:col-span-2 w-full rounded-xl" />
    </div>
  );
}

// ── Profile summary card ─────────────────────────────────────────────────────

function ProfileSummarySkeleton() {
  return (
    <div className="mb-8 rounded-2xl border border-border-subtle bg-bg-card/40 backdrop-blur-md overflow-hidden shadow-lg">
      <div className="p-5 sm:p-6 flex flex-col sm:flex-row items-center gap-5">
        <Bone className="w-16 h-16 rounded-2xl shrink-0" />
        <div className="flex-1 w-full space-y-2 text-center sm:text-left">
          <Bone className="h-5 w-40 mx-auto sm:mx-0" />
          <Bone className="h-3.5 w-52 max-w-full mx-auto sm:mx-0" />
          <Bone className="h-3 w-32 max-w-full mx-auto sm:mx-0 hidden sm:block" />
        </div>
        <div className="flex items-center gap-4 shrink-0">
          <Bone className="w-16 h-16 rounded-full shrink-0" />
          <div className="hidden sm:block space-y-1.5">
            <Bone className="h-3 w-24" />
            <Bone className="h-2.5 w-36" />
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Content panel ─────────────────────────────────────────────────────────────

function ContentPanelSkeleton() {
  return (
    <div className="rounded-2xl border border-border-subtle bg-bg-card/40 backdrop-blur-md shadow-lg overflow-hidden">
      {/* Panel header — p-6 sm:p-8 border-b */}
      <div className="p-6 sm:p-8 border-b border-border-subtle/80 space-y-2">
        <Bone className="h-6 w-28" />
        <Bone className="h-3.5 w-56 max-w-full" />
      </div>

      {/* Panel body — form fields */}
      <div className="p-6 sm:p-8">
        <FieldRowSkeleton labelWidth="w-28" />
        <FieldRowSkeleton labelWidth="w-32" />
        <div className="grid md:grid-cols-3 gap-2 md:gap-6 items-start py-4 border-b border-border-subtle/80">
          <Bone className="h-3.5 w-16 pt-2" />
          <div className="md:col-span-2 space-y-1.5">
            <Bone className="h-[72px] w-full rounded-xl" />
            <Bone className="h-2.5 w-12" />
          </div>
        </div>
        <FieldRowSkeleton labelWidth="w-20" />
        <FieldRowSkeleton labelWidth="w-36" />
        <FieldRowSkeleton labelWidth="w-20" />
        <FieldRowSkeleton labelWidth="w-20" />
        <FieldRowSkeleton labelWidth="w-24" />

        <div className="pt-6 flex justify-end">
          <Bone className="h-10 w-32 rounded-xl" />
        </div>
      </div>
    </div>
  );
}

// ── Page background ───────────────────────────────────────────────────────────

function PageBackgroundSkeleton() {
  return (
    <>
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: "radial-gradient(var(--grid-dot-color) 1px, transparent 1px)",
          backgroundSize: "24px 24px",
          maskImage: "radial-gradient(ellipse 80% 50% at 50% 0%, #000 50%, transparent 100%)",
          WebkitMaskImage: "radial-gradient(ellipse 80% 50% at 50% 0%, #000 50%, transparent 100%)",
        }}
      />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[560px] h-[220px] bg-brand/[0.06] rounded-full blur-[110px] pointer-events-none" />
      <div className="absolute top-0 right-0 w-[280px] h-[180px] bg-emerald-500/[0.03] rounded-full blur-[90px] pointer-events-none" />
    </>
  );
}

// ── Full page ─────────────────────────────────────────────────────────────────

export function SettingsPageSkeleton() {
  return (
    <div className="relative min-h-full overflow-hidden" aria-busy="true" aria-label="Loading settings">
      <PageBackgroundSkeleton />

      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 py-8 pb-12">
        {/* Hero header */}
        <div className="mb-8 space-y-4">
          <Bone className="h-7 w-36 rounded-full" />
          <Bone className="h-10 sm:h-11 w-64 max-w-full" />
          <Bone className="h-4 w-80 max-w-full" />
        </div>

        <ProfileSummarySkeleton />

        {/* Main layout */}
        <div className="grid lg:grid-cols-[260px_1fr] gap-6 items-start">
          {/* Side nav — horizontal on mobile, vertical on lg */}
          <nav className="flex lg:flex-col gap-2 overflow-x-auto lg:overflow-visible pb-1 lg:pb-0 scrollbar-none">
            {Array.from({ length: 5 }).map((_, i) => (
              <NavItemSkeleton key={i} />
            ))}
          </nav>

          <ContentPanelSkeleton />
        </div>
      </div>
    </div>
  );
}

/** @deprecated Use SettingsPageSkeleton */
export const SettingsSkeleton = SettingsPageSkeleton;
