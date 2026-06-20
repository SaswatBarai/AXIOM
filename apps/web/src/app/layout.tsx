import type { Metadata } from "next";
import "@/styles/globals.css";

export const metadata: Metadata = {
  title: {
    default: "AXIOM — AI Career Copilot",
    template: "%s | AXIOM",
  },
  description:
    "Analyze your resume, find matching jobs, improve your skills, and land your dream role with AI-powered insights.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body>{children}</body>
    </html>
  );
}
