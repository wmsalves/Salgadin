import { Header } from "../../components/Header";
import { Footer } from "../../components/Footer";
import { HeroSection } from "./HeroSection";
import { FeaturesSection } from "./FeaturesSection";
import { HowItWorksSection } from "./HowItWorksSection";
import { FaqSection } from "./FaqSection";
import { CtaSection } from "./CtaSection";
import { PricingSection } from "./PricingSection";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-[var(--bg-from)] via-[var(--bg-via)] to-[var(--bg-to)] text-foreground relative overflow-hidden">
      <div className="pointer-events-none absolute -top-32 right-0 h-72 w-72 rounded-full bg-primary/10 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-40 left-10 h-80 w-80 rounded-full bg-accent/10 blur-3xl" />
      <Header />
      <main>
        <HeroSection />
        <FeaturesSection />
        <HowItWorksSection />
        <PricingSection />
        <FaqSection />
        <CtaSection />
      </main>
      <Footer />
    </div>
  );
}
