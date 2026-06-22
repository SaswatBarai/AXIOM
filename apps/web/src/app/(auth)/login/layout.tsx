import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sign in",
  description: "Sign in to your AXIOM account and access your AI career dashboard.",
};

export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return children;
}
