export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#09090B] flex flex-col items-center justify-center px-6 py-12">
      {children}
    </div>
  );
}
