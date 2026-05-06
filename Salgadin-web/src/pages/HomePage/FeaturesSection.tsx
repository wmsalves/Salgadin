import clsx from "clsx";
import { differentiators, features } from "./content";

export function FeaturesSection() {
  return (
    <section id="features" className="mx-auto max-w-7xl scroll-mt-24 px-4 py-16 sm:py-20">
      <div className="text-center">
        <p className="text-sm font-semibold uppercase tracking-[0.12em] text-primary">
          Beneficios
        </p>
        <h2 className="mt-3 text-3xl font-extrabold text-foreground sm:text-4xl md:text-5xl">
          Um app para transformar
          <br className="hidden sm:block" /> pequenos gastos em clareza
        </h2>
        <p className="mx-auto mt-4 max-w-3xl text-base leading-7 text-foreground-muted">
          O Salgadin ajuda voce a registrar, visualizar e ajustar habitos financeiros
          sem virar refem de planilhas ou telas complicadas.
        </p>
      </div>

      <div className="mt-12 grid gap-5 md:grid-cols-3">
        {features.map((feature) => (
          <div
            key={feature.title}
            className="group rounded-[var(--radius-card)] border border-border bg-surface p-5 shadow-[var(--shadow-card)] transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-[var(--shadow-card-hover)] ui-pressable ui-card sm:p-6"
          >
            <div className="flex items-start gap-4">
              <div
                className={clsx(
                  "grid h-12 w-12 flex-shrink-0 place-items-center rounded-xl transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-105",
                  feature.colorTheme === "emerald" &&
                    "bg-surface-2 text-success group-hover:bg-surface-3",
                  feature.colorTheme === "amber" &&
                    "bg-surface-2 text-accent group-hover:bg-surface-3",
                )}
              >
                <feature.icon
                  className={clsx(
                    "h-6 w-6",
                    feature.colorTheme === "emerald" && "text-success",
                    feature.colorTheme === "amber" && "text-accent",
                  )}
                  aria-hidden="true"
                />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">{feature.title}</h3>
                <p className="mt-2 text-sm leading-6 text-foreground-muted">
                  {feature.desc}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-12 rounded-[var(--radius-card)] border border-border/70 bg-surface/85 p-6 shadow-[var(--shadow-card)] sm:p-8">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div className="max-w-2xl">
            <p className="text-sm font-semibold uppercase tracking-[0.12em] text-accent">
              Diferenciais
            </p>
            <h3 className="mt-2 text-2xl font-extrabold text-foreground sm:text-3xl">
              Feito para um SaaS financeiro simples, util e realista
            </h3>
          </div>
          <p className="max-w-xl text-sm leading-6 text-foreground-muted sm:text-right">
            O foco nao e prometer automacao que ainda nao existe. O foco e te dar
            visibilidade clara sobre o que voce ja pode controlar hoje.
          </p>
        </div>

        <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {differentiators.map((item) => (
            <div
              key={item.title}
              className="rounded-2xl border border-border/70 bg-surface-2/55 p-4 sm:p-5"
            >
              <div className="grid h-11 w-11 place-items-center rounded-xl bg-surface text-primary shadow-[0_8px_18px_rgba(60,42,32,0.08)]">
                <item.icon className="h-5 w-5" aria-hidden="true" />
              </div>
              <h4 className="mt-4 text-base font-semibold text-foreground">{item.title}</h4>
              <p className="mt-2 text-sm leading-6 text-foreground-muted">
                {item.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
