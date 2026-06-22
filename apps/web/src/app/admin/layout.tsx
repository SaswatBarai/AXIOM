import type { Metadata } from "next";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { AdminGuard } from "@/components/admin/AdminGuard";

export const metadata: Metadata = {
  title: { default: "Admin", template: "%s | AXIOM Admin" },
  robots: { index: false, follow: false },
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <AdminGuard>
      <div className="flex h-screen bg-[#09090B] overflow-hidden">
        <div className="hidden md:flex md:flex-shrink-0">
          <AdminSidebar />
        </div>
        <div className="flex-1 flex flex-col overflow-hidden">
          <header className="flex items-center px-6 py-3 border-b border-gray-800 bg-[#09090B]/80 backdrop-blur-sm flex-shrink-0">
            <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">
              Admin Panel
            </span>
          </header>
          <main className="flex-1 overflow-y-auto p-6">{children}</main>
        </div>
      </div>
    </AdminGuard>
  );
}
