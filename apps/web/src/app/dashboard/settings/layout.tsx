import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Settings",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <div className="h-full overflow-y-auto p-6">{children}</div>;
}
