// src/pages/HomePage/index.tsx
import { Header } from "../../components/Header";
import { Footer } from "../../components/Footer";
import { HeroSection } from "./HeroSection";
import { FeaturesSection } from "./FeaturesSection";
import { HowItWorksSection } from "./HowItWorksSection";
import { FaqSection } from "./FaqSection";
import { CtaSection } from "./CtaSection";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-[#fff8e6] text-slate-800">
      <Header />
      <main>
        <HeroSection />
        <FeaturesSection />
        <HowItWorksSection />
        <FaqSection />
        <CtaSection />
      </main>
      <Footer />
    </div>
  );
}
