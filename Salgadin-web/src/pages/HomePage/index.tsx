import { Header } from "../../components/Header";
import { Footer } from "../../components/Footer";
import { HeroSection } from "./HeroSection";
import { FeaturesSection } from "./FeaturesSection";
import { HowItWorksSection } from "./HowItWorksSection";
import { FaqSection } from "./FaqSection";
import { CtaSection } from "./CtaSection";
import { PricingSection } from "./PricingSection";
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
      <div className="min-h-screen overflow-x-hidden bg-gradient-to-b from-[var(--bg-from)] via-[var(--bg-via)] to-[var(--bg-to)] text-foreground">
        <Header />
        <main>
          <motion.div variants={reveal} initial="hidden" animate="show">
            <HeroSection />
          </motion.div>

          <div className="border-y border-border/70 bg-surface/45">
            <motion.div
              variants={reveal}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, amount: 0.2 }}
            >
              <FeaturesSection />
            </motion.div>
          </div>

          <motion.div
            variants={reveal}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.2 }}
          >
            <HowItWorksSection />
          </motion.div>

          <div className="border-y border-border/60 bg-surface-2/45">
            <motion.div
              variants={reveal}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, amount: 0.2 }}
            >
              <PricingSection />
            </motion.div>
          </div>

          <motion.div
            variants={reveal}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.2 }}
          >
            <FaqSection />
          </motion.div>

          <div className="border-t border-border/60 bg-surface/45">
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
