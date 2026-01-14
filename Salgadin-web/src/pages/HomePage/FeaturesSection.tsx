import { features } from "./content";
import clsx from "clsx";

export function FeaturesSection() {
  return (
    <section id="features" className="mx-auto max-w-7xl px-4 py-16">
      <h2 className="text-center text-3xl sm:text-4xl md:text-5xl font-extrabold text-slate-800">
        Tudo o que você precisa para gerenciar
        <br className="hidden sm:block" /> suas finanças
      </h2>
      <p className="mt-4 text-center max-w-3xl mx-auto text-slate-600 text-base">
        O Salgadin oferece ferramentas poderosas e intuitivas para ajudar você a
        controlar seus gastos, economizar dinheiro e alcançar seus objetivos
        financeiros.
      </p>

      <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {features.map((feature) => (
          <div
            key={feature.title}
            className="group rounded-xl border border-slate-200 bg-white p-6 shadow-sm transition-all hover:shadow-lg hover:border-emerald-200 hover:-translate-y-1"
          >
            <div className="flex items-start gap-4">
              <div
                className={clsx(
                  "h-12 w-12 grid place-items-center rounded-lg flex-shrink-0 transition-colors group-hover:scale-110",
                  feature.colorTheme === "emerald" &&
                    "bg-emerald-100 group-hover:bg-emerald-200",
                  feature.colorTheme === "amber" &&
                    "bg-amber-100 group-hover:bg-amber-200"
                )}
              >
                <feature.icon
                  className={clsx(
                    "h-6 w-6",
                    feature.colorTheme === "emerald" && "text-emerald-600",
                    feature.colorTheme === "amber" && "text-amber-600"
                  )}
                  aria-hidden="true"
                />
              </div>
              <div>
                <h3 className="font-semibold text-slate-800">
                  {feature.title}
                </h3>
                <p className="mt-2 text-sm text-slate-600">{feature.desc}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
