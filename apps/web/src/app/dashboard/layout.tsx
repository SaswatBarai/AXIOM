export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-[#09090B]">
      {/* Sidebar will be implemented in Phase 4 */}
      <aside className="w-64 border-r border-zinc-800 bg-zinc-900 hidden md:block" />
      <main className="flex-1 overflow-auto">{children}</main>
    </div>
  );
}
