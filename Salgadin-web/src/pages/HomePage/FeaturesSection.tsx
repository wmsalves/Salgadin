import clsx from "clsx";
import { features } from "./content";

export function FeaturesSection() {
  return (
    <section id="features" className="mx-auto max-w-7xl scroll-mt-24 px-4 py-16">
      <h2 className="text-center text-3xl font-extrabold text-foreground sm:text-4xl md:text-5xl">
        Clareza para os gastos que somem
        <br className="hidden sm:block" /> no dia a dia
      </h2>
      <p className="mx-auto mt-4 max-w-3xl text-center text-base leading-7 text-foreground-muted">
        Organize pequenas despesas com uma linguagem simples: o que entrou, o
        que saiu, onde se repete e o que pode ser ajustado no mês.
      </p>

      <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {features.map((feature) => (
          <div
            key={feature.title}
            className="group rounded-[var(--radius-card)] border border-border bg-surface p-6 shadow-[var(--shadow-card)] transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-[var(--shadow-card-hover)] ui-pressable ui-card"
          >
            <div className="flex items-start gap-4">
              <div
                className={clsx(
                  "grid h-12 w-12 flex-shrink-0 place-items-center rounded-xl transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-105",
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
                <p className="mt-2 text-sm leading-6 text-foreground-muted">
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
