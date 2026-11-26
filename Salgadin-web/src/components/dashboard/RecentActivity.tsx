import { ArrowRight, Pencil, Receipt, Trash2 } from "lucide-react";
import { Link } from "react-router-dom";
import clsx from "clsx";
import { AnimatePresence, motion } from "framer-motion";
import { listItemMotion } from "../../lib/motion";

import { EmptyState } from "../EmptyState";
import { formatDisplayDate } from "../../lib/dates";
import type { Expense, Income } from "../../lib/types";

const currency = (value: number) =>
  value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

type Item =
  | { kind: "expense"; key: string; date: string; item: Expense }
  | { kind: "income"; key: string; date: string; item: Income };

interface RecentActivityProps {
  expenses: Expense[];
  incomes: Income[];
  limit?: number;
  onEditExpense: (expense: Expense) => void;
  onEditIncome: (income: Income) => void;
  onDeleteExpense: (expense: Expense) => void;
  onDeleteIncome: (income: Income) => void;
  onAddExpense: () => void;
  /** Chave ("e-12" ou "i-3") do lancamento recem-criado, para destaca-lo. */
  highlightKey?: string | null;
}

export function RecentActivity({
  expenses,
  incomes,
  limit = 6,
  onEditExpense,
  onEditIncome,
  onDeleteExpense,
  onDeleteIncome,
  onAddExpense,
  highlightKey = null,
}: RecentActivityProps) {
  const items: Item[] = [
    ...expenses.map((item) => ({ kind: "expense" as const, key: `e-${item.id}`, date: item.date.slice(0, 10), item })),
    ...incomes.map((item) => ({ kind: "income" as const, key: `i-${item.id}`, date: item.date.slice(0, 10), item })),
  ]
    .sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : b.item.id - a.item.id))
    .slice(0, limit);

  return (
    <section className="rounded-2xl border border-border bg-surface">
      <header className="flex items-center justify-between gap-3 px-5 pb-2 pt-5">
        <h2 className="text-base font-medium text-foreground">Últimos lançamentos</h2>
        <Link
          to="/lancamentos"
          className="inline-flex items-center gap-1 text-ui font-medium text-primary transition-colors hover:text-primary-strong"
        >
          Ver todos
          <ArrowRight size={14} />
        </Link>
      </header>

      {items.length === 0 ? (
        <div className="p-5 pt-2">
          <EmptyState
            icon={Receipt}
            title="Nenhum lançamento neste mês"
            description="Comece por algo pequeno, como café, lanche ou transporte. É isso que revela seus hábitos."
            primaryAction={{ label: "Adicionar despesa", onClick: onAddExpense }}
            compact
          />
        </div>
      ) : (
        <ul className="px-5 pb-2">
          <AnimatePresence initial={false}>
          {items.map((entry) => {
            const isExpense = entry.kind === "expense";
            const meta = isExpense
              ? entry.item.category
              : entry.item.isFixed
                ? "Receita fixa"
                : "Receita extra";
            return (
              <motion.li
                key={entry.key}
                layout="position"
                {...listItemMotion}
                className={clsx(
                  "group -mx-2 flex items-center gap-3 overflow-hidden rounded-lg border-t border-border px-2 py-3 first:border-t-0",
                  entry.key === highlightKey && "salgadin-highlight",
                )}
              >
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm text-foreground">{entry.item.description}</p>
                  <p className="mt-0.5 truncate text-xs text-foreground-subtle">
                    {meta} · {formatDisplayDate(entry.date, { day: "2-digit", month: "short" })}
                  </p>
                </div>
                <span
                  className={clsx(
                    "shrink-0 text-sm font-medium tabular-nums",
                    isExpense ? "text-foreground" : "text-success",
                  )}
                >
                  {isExpense ? "−" : "+"}
                  {currency(Math.abs(entry.item.amount))}
                </span>
                <div className="flex shrink-0 items-center transition-opacity [@media(hover:hover)]:opacity-0 [@media(hover:hover)]:group-hover:opacity-100 [@media(hover:hover)]:group-focus-within:opacity-100">
                  <button
                    type="button"
                    onClick={() =>
                      entry.kind === "expense" ? onEditExpense(entry.item) : onEditIncome(entry.item)
                    }
                    aria-label={`Editar ${entry.item.description}`}
                    className="grid h-9 w-9 place-items-center rounded-lg text-foreground-subtle transition-colors hover:bg-surface-2 hover:text-foreground"
                  >
                    <Pencil size={15} />
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      entry.kind === "expense" ? onDeleteExpense(entry.item) : onDeleteIncome(entry.item)
                    }
                    aria-label={`Excluir ${entry.item.description}`}
                    className="grid h-9 w-9 place-items-center rounded-lg text-foreground-subtle transition-colors hover:bg-danger/10 hover:text-danger"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </motion.li>
            );
          })}
          </AnimatePresence>
        </ul>
      )}
    </section>
  );
}
