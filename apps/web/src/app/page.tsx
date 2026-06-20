import { SmoothScroll } from "@/components/SmoothScroll";
import { Navbar } from "@/components/landing/Navbar";
import { Hero } from "@/components/landing/Hero";
import { Features } from "@/components/landing/Features";
import { Showcase } from "@/components/landing/Showcase";
import { Chatbot } from "@/components/landing/Chatbot";
import { Pricing } from "@/components/landing/Pricing";
import { FAQ } from "@/components/landing/FAQ";
import { Footer } from "@/components/landing/Footer";

export default function LandingPage() {
  return (
    <SmoothScroll>
      <main className="min-h-screen bg-[#09090b] text-white">
        <Navbar />
        <Hero />
        <Features />
        <Showcase />
        <Chatbot />
        <Pricing />
        <FAQ />
        <Footer />
      </main>
    </SmoothScroll>
  );
}
