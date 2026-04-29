import { useState } from "react";
import clsx from "clsx";
import { ChevronDown } from "lucide-react";
import { faqItems } from "./content";

export function FaqSection() {
  const [activeItem, setActiveItem] = useState<string | null>(null);

  const toggleItem = (question: string) => {
    setActiveItem(activeItem === question ? null : question);
  };

  return (
    <section
      id="faq"
      className="mx-auto mb-0 max-w-3xl scroll-mt-24 bg-transparent px-4 py-16"
    >
      <h2 className="text-center text-2xl font-extrabold text-foreground sm:text-3xl">
        Perguntas frequentes
      </h2>
      <p className="mt-2 text-center text-sm leading-6 text-foreground-muted sm:text-base">
        Respostas diretas sobre o que o Salgadin faz hoje.
      </p>
      <div className="mt-8 space-y-4">
        {faqItems.map((item, index) => {
          const isOpen = activeItem === item.q;
          const panelId = `faq-panel-${index}`;

          return (
            <div
              key={item.q}
              className={clsx(
                "overflow-hidden rounded-[var(--radius-card)] border border-border bg-surface shadow-[var(--shadow-card)] transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]",
                isOpen && "border-primary/35"
              )}
            >
              <button
                type="button"
                onClick={() => toggleItem(item.q)}
                className="flex min-h-14 w-full items-center justify-between gap-4 p-5 text-left font-medium transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
                aria-expanded={isOpen}
                aria-controls={panelId}
              >
                <span>{item.q}</span>
                <ChevronDown
                  className={clsx(
                    "h-5 w-5 shrink-0 transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]",
                    isOpen && "rotate-180"
                  )}
                  aria-hidden="true"
                />
              </button>

              <div
                id={panelId}
                className={clsx(
                  "grid transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]",
                  isOpen
                    ? "grid-rows-[1fr] opacity-100"
                    : "grid-rows-[0fr] opacity-0"
                )}
              >
                <div className="overflow-hidden">
                  <p className="px-5 pb-5 text-sm leading-6 text-foreground-muted">
                    {item.a}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
