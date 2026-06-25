import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "AI Copilot",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <div className="h-full min-h-0 flex flex-col">{children}</div>;
}
