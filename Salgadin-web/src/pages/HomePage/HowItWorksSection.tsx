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
    <section id="how" className="mx-auto max-w-6xl px-4 py-12">
      <h2 className="text-center text-2xl sm:text-3xl font-extrabold">
        Como o <span className="text-amber-600">Salgad</span>
        <span className="text-emerald-600">in</span> funciona?
      </h2>
      <p className="mt-2 text-center text-gray-600 text-sm sm:text-base">
        Comece a organizar suas finanças em minutos com nossa plataforma
        intuitiva e fácil de usar.
      </p>

      <div
        role="tablist"
        aria-label="Como funciona - abas"
        className="mt-8 flex justify-center gap-2 sm:gap-4 text-sm relative"
      >
        {TABS.map((t) => (
          <button
            key={t}
            role="tab"
            aria-selected={activeTab === t}
            onClick={() => setActiveTab(t)}
            className={clsx(
              "rounded-full px-4 py-2 font-medium transition-colors relative z-10",
              activeTab === t
                ? "text-emerald-700"
                : "text-gray-600 hover:text-black"
            )}
          >
            {activeTab === t && (
              <motion.div
                layoutId="active-tab-indicator"
                className="absolute inset-0 rounded-full bg-emerald-500/10 -z-10"
                transition={{ type: "spring", stiffness: 500, damping: 30 }}
              />
            )}
            {t}
          </button>
        ))}
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
            <h3 className="text-2xl font-extrabold">
              {tabsContent[activeTab].title}
            </h3>
            <p className="text-gray-600">
              {tabsContent[activeTab].description}
            </p>
            <ul className="space-y-3 text-gray-700">
              {tabsContent[activeTab].items.map((item) => (
                <li key={item} className="flex items-center gap-2">
                  <CheckCircle2
                    size={16}
                    className="text-emerald-500 flex-shrink-0"
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
            className="h-[340px] md:h-[380px] rounded-2xl"
          >
            {ActiveMockup}
          </div>
        </motion.div>
      </AnimatePresence>
    </section>
  );
}
