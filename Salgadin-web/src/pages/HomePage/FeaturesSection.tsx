import clsx from "clsx";
import { differentiators, features } from "./content";

export function FeaturesSection() {
  return (
    <section id="features" className="mx-auto max-w-7xl scroll-mt-24 px-4 py-20 sm:py-28">
      <div className="text-center">
        <h2 className="mx-auto max-w-2xl text-3xl font-medium text-foreground sm:text-4xl">
          Um app para transformar pequenos gastos em clareza
        </h2>
        <p className="mx-auto mt-4 max-w-2xl text-base text-foreground-muted">
          O Salgadin ajuda você a registrar, visualizar e ajustar hábitos financeiros
          sem virar refém de planilhas ou telas complicadas.
        </p>
      </div>

      <div className="mt-12 grid gap-5 md:grid-cols-3">
        {features.map((feature) => (
          <div
            key={feature.title}
            className="rounded-[var(--radius-card)] border border-border bg-surface p-5 sm:p-6"
          >
            <div className="flex items-start gap-4">
              <div
                className={clsx(
                  "grid h-11 w-11 flex-shrink-0 place-items-center rounded-xl",
                  feature.colorTheme === "emerald" &&
                    "bg-surface-2 text-success",
                  feature.colorTheme === "amber" &&
                    "bg-surface-2 text-accent",
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
                <h3 className="text-base font-medium text-foreground">{feature.title}</h3>
                <p className="mt-1.5 text-ui text-foreground-muted">
                  {feature.desc}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-12 rounded-[var(--radius-card)] border border-border bg-surface p-6 sm:p-8">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div className="max-w-2xl">
            <h3 className="text-xl font-medium text-foreground sm:text-2xl">
              Tudo o que você precisa para acompanhar o mês
            </h3>
          </div>
          <p className="max-w-xl text-sm leading-6 text-foreground-muted sm:text-right">
            Registro, categorias, gráficos, metas e resumos trabalhando juntos,
            para você enxergar os pequenos gastos antes que eles cresçam.
          </p>
        </div>

        <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {differentiators.map((item) => (
            <div
              key={item.title}
              className="rounded-2xl border border-border bg-surface-2/55 p-4 sm:p-5"
            >
              <div className="grid h-11 w-11 place-items-center rounded-xl bg-surface text-primary">
                <item.icon className="h-5 w-5" aria-hidden="true" />
              </div>
              <h4 className="mt-4 text-sm font-medium text-foreground">{item.title}</h4>
              <p className="mt-1.5 text-ui text-foreground-muted">
                {item.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
