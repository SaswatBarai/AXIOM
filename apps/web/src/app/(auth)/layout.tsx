export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="fixed inset-0 bg-[#09090B] overflow-hidden">
      {children}
    </div>
  );
}
