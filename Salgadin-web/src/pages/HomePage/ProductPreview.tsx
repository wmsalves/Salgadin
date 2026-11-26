import { Plus } from "lucide-react";
import { MonthOverview } from "../../components/dashboard/MonthOverview";
import type { MonthSummary } from "../../lib/monthSummary";
import type { Goal } from "../../lib/types";

// Dados de exemplo para mostrar o Inicio real do app na landing.
const exampleSummary: MonthSummary = {
  timing: "current",
  daysLeft: 12,
  lastDay: 30,
  incomeRegistered: 4800,
  incomePending: 0,
  incomeTotal: 4800,
  smallExpenses: 386.4,
  smallExpensesCount: 31,
  otherExpenses: 912.3,
  fixedRegistered: 1450,
  fixedPending: 189.9,
  expenseRegistered: 2748.7,
  expenseTotal: 2938.6,
  free: 1861.4,
  perDay: 1861.4 / 12,
  pendingExpenses: [],
  pendingIncomes: [],
  topCategory: { name: "Alimentação", total: 842.7 },
};

const exampleGoals: Goal[] = [
  { id: 1, category: "Alimentação", monthlyLimit: 1000, alertThreshold: 0.8, isActive: true },
  { id: 2, category: "Lazer", monthlyLimit: 300, alertThreshold: 0.8, isActive: true },
];

const recent = [
  { description: "Café na padaria", meta: "Alimentação · hoje", amount: "−R$ 7,50" },
  { description: "Coxinha e suco", meta: "Alimentação · hoje", amount: "−R$ 14,90" },
  { description: "Uber para o trabalho", meta: "Transporte · ontem", amount: "−R$ 23,40" },
  { description: "Freela de design", meta: "Receita extra · 16 de nov.", amount: "+R$ 650,00", income: true },
];

const frequent = [
  ["Café", "R$ 7,50"],
  ["Coxinha", "R$ 8,00"],
  ["Ônibus", "R$ 4,40"],
];

/** Tela de Inicio do app com dados de exemplo. Nao interativa. */
export function ProductPreview() {
  return (
    <figure
      aria-label="Exemplo da tela inicial do Salgadin"
      className="mx-auto w-full max-w-5xl rounded-[20px] border border-border bg-background p-3 shadow-[var(--shadow-overlay)] sm:p-4"
    >
      <div className="pointer-events-none grid select-none gap-3 lg:grid-cols-[minmax(0,1.45fr)_minmax(0,1fr)]" aria-hidden="true">
        <div className="space-y-3">
          <div className="rounded-2xl border border-border bg-surface p-4">
            <div className="flex gap-2">
              <div className="flex h-11 min-w-0 flex-1 items-center rounded-[var(--radius-control)] border border-border bg-background px-3.5 text-sm text-foreground">
                coxinha 8
                <span className="ml-px h-4 w-px animate-pulse bg-foreground motion-reduce:animate-none" />
              </div>
              <span className="inline-flex h-11 shrink-0 items-center gap-1.5 rounded-[var(--radius-control)] bg-primary px-4 text-ui font-medium text-[var(--color-on-primary)]">
                <Plus size={15} />
                Registrar
              </span>
            </div>
            <div className="mt-3 flex flex-wrap items-center gap-1.5">
              <span className="mr-1 text-xs text-foreground-subtle">Frequentes</span>
              {frequent.map(([label, value]) => (
                <span
                  key={label}
                  className="inline-flex min-h-8 items-center gap-1.5 rounded-full border border-border bg-background px-3 text-ui text-foreground-muted"
                >
                  {label}
                  <span className="font-medium text-foreground tabular-nums">{value}</span>
                </span>
              ))}
            </div>
          </div>
          <MonthOverview
            summary={exampleSummary}
            monthName="novembro"
            goals={exampleGoals}
            alerts={[]}
            onAddIncome={() => undefined}
          />
        </div>

        <div className="hidden rounded-2xl border border-border bg-surface lg:block">
          <p className="px-5 pb-2 pt-5 text-base font-medium text-foreground">Últimos lançamentos</p>
          <ul className="divide-y divide-border px-5 pb-2">
            {recent.map((item) => (
              <li key={item.description} className="flex items-center gap-3 py-3">
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm text-foreground">{item.description}</p>
                  <p className="mt-0.5 truncate text-xs text-foreground-subtle">{item.meta}</p>
                </div>
                <span
                  className={`shrink-0 text-sm font-medium tabular-nums ${item.income ? "text-success" : "text-foreground"}`}
                >
                  {item.amount}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>
      <figcaption className="px-1 pt-3 text-center text-xs text-foreground-subtle">
        Tela inicial do Salgadin com dados de exemplo.
      </figcaption>
    </figure>
  );
}
