import type { Metadata } from "next";
import "@/styles/globals.css";
import { Providers } from "@/components/providers";

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
      <body className="bg-grid-dots bg-[#09090b] text-white relative min-h-screen overflow-x-hidden antialiased">
        {/* Drifting atmospheric glow orbs */}
        <div className="absolute top-[10%] left-[5%] w-[600px] h-[600px] ambient-glow-orb animate-float-1 opacity-60 pointer-events-none" />
        <div className="absolute top-[35%] right-[2%] w-[700px] h-[700px] ambient-glow-orb animate-float-2 opacity-55 pointer-events-none" />
        <div className="absolute top-[65%] left-[2%] w-[800px] h-[800px] ambient-glow-orb animate-float-1 opacity-45 pointer-events-none" />
        <div className="absolute top-[85%] right-[5%] w-[600px] h-[600px] ambient-glow-orb animate-float-2 opacity-65 pointer-events-none" />

        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}

