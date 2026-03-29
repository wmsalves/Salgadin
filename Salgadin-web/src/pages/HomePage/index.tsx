import { Header } from "../../components/Header";
import { Footer } from "../../components/Footer";
import { HeroSection } from "./HeroSection";
import { FeaturesSection } from "./FeaturesSection";
import { HowItWorksSection } from "./HowItWorksSection";
import { FaqSection } from "./FaqSection";
import { CtaSection } from "./CtaSection";
import { PricingSection } from "./PricingSection";
import { motion } from "framer-motion";

const reveal = {
  hidden: { opacity: 0, y: 18 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] },
  },
};

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-[var(--bg-from)] via-[var(--bg-via)] to-[var(--bg-to)] text-foreground relative overflow-hidden">
      <div className="pointer-events-none absolute -top-32 right-0 h-72 w-72 rounded-full bg-primary/10 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-40 left-10 h-80 w-80 rounded-full bg-accent/10 blur-3xl" />
      <Header />
      <main>
        <motion.div
          variants={reveal}
          initial="hidden"
          animate="show"
        >
          <HeroSection />
        </motion.div>
        <motion.div
          variants={reveal}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.2 }}
        >
          <FeaturesSection />
        </motion.div>
        <motion.div
          variants={reveal}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.2 }}
        >
          <HowItWorksSection />
        </motion.div>
        <motion.div
          variants={reveal}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.2 }}
        >
          <PricingSection />
        </motion.div>
        <motion.div
          variants={reveal}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.2 }}
        >
          <FaqSection />
        </motion.div>
        <motion.div
          variants={reveal}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.2 }}
        >
          <CtaSection />
        </motion.div>
      </main>
      <Footer />
    </div>
  );
}
