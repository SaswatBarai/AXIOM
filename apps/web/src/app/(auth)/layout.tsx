import type { Metadata } from "next";

export const metadata: Metadata = {
  title: {
    default: "Sign in",
    template: "%s | AXIOM",
  },
  description: "Sign in or create your AXIOM account to access your AI career dashboard.",
  robots: { index: false, follow: false },
};

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="fixed inset-0 bg-bg-base overflow-hidden">
      {children}
    </div>
  );
}
