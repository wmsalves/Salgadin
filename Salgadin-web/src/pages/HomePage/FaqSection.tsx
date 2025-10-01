import { useState } from "react";
import { faqItems } from "./content";
import { ChevronDown } from "lucide-react";
import clsx from "clsx";

export function FaqSection() {
  const [activeItem, setActiveItem] = useState<string | null>(null);

  const toggleItem = (question: string) => {
    setActiveItem(activeItem === question ? null : question);
  };

  return (
    <section id="faq" className="mx-auto max-w-3xl px-4 py-12">
      <h2 className="text-center text-2xl sm:text-3xl font-extrabold">
        Perguntas Frequentes
      </h2>
      <p className="mt-2 text-center text-gray-600 text-sm sm:text-base">
        Encontre respostas para as dúvidas mais comuns sobre o Salgadin.
      </p>
      <div className="mt-8 space-y-4">
        {faqItems.map((item) => {
          const isOpen = activeItem === item.q;

          return (
            <div
              key={item.q}
              className="rounded-2xl border border-black/10 bg-white shadow-sm overflow-hidden"
            >
              <button
                onClick={() => toggleItem(item.q)}
                className="w-full flex justify-between items-center text-left p-5 font-medium"
                aria-expanded={isOpen}
              >
                <span>{item.q}</span>
                <ChevronDown
                  className={clsx(
                    "h-5 w-5 transition-transform duration-300",
                    isOpen && "rotate-180"
                  )}
                />
              </button>

              <div
                className={clsx(
                  "transition-all duration-300 ease-in-out grid",
                  isOpen
                    ? "grid-rows-[1fr] opacity-100"
                    : "grid-rows-[0fr] opacity-0"
                )}
              >
                <div className="overflow-hidden">
                  <p className="px-5 pb-5 text-sm text-gray-600">{item.a}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
