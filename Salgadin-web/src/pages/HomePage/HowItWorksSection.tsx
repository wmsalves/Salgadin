import { useState } from "react";
import { tabsContent } from "./content";
import clsx from "clsx";
import { CheckCircle2 } from "lucide-react";
import { DashboardMockup, ExpensesMockup, GoalsMockup } from "./mockups";
import { motion, AnimatePresence } from "framer-motion";

type TabKey = keyof typeof tabsContent;

const tabContentVariants = {
  initial: { opacity: 0, y: 10 },
  enter: { opacity: 1, y: 0, transition: { duration: 0.3 } },
  exit: { opacity: 0, y: -10, transition: { duration: 0.2 } },
};

export function HowItWorksSection() {
  const [activeTab, setActiveTab] = useState<TabKey>("Dashboard");
  const TABS = Object.keys(tabsContent) as TabKey[];

  const ActiveMockup = {
    Dashboard: <DashboardMockup />,
    Despesas: <ExpensesMockup />,
    Metas: <GoalsMockup />,
  }[activeTab];

  return (
    <section id="how" className="mx-auto max-w-6xl px-4 py-12 scroll-mt-24">
      <h2 className="text-center text-2xl sm:text-3xl font-extrabold text-foreground">
        Como o <span className="text-accent">Salgad</span>
        <span className="text-primary">in</span> funciona?
      </h2>
      <p className="mt-2 text-center text-foreground-muted text-sm sm:text-base">
        Comece a organizar suas finanças em minutos com nossa plataforma
        intuitiva e fácil de usar.
      </p>

      <div className="mt-8 flex justify-center">
        <div
          role="tablist"
          aria-label="Como funciona - abas"
          className="inline-flex flex-wrap justify-center gap-2 sm:gap-4 text-sm relative rounded-full border border-border bg-surface/70 px-2 py-2 backdrop-blur-md"
        >
          {TABS.map((t) => (
            <button
              key={t}
              role="tab"
              aria-selected={activeTab === t}
              onClick={() => setActiveTab(t)}
              className={clsx(
                "rounded-full px-4 py-2 font-medium transition-all duration-200 ease-out relative z-10 whitespace-nowrap hover:-translate-y-0.5 active:translate-y-0",
                activeTab === t
                  ? "text-primary"
                  : "text-foreground-muted hover:text-foreground"
              )}
            >
              {activeTab === t && (
                <motion.div
                  layoutId="active-tab-indicator"
                  className="absolute inset-0 rounded-full bg-primary/10 -z-10"
                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                />
              )}
              {t}
            </button>
          ))}
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          variants={tabContentVariants}
          initial="initial"
          animate="enter"
          exit="exit"
          className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-8 items-center"
        >
          {/* Lado Esquerdo: Textos */}
          <div className="space-y-4">
            <h3 className="text-2xl font-extrabold text-foreground">
              {tabsContent[activeTab].title}
            </h3>
            <p className="text-foreground-muted">
              {tabsContent[activeTab].description}
            </p>
            <ul className="space-y-3 text-foreground-muted">
              {tabsContent[activeTab].items.map((item) => (
                <li
                  key={item}
                  className="flex items-center gap-2 rounded-xl px-2 py-1 soft-hover-sm hover:bg-surface-2/60"
                >
                  <CheckCircle2
                    size={16}
                    className="text-success flex-shrink-0"
                  />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Lado Direito: Mockups Visuais */}
          <div
            id={`panel-${activeTab}`}
            role="tabpanel"
            className="min-h-[420px] md:min-h-[460px] rounded-3xl border border-border/70 bg-surface/70 backdrop-blur-xl p-4 shadow-[0_18px_40px_rgba(60,42,32,0.12)] flex items-start justify-center"
          >
            <div className="w-full h-full max-w-[520px]">
              {ActiveMockup}
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
    </section>
  );
}


