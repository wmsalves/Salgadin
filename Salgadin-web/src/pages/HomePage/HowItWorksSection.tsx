import { Suspense, lazy, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import clsx from "clsx";
import { BarChart3, CheckCircle2, ReceiptText, UserPlus } from "lucide-react";
import { tabsContent } from "./content";

type TabKey = keyof typeof tabsContent;
const HowItWorksMockupPanel = lazy(() => import("./HowItWorksMockupPanel"));

const tabContentVariants = {
  initial: { opacity: 0, y: 10 },
  enter: { opacity: 1, y: 0, transition: { duration: 0.3 } },
  exit: { opacity: 0, y: -10, transition: { duration: 0.2 } },
};

const steps = [
  {
    title: "Crie sua conta",
    description:
      "Entre pelo cadastro gratuito e deixe seu espaco pronto para organizar o mes.",
    icon: UserPlus,
  },
  {
    title: "Registre seus pequenos gastos",
    description:
      "Adicione manualmente cafe, lanche, delivery, mercado, transporte ou compras recorrentes.",
    icon: ReceiptText,
  },
  {
    title: "Veja seus padroes em graficos simples",
    description:
      "Acompanhe onde o dinheiro se repete e decida com mais clareza o que ajustar.",
    icon: BarChart3,
  },
];

export function HowItWorksSection() {
  const [activeTab, setActiveTab] = useState<TabKey>("Dashboard");
  const TABS = Object.keys(tabsContent) as TabKey[];

  return (
    <section id="how" className="mx-auto max-w-6xl scroll-mt-24 px-4 py-16">
      <h2 className="text-center text-2xl font-extrabold text-foreground sm:text-3xl">
        Como o <span className="text-accent">Salgad</span>
        <span className="text-primary">in</span> funciona?
      </h2>
      <p className="mx-auto mt-2 max-w-2xl text-center text-sm leading-6 text-foreground-muted sm:text-base">
        Um fluxo simples para transformar lancamentos manuais em clareza visual,
        sem integracao bancaria ou planilhas complicadas.
      </p>

      <ol className="mt-8 grid gap-4 md:grid-cols-3">
        {steps.map((step, index) => (
          <li
            key={step.title}
            className="group rounded-[var(--radius-card)] border border-border bg-surface/90 p-5 shadow-[var(--shadow-card)] transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] hover:-translate-y-1 hover:border-primary/35 hover:shadow-[var(--shadow-card-hover)]"
          >
            <div className="flex items-start gap-4">
              <div className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-surface-2 text-primary transition-colors group-hover:bg-surface-3">
                <step.icon size={22} aria-hidden="true" />
              </div>
              <div>
                <p className="text-sm font-bold text-primary">
                  Passo {index + 1}
                </p>
                <h3 className="mt-1 text-lg font-extrabold text-foreground">
                  {step.title}
                </h3>
                <p className="mt-2 text-sm leading-6 text-foreground-muted">
                  {step.description}
                </p>
              </div>
            </div>
          </li>
        ))}
      </ol>

      <div className="mt-8 flex justify-center">
        <div
          role="tablist"
          aria-label="Como funciona - abas"
          className="relative inline-flex flex-wrap justify-center gap-2 rounded-2xl border border-border bg-surface/80 px-2 py-2 text-sm shadow-[0_12px_30px_rgba(60,42,32,0.08)] backdrop-blur-md sm:gap-3"
        >
          {TABS.map((t) => (
            <button
              key={t}
              id={`tab-${t}`}
              role="tab"
              aria-selected={activeTab === t}
              aria-controls={`panel-${t}`}
              onClick={() => setActiveTab(t)}
              className={clsx(
                "relative z-10 min-h-11 whitespace-nowrap rounded-xl px-4 py-2 font-medium transition-all duration-200 ease-out hover:-translate-y-0.5 active:translate-y-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40",
                activeTab === t
                  ? "text-primary"
                  : "text-foreground-muted hover:text-foreground"
              )}
            >
              {activeTab === t && (
                <motion.div
                  layoutId="active-tab-indicator"
                  className="absolute inset-0 -z-10 rounded-xl bg-primary/10"
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
          className="mt-8 grid grid-cols-1 items-center gap-8 md:grid-cols-2"
        >
          <div className="space-y-4">
            <h3 className="text-2xl font-extrabold text-foreground">
              {tabsContent[activeTab].title}
            </h3>
            <p className="leading-7 text-foreground-muted">
              {tabsContent[activeTab].description}
            </p>
            <ul className="space-y-3 text-foreground-muted">
              {tabsContent[activeTab].items.map((item) => (
                <li
                  key={item}
                  className="flex min-h-11 items-center gap-2 rounded-xl px-2 py-1 soft-hover-sm hover:bg-surface-2/60"
                >
                  <CheckCircle2
                    size={16}
                    className="shrink-0 text-success"
                    aria-hidden="true"
                  />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          <div
            id={`panel-${activeTab}`}
            role="tabpanel"
            aria-labelledby={`tab-${activeTab}`}
            className="flex min-h-[380px] items-start justify-center rounded-[var(--radius-card)] border border-border/70 bg-surface/80 p-3 shadow-[var(--shadow-card)] backdrop-blur-xl sm:p-4 md:min-h-[460px]"
          >
            <div className="h-full w-full max-w-[520px]">
              <Suspense
                fallback={
                  <div className="h-[600px] w-full rounded-2xl bg-surface-2/70 animate-pulse" />
                }
              >
                <HowItWorksMockupPanel activeTab={activeTab} />
              </Suspense>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
    </section>
  );
}
