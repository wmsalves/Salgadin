import { features } from "./content";
import clsx from "clsx";

export function FeaturesSection() {
  return (
    <section id="features" className="mx-auto max-w-6xl px-4 py-10">
      <h2 className="text-center text-2xl sm:text-3xl font-extrabold">
        Tudo o que você precisa para gerenciar
        <br className="hidden sm:block" /> suas finanças
      </h2>
      <p className="mt-3 text-center max-w-3xl mx-auto text-gray-600 text-sm sm:text-base">
        O Salgadin oferece ferramentas poderosas e intuitivas para ajudar você a
        controlar seus gastos, economizar dinheiro e alcançar seus objetivos
        financeiros.
      </p>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {features.map((feature) => (
          <div
            key={feature.title}
            className="rounded-2xl border border-black/10 bg-white p-5 shadow-sm transition-all hover:shadow-lg hover:-translate-y-1"
          >
            <div className="flex items-start gap-4">
              <div
                className={clsx(
                  "h-10 w-10 grid place-items-center rounded-full flex-shrink-0",
                  feature.colorTheme === "emerald" && "bg-emerald-100",
                  feature.colorTheme === "amber" && "bg-amber-100"
                )}
              >
                <feature.icon
                  className={clsx(
                    "h-5 w-5",
                    feature.colorTheme === "emerald" && "text-emerald-600",
                    feature.colorTheme === "amber" && "text-amber-600"
                  )}
                  aria-hidden="true"
                />
              </div>
              <div>
                <h3 className="font-semibold">{feature.title}</h3>
                <p className="mt-1 text-sm text-gray-600">{feature.desc}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
