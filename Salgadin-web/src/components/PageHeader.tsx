import type { ReactNode } from "react";

interface PageHeaderProps {
  title: string;
  description?: ReactNode;
  /** Botoes da pagina. Ficam a direita no desktop e abaixo do titulo no celular. */
  actions?: ReactNode;
}

/** Cabecalho padrao das telas logadas. */
export function PageHeader({ title, description, actions }: PageHeaderProps) {
  return (
    <header className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
      <div className="min-w-0">
        <h1 className="text-2xl font-medium text-foreground">{title}</h1>
        {description && (
          <p className="mt-1 max-w-2xl text-sm text-foreground-muted">{description}</p>
        )}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </header>
  );
}

interface StatItem {
  label: string;
  value: ReactNode;
  hint?: ReactNode;
  tone?: "default" | "success" | "danger" | "warning";
}

const toneClass = {
  default: "text-foreground",
  success: "text-success",
  danger: "text-danger",
  warning: "text-warning",
} as const;

/** Faixa de indicadores em linha, no lugar de varios cards pequenos. */
export function StatRow({ items }: { items: StatItem[] }) {
  return (
    <dl className="grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-border bg-border sm:flex [&>*:last-child:nth-child(odd)]:col-span-2">
      {items.map((item) => (
        <div key={item.label} className="min-w-0 flex-1 bg-surface px-4 py-3.5">
          <dt className="truncate text-xs text-foreground-subtle">{item.label}</dt>
          <dd className={`mt-1 truncate text-lg font-medium tabular-nums ${toneClass[item.tone ?? "default"]}`}>
            {item.value}
          </dd>
          {item.hint && <dd className="truncate text-xs text-foreground-muted">{item.hint}</dd>}
        </div>
      ))}
    </dl>
  );
}
