import { Header } from "../../components/Header";
import { Footer } from "../../components/Footer";
import { HeroSection } from "./HeroSection";
import { FeaturesSection } from "./FeaturesSection";
import { CoxinhaEffectSection } from "./CoxinhaEffectSection";
import { FaqSection } from "./FaqSection";
import { CtaSection } from "./CtaSection";
import { PricingSection } from "./PricingSection";
import { TrustSection } from "./TrustSection";
import { MotionConfig, motion, type Variants, type Easing } from "framer-motion";

const ease: Easing = [0.16, 1, 0.3, 1];

const reveal: Variants = {
  hidden: { opacity: 0, y: 18 },
  show: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease,
    },
  },
};

export default function HomePage() {
  return (
    <MotionConfig reducedMotion="user">
      <div className="min-h-screen overflow-x-hidden bg-background text-foreground">
        <Header />
        <main>
          <motion.div variants={reveal} initial="hidden" animate="show">
            <HeroSection />
          </motion.div>

          <div className="border-y border-border bg-surface">
          <motion.div
            variants={reveal}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.2 }}
          >
            <CoxinhaEffectSection />
          </motion.div>
          </div>

          <motion.div
            variants={reveal}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.2 }}
          >
            <FeaturesSection />
          </motion.div>

          <div className="border-y border-border bg-surface">
          <motion.div
            variants={reveal}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.2 }}
          >
            <TrustSection />
          </motion.div>
          </div>

          <motion.div
            variants={reveal}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.2 }}
          >
            <PricingSection />
          </motion.div>

          <div className="border-t border-border bg-surface">
          <motion.div
            variants={reveal}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.2 }}
          >
            <FaqSection />
          </motion.div>
          </div>

          <div className="border-t border-border">
          <motion.div
            variants={reveal}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.2 }}
          >
            <CtaSection />
          </motion.div>
          </div>
        </main>
        <Footer />
      </div>
    </MotionConfig>
  );
}
