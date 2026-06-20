import { Sidebar } from "@/components/dashboard/Sidebar";
import { ProtectedRoute } from "@/components/shared/ProtectedRoute";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute>
      <div className="flex h-screen bg-[#09090B] overflow-hidden">
        <div className="hidden md:flex md:flex-shrink-0">
          <Sidebar />
        </div>
        <main className="flex-1 overflow-y-auto">{children}</main>
      </div>
    </ProtectedRoute>
  );
}
