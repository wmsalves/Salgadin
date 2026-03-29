import { features } from "./content";
import clsx from "clsx";

export function FeaturesSection() {
  return (
    <section id="features" className="mx-auto max-w-7xl px-4 py-16 scroll-mt-24">
      <h2 className="text-center text-3xl sm:text-4xl md:text-5xl font-extrabold text-foreground">
        Tudo o que você precisa para gerenciar
        <br className="hidden sm:block" /> suas finanças
      </h2>
      <p className="mt-4 text-center max-w-3xl mx-auto text-foreground-muted text-base">
        O Salgadin oferece ferramentas poderosas e intuitivas para ajudar você a
        controlar seus gastos, economizar dinheiro e alcançar seus objetivos
        financeiros.
      </p>

      <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {features.map((feature) => (
          <div
            key={feature.title}
            className="group rounded-xl border border-border bg-surface p-6 shadow-sm transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] hover:shadow-lg hover:border-primary/40 hover:-translate-y-0.5 ui-pressable ui-card"
          >
            <div className="flex items-start gap-4">
              <div
                className={clsx(
                  "h-12 w-12 grid place-items-center rounded-lg flex-shrink-0 transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-105",
                  feature.colorTheme === "emerald" &&
                    "bg-surface-2 text-success group-hover:bg-surface-3",
                  feature.colorTheme === "amber" &&
                    "bg-surface-2 text-accent group-hover:bg-surface-3"
                )}
              >
                <feature.icon
                  className={clsx(
                    "h-6 w-6",
                    feature.colorTheme === "emerald" && "text-success",
                    feature.colorTheme === "amber" && "text-accent"
                  )}
                  aria-hidden="true"
                />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">
                  {feature.title}
                </h3>
                <p className="mt-2 text-sm text-foreground-muted">
                  {feature.desc}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}


