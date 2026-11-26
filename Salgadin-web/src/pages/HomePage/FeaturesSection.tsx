import type { ReactNode } from "react";
import { Plus } from "lucide-react";

function Tile({
  title,
  description,
  children,
  className = "",
}: {
  title: string;
  description: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <article className={`flex flex-col rounded-2xl border border-border bg-surface p-5 sm:p-6 ${className}`}>
      <h3 className="text-base font-medium text-foreground">{title}</h3>
      <p className="mt-1.5 max-w-md text-ui text-foreground-muted">{description}</p>
      <div className="mt-5 flex-1" aria-hidden="true">
        {children}
      </div>
    </article>
  );
}

function Bar({ label, percent, tone }: { label: string; percent: number; tone: "ok" | "warn" }) {
  return (
    <div>
      <div className="flex justify-between text-xs">
        <span className="text-foreground">{label}</span>
        <span className={`tabular-nums ${tone === "warn" ? "text-warning" : "text-foreground-muted"}`}>
          {percent}%
        </span>
      </div>
      <div className="mt-1.5 h-2 rounded-full bg-surface-2">
        <div
          className={`h-2 rounded-full ${tone === "warn" ? "bg-warning" : "bg-success"}`}
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}

const miniRow = "flex items-center justify-between gap-3 py-2 text-ui";

export function FeaturesSection() {
  return (
    <section id="features" aria-labelledby="features-title" className="mx-auto max-w-6xl scroll-mt-24 px-4 py-20 sm:py-28">
      <div className="max-w-2xl">
        <h2 id="features-title" className="text-3xl font-medium text-foreground sm:text-4xl">
          Tudo o que você precisa para acompanhar o mês
        </h2>
        <p className="mt-3 text-base text-foreground-muted">
          Registrar é rápido, e o resto se organiza sozinho: categorias, metas, contas fixas e
          relatórios.
        </p>
      </div>

      <div className="mt-12 grid gap-4 lg:grid-cols-3">
        <Tile
          className="lg:col-span-2"
          title="Registre em segundos"
          description="Escreva como você falaria. O Salgadin entende o valor, a data e sugere a categoria pelo seu histórico."
        >
          <div className="rounded-xl border border-border bg-background p-3">
            <div className="flex gap-2">
              <div className="flex h-10 min-w-0 flex-1 items-center rounded-[var(--radius-control)] border border-border bg-surface px-3 text-sm text-foreground">
                uber 23,40 ontem
              </div>
              <span className="inline-flex h-10 items-center gap-1.5 rounded-[var(--radius-control)] bg-primary px-3.5 text-ui font-medium text-[var(--color-on-primary)]">
                <Plus size={14} />
                Registrar
              </span>
            </div>
            <p className="mt-3 text-ui text-foreground-muted">
              <span className="font-medium text-foreground">Uber</span>{" "}
              <span className="tabular-nums">R$ 23,40</span> registrado em Transporte, ontem.
            </p>
          </div>
        </Tile>

        <Tile
          title="Metas que avisam antes"
          description="Defina um limite por categoria e veja quando um gasto chega perto dele."
        >
          <div className="space-y-4">
            <Bar label="Alimentação" percent={84} tone="warn" />
            <Bar label="Lazer" percent={41} tone="ok" />
          </div>
        </Tile>

        <Tile
          title="Contas fixas no lugar certo"
          description="Aluguel, internet e assinaturas entram no cálculo do mês antes mesmo de vencer."
        >
          <ul className="divide-y divide-border rounded-xl border border-border bg-background px-3">
            {[
              ["Aluguel", "dia 5", "R$ 1.450,00"],
              ["Internet", "dia 10", "R$ 99,90"],
              ["Streaming", "dia 18", "R$ 39,90"],
            ].map(([name, day, value]) => (
              <li key={name} className={miniRow}>
                <span className="text-foreground">
                  {name} <span className="text-foreground-subtle">· {day}</span>
                </span>
                <span className="tabular-nums text-foreground">{value}</span>
              </li>
            ))}
          </ul>
        </Tile>

        <Tile
          className="lg:col-span-2"
          title="Cada lançamento, dia a dia"
          description="Busque, filtre por categoria e exporte em CSV quando precisar. Seus dados continuam sendo seus."
        >
          <div className="overflow-hidden rounded-xl border border-border bg-background">
            <div className="flex justify-between border-b border-border bg-surface-2/60 px-3 py-2 text-xs text-foreground-muted">
              <span>Hoje · quinta-feira, 26 de novembro</span>
              <span className="tabular-nums">−R$ 22,40</span>
            </div>
            <ul className="divide-y divide-border px-3">
              {[
                ["Café na padaria", "Alimentação", "−R$ 7,50"],
                ["Coxinha e suco", "Alimentação", "−R$ 14,90"],
              ].map(([name, category, value]) => (
                <li key={name} className={miniRow}>
                  <span className="min-w-0">
                    <span className="block truncate text-foreground">{name}</span>
                    <span className="block text-xs text-foreground-subtle">{category}</span>
                  </span>
                  <span className="tabular-nums text-foreground">{value}</span>
                </li>
              ))}
            </ul>
          </div>
        </Tile>
      </div>
    </section>
  );
}
