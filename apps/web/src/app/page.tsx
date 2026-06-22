import { SmoothScroll } from "@/components/SmoothScroll";
import { SignalFromNoise } from "@/components/landing/SignalFromNoise";
import { Navbar } from "@/components/landing/Navbar";
import { Hero } from "@/components/landing/Hero";
import { Stats } from "@/components/landing/Stats";
import { Features } from "@/components/landing/Features";
import { Showcase } from "@/components/landing/Showcase";
import { Chatbot } from "@/components/landing/Chatbot";
import { Pricing } from "@/components/landing/Pricing";
import { FAQ } from "@/components/landing/FAQ";
import { CallToAction } from "@/components/landing/CallToAction";
import { Footer } from "@/components/landing/Footer";

export default function LandingPage() {
  return (
    <SmoothScroll>
      <main className="min-h-screen bg-bg-base text-white">
        {/* Canvas background — position:fixed, z-index:0, behind all content */}
        <SignalFromNoise />

        {/* All page content sits above the canvas via z-index:1 stacking context */}
        <div className="relative z-[1]">
          <Navbar />
          <Hero />
          <Stats />
          <Features />
          <Showcase />
          <Chatbot />
          <Pricing />
          <FAQ />
          <CallToAction />
          <Footer />
        </div>
      </main>
    </SmoothScroll>
  );
}
