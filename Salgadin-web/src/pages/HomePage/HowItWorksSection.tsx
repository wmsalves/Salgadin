// src/pages/HomePage/HowItWorksSection.tsx
import { useState } from "react";
import { tabsContent } from "./content";
import clsx from "clsx"; // Biblioteca para classes condicionais

type TabKey = keyof typeof tabsContent;

export function HowItWorksSection() {
  const [activeTab, setActiveTab] = useState<TabKey>("Dashboard");
  const TABS = Object.keys(tabsContent) as TabKey[];

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

      {/* Abas */}
      <div
        role="tablist"
        aria-label="Como funciona - abas"
        className="mt-6 flex justify-center gap-2 sm:gap-4 text-sm"
      >
        {TABS.map((t) => (
          <button
            key={t}
            role="tab"
            aria-selected={activeTab === t}
            aria-controls={`panel-${t}`}
            onClick={() => setActiveTab(t)}
            className={clsx(
              "rounded-full border px-4 py-1.5 transition",
              activeTab === t
                ? "bg-black/5 ring-1 ring-black/10"
                : "hover:bg-black/5"
            )}
          >
            {t}
          </button>
        ))}
      </div>

      {/* Conteúdo */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
        <div className="space-y-3 text-sm sm:text-base">
          <h3 className="text-2xl font-extrabold">
            {tabsContent[activeTab].title}
          </h3>
          <p className="text-gray-600">{tabsContent[activeTab].description}</p>
          <ul className="space-y-4 text-gray-700">
            {tabsContent[activeTab].items.map((item) => (
              <li key={item}>✓ {item}</li>
            ))}
          </ul>
        </div>
        <div
          id={`panel-${activeTab}`}
          role="tabpanel"
          aria-labelledby={activeTab}
          className="h-[360px] md:h-[420px] rounded-2xl border border-black/20 bg-gray-200 shadow-inner p-4 grid place-items-center text-gray-500"
        >
          <span className="text-sm">(Painel para {activeTab})</span>
        </div>
      </div>
    </section>
  );
}
