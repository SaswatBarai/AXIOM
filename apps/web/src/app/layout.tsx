import type { Metadata } from "next";
import "@/styles/globals.css";
import { Providers } from "@/components/providers";
import { cn } from "@/lib/utils";

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://axiom.careers";

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),

  title: {
    default: "AXIOM — AI Career Copilot",
    template: "%s | AXIOM",
  },
  description:
    "Optimize your resume for ATS, match with thousands of live roles semantically, and generate personalized interview prep plans — all in one AI-powered dashboard.",

  keywords: [
    "AI career copilot",
    "resume optimizer",
    "ATS resume checker",
    "job matching AI",
    "interview prep",
    "career roadmap",
    "skill gap analysis",
    "job search",
    "AXIOM",
  ],

  authors: [{ name: "AXIOM", url: BASE_URL }],
  creator: "AXIOM",
  publisher: "AXIOM",

  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },

  openGraph: {
    type: "website",
    locale: "en_US",
    url: BASE_URL,
    siteName: "AXIOM",
    title: "AXIOM — AI Career Copilot",
    description:
      "Resume analysis, job matching, skill gaps & interview prep — in one AI-powered dashboard.",
    images: [
      {
        url: "/opengraph-image",
        width: 1200,
        height: 630,
        alt: "AXIOM — Your AI Career Copilot",
      },
    ],
  },

  twitter: {
    card: "summary_large_image",
    title: "AXIOM — AI Career Copilot",
    description:
      "Resume analysis, job matching, skill gaps & interview prep — in one AI-powered dashboard.",
    images: ["/opengraph-image"],
    creator: "@axiomcareers",
  },

  manifest: "/site.webmanifest",

  category: "technology",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="bg-grid-dots bg-bg-base text-text-primary relative min-h-screen overflow-x-hidden antialiased font-sans">
        {/* Clipped background container to prevent vertical scroll overflow */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
          <div className="absolute top-[10%] left-[5%] w-[600px] h-[600px] ambient-glow-orb animate-float-1 opacity-60" />
          <div className="absolute top-[35%] right-[2%] w-[700px] h-[700px] ambient-glow-orb animate-float-2 opacity-55" />
          <div className="absolute top-[65%] left-[2%] w-[800px] h-[800px] ambient-glow-orb animate-float-1 opacity-45" />
          <div className="absolute top-[85%] right-[5%] w-[600px] h-[600px] ambient-glow-orb animate-float-2 opacity-65" />
        </div>

        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}

