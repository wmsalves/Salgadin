import { useCallback, useEffect, useMemo, useState } from "react";
import clsx from "clsx";
import {
  ChevronLeft,
  ChevronRight,
  Download,
  Pencil,
  Plus,
  Receipt,
  Repeat,
  Search,
  Trash2,
  X,
} from "lucide-react";

import { AddExpenseModal } from "../components/AddExpenseModal";
import { AddIncomeModal } from "../components/AddIncomeModal";
import { ConfirmActionModal } from "../components/ConfirmActionModal";
import { EmptyState } from "../components/EmptyState";
import { formatApiDate, formatDisplayDate } from "../lib/dates";
import type { Expense, Income, RecurringSchedule } from "../lib/types";
import { getCategories, type Category } from "../services/categoryService";
import { deleteExpense, getExpenses } from "../services/expenseService";
import { exportExpenses, exportIncomes } from "../services/exportService";
import { deleteIncome, getIncomes } from "../services/incomeService";
import { listRecurringSchedules } from "../services/recurringScheduleService";

type TypeFilter = "all" | "expense" | "income";

type Entry =
  | { kind: "expense"; key: string; date: string; amount: number; item: Expense }
  | { kind: "income"; key: string; date: string; amount: number; item: Income };

const currency = (value: number) =>
  value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

const dayKey = (value: string) => value.slice(0, 10);

const normalize = (value: string) =>
  value
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase();

function relativeDayLabel(key: string) {
  const today = formatApiDate(new Date());
  const yesterdayDate = new Date();
  yesterdayDate.setDate(yesterdayDate.getDate() - 1);
  const yesterday = formatApiDate(yesterdayDate);
  const full = formatDisplayDate(key, { weekday: "long", day: "2-digit", month: "long" });
  if (key === today) return `Hoje · ${full}`;
  if (key === yesterday) return `Ontem · ${full}`;
  return full;
}

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

const typeOptions: { value: TypeFilter; label: string }[] = [
  { value: "all", label: "Tudo" },
  { value: "expense", label: "Despesas" },
  { value: "income", label: "Receitas" },
];

export default function TransactionsPage() {
  const [currentMonth, setCurrentMonth] = useState(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  });
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [incomes, setIncomes] = useState<Income[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [recurringSchedules, setRecurringSchedules] = useState<RecurringSchedule[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [query, setQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<TypeFilter>("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("");

  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
  const [isIncomeModalOpen, setIsIncomeModalOpen] = useState(false);
  const [expenseToEdit, setExpenseToEdit] = useState<Expense | null>(null);
  const [incomeToEdit, setIncomeToEdit] = useState<Income | null>(null);
  const [entryToDelete, setEntryToDelete] = useState<Entry | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [exportError, setExportError] = useState<string | null>(null);

  const startDate = formatApiDate(currentMonth);
  const endDate = formatApiDate(
    new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0),
  );

  const monthLabel = currentMonth.toLocaleDateString("pt-BR", {
    month: "long",
    year: "numeric",
  });

  const fetchData = useCallback(async () => {
    try {
      setError(null);
      const [expenseData, incomeData] = await Promise.all([
        getExpenses(startDate, endDate),
        getIncomes(startDate, endDate),
      ]);
      setExpenses(expenseData);
      setIncomes(incomeData);
    } catch (err) {
      console.error("Falha ao carregar lançamentos:", err);
      setError("Não foi possível carregar seus lançamentos. Tente novamente em instantes.");
    }
  }, [startDate, endDate]);

  useEffect(() => {
    setIsLoading(true);
    fetchData().finally(() => setIsLoading(false));
  }, [fetchData]);

  useEffect(() => {
    getCategories()
      .then(setCategories)
      .catch((err) => console.error("Falha ao carregar categorias:", err));
    listRecurringSchedules()
      .then(setRecurringSchedules)
      .catch((err) => console.error("Falha ao carregar recorrências:", err));
  }, []);

  const entries = useMemo<Entry[]>(() => {
    const list: Entry[] = [
      ...expenses.map((item) => ({
        kind: "expense" as const,
        key: `e-${item.id}`,
        date: dayKey(item.date),
        amount: Math.abs(item.amount),
        item,
      })),
      ...incomes.map((item) => ({
        kind: "income" as const,
        key: `i-${item.id}`,
        date: dayKey(item.date),
        amount: Math.abs(item.amount),
        item,
      })),
    ];
    return list.sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0));
  }, [expenses, incomes]);

  const filtered = useMemo(() => {
    const q = normalize(query.trim());
    return entries.filter((entry) => {
      if (typeFilter !== "all" && entry.kind !== typeFilter) return false;
      if (categoryFilter) {
        if (entry.kind !== "expense" || entry.item.category !== categoryFilter) return false;
      }
      if (!q) return true;
      const haystack =
        entry.kind === "expense"
          ? `${entry.item.description} ${entry.item.category} ${entry.item.subcategory ?? ""}`
          : `${entry.item.description} receita`;
      return normalize(haystack).includes(q);
    });
  }, [entries, query, typeFilter, categoryFilter]);

  const totals = useMemo(() => {
    let income = 0;
    let expense = 0;
    for (const entry of filtered) {
      if (entry.kind === "income") income += entry.amount;
      else expense += entry.amount;
    }
    return { income, expense, balance: income - expense };
  }, [filtered]);

  const groups = useMemo(() => {
    const map = new Map<string, Entry[]>();
    for (const entry of filtered) {
      const list = map.get(entry.date) ?? [];
      list.push(entry);
      map.set(entry.date, list);
    }
    return [...map.entries()].map(([date, items]) => ({
      date,
      items,
      net: items.reduce(
        (sum, entry) => sum + (entry.kind === "income" ? entry.amount : -entry.amount),
        0,
      ),
    }));
  }, [filtered]);

  const hasFilters = query.trim() !== "" || typeFilter !== "all" || categoryFilter !== "";

  const clearFilters = () => {
    setQuery("");
    setTypeFilter("all");
    setCategoryFilter("");
  };

  const shiftMonth = (delta: number) => {
    setCurrentMonth((prev) => new Date(prev.getFullYear(), prev.getMonth() + delta, 1));
  };

  const openEdit = (entry: Entry) => {
    if (entry.kind === "expense") {
      setExpenseToEdit(entry.item);
      setIsExpenseModalOpen(true);
    } else {
      setIncomeToEdit(entry.item);
      setIsIncomeModalOpen(true);
    }
  };

  const handleDelete = async () => {
    if (!entryToDelete) return;
    setIsDeleting(true);
    setDeleteError(null);
    try {
      if (entryToDelete.kind === "expense") await deleteExpense(entryToDelete.item.id);
      else await deleteIncome(entryToDelete.item.id);
      await fetchData();
      setEntryToDelete(null);
    } catch (err) {
      console.error("Falha ao excluir lançamento:", err);
      setDeleteError("Não foi possível excluir este lançamento. Tente novamente.");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleExport = async () => {
    setIsExporting(true);
    setExportError(null);
    try {
      const month = startDate.slice(0, 7);
      if (typeFilter === "income") {
        downloadBlob(await exportIncomes(startDate, endDate), `receitas-${month}.csv`);
      } else {
        downloadBlob(
          await exportExpenses("csv", startDate, endDate, {
            category: categoryFilter || undefined,
          }),
          `despesas-${month}.csv`,
        );
      }
    } catch (err) {
      console.error("Falha ao exportar lançamentos:", err);
      setExportError("Não foi possível gerar o CSV agora. Tente novamente.");
    } finally {
      setIsExporting(false);
    }
  };

  const deleteLabel = entryToDelete?.kind === "income" ? "receita" : "despesa";

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <header className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="text-2xl font-medium text-foreground">Lançamentos</h1>
          <p className="mt-1 text-sm text-foreground-muted">
            Todas as receitas e despesas do mês, com busca e filtros.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => {
              setIncomeToEdit(null);
              setIsIncomeModalOpen(true);
            }}
            className="inline-flex min-h-10 items-center gap-2 whitespace-nowrap rounded-[var(--radius-control)] border border-border bg-surface px-3.5 text-ui font-medium text-foreground transition-colors hover:bg-surface-2"
          >
            <Plus size={15} />
            Nova receita
          </button>
          <button
            type="button"
            onClick={() => {
              setExpenseToEdit(null);
              setIsExpenseModalOpen(true);
            }}
            className="inline-flex min-h-10 items-center gap-2 whitespace-nowrap rounded-[var(--radius-control)] bg-primary px-3.5 text-ui font-medium text-[var(--color-on-primary)] transition-colors hover:bg-primary-strong"
          >
            <Plus size={15} />
            Nova despesa
          </button>
        </div>
      </header>

      <section className="rounded-2xl border border-border bg-surface">
        <div className="flex flex-col gap-3 border-b border-border p-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => shiftMonth(-1)}
              aria-label="Mês anterior"
              className="grid h-9 w-9 place-items-center rounded-lg text-foreground-muted transition-colors hover:bg-surface-2 hover:text-foreground"
            >
              <ChevronLeft size={18} />
            </button>
            <span className="sentence-case min-w-36 text-center text-sm font-medium text-foreground">
              {monthLabel}
            </span>
            <button
              type="button"
              onClick={() => shiftMonth(1)}
              aria-label="Próximo mês"
              className="grid h-9 w-9 place-items-center rounded-lg text-foreground-muted transition-colors hover:bg-surface-2 hover:text-foreground"
            >
              <ChevronRight size={18} />
            </button>
          </div>

          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <label className="relative block">
              <span className="sr-only">Buscar lançamentos</span>
              <Search
                size={15}
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-foreground-subtle"
              />
              <input
                id="transactions-search"
                type="search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Buscar lançamentos"
                className="ui-input h-10 w-full rounded-[var(--radius-control)] border border-border bg-background pl-9 pr-3 text-sm text-foreground placeholder:text-foreground-subtle outline-none focus:border-primary sm:w-64"
              />
            </label>
            <label className="block">
              <span className="sr-only">Filtrar por categoria</span>
              <select
                id="transactions-category"
                value={categoryFilter}
                onChange={(event) => {
                  setCategoryFilter(event.target.value);
                  if (event.target.value) setTypeFilter("expense");
                }}
                className="ui-input h-10 w-full rounded-[var(--radius-control)] border border-border bg-background px-3 text-sm text-foreground outline-none focus:border-primary sm:w-44"
              >
                <option value="">Todas as categorias</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.name}>
                    {category.name}
                  </option>
                ))}
              </select>
            </label>
          </div>
        </div>

        <div className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
          <div
            role="radiogroup"
            aria-label="Tipo de lançamento"
            className="inline-flex w-fit rounded-[var(--radius-control)] border border-border bg-background p-1"
          >
            {typeOptions.map((option) => (
              <button
                key={option.value}
                type="button"
                role="radio"
                aria-checked={typeFilter === option.value}
                onClick={() => {
                  setTypeFilter(option.value);
                  if (option.value === "income") setCategoryFilter("");
                }}
                className={clsx(
                  "rounded-md px-3 py-1.5 text-ui font-medium transition-colors",
                  typeFilter === option.value
                    ? "bg-surface text-foreground shadow-[var(--shadow-card)]"
                    : "text-foreground-muted hover:text-foreground",
                )}
              >
                {option.label}
              </button>
            ))}
          </div>

          <dl className="grid grid-cols-3 gap-4 text-right tabular-nums sm:flex sm:gap-6">
            <div>
              <dt className="text-xs text-foreground-subtle">Entradas</dt>
              <dd className="text-sm font-medium text-success">{currency(totals.income)}</dd>
            </div>
            <div>
              <dt className="text-xs text-foreground-subtle">Saídas</dt>
              <dd className="text-sm font-medium text-danger">{currency(totals.expense)}</dd>
            </div>
            <div>
              <dt className="text-xs text-foreground-subtle">Saldo</dt>
              <dd className="text-sm font-medium text-foreground">{currency(totals.balance)}</dd>
            </div>
          </dl>
        </div>
      </section>

      {error ? (
        <div
          role="alert"
          className="flex flex-col gap-3 rounded-2xl border border-danger/30 bg-danger/5 p-4 text-sm sm:flex-row sm:items-center sm:justify-between"
        >
          <p className="text-foreground">{error}</p>
          <button
            type="button"
            onClick={() => {
              setIsLoading(true);
              fetchData().finally(() => setIsLoading(false));
            }}
            className="w-fit rounded-[var(--radius-control)] border border-border bg-surface px-3 py-1.5 text-ui font-medium text-foreground hover:bg-surface-2"
          >
            Tentar novamente
          </button>
        </div>
      ) : isLoading ? (
        <div className="space-y-3" aria-busy="true" aria-label="Carregando lançamentos">
          {[0, 1, 2].map((index) => (
            <div key={index} className="h-28 animate-pulse rounded-2xl border border-border bg-surface" />
          ))}
        </div>
      ) : entries.length === 0 ? (
        <EmptyState
          icon={Receipt}
          title="Nenhum lançamento neste mês"
          description="Registre um gasto ou uma receita para começar a acompanhar o mês."
          primaryAction={{
            label: "Adicionar despesa",
            onClick: () => {
              setExpenseToEdit(null);
              setIsExpenseModalOpen(true);
            },
          }}
          secondaryAction={{
            label: "Adicionar receita",
            onClick: () => {
              setIncomeToEdit(null);
              setIsIncomeModalOpen(true);
            },
          }}
        />
      ) : filtered.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border bg-surface px-6 py-10 text-center">
          <p className="text-sm font-medium text-foreground">Nada encontrado com esses filtros</p>
          <p className="mt-1 text-ui text-foreground-muted">
            Tente outra busca ou limpe os filtros para ver todos os lançamentos do mês.
          </p>
          <button
            type="button"
            onClick={clearFilters}
            className="mt-4 inline-flex items-center gap-1.5 rounded-[var(--radius-control)] border border-border px-3 py-1.5 text-ui font-medium text-foreground hover:bg-surface-2"
          >
            <X size={14} />
            Limpar filtros
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {groups.map((group) => (
            <section
              key={group.date}
              aria-label={relativeDayLabel(group.date)}
              className="overflow-hidden rounded-2xl border border-border bg-surface"
            >
              <header className="flex items-center justify-between gap-3 border-b border-border bg-surface-2/60 px-4 py-2">
                <h2 className="sentence-case text-ui font-medium text-foreground-muted">
                  {relativeDayLabel(group.date)}
                </h2>
                <span
                  className={clsx(
                    "text-ui tabular-nums",
                    group.net >= 0 ? "text-success" : "text-foreground-muted",
                  )}
                >
                  {group.net >= 0 ? "+" : "−"}
                  {currency(Math.abs(group.net))}
                </span>
              </header>
              <ul className="divide-y divide-border">
                {group.items.map((entry) => {
                  const isExpense = entry.kind === "expense";
                  const meta = isExpense
                    ? [entry.item.category, entry.item.subcategory].filter(Boolean).join(" · ")
                    : entry.item.isFixed
                      ? "Receita fixa"
                      : "Receita extra";
                  return (
                    <li
                      key={entry.key}
                      className="group flex items-center gap-3 px-4 py-3"
                    >
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm text-foreground">
                          {entry.item.description}
                        </p>
                        <p className="mt-0.5 flex items-center gap-1.5 truncate text-xs text-foreground-subtle">
                          {entry.item.recurringScheduleId ? (
                            <Repeat size={11} aria-label="Recorrente" />
                          ) : null}
                          {meta}
                        </p>
                      </div>
                      <span
                        className={clsx(
                          "shrink-0 text-sm font-medium tabular-nums",
                          isExpense ? "text-foreground" : "text-success",
                        )}
                      >
                        {isExpense ? "−" : "+"}
                        {currency(entry.amount)}
                      </span>
                      <div className="flex shrink-0 items-center transition-opacity [@media(hover:hover)]:opacity-0 [@media(hover:hover)]:group-hover:opacity-100 [@media(hover:hover)]:group-focus-within:opacity-100">
                        <button
                          type="button"
                          onClick={() => openEdit(entry)}
                          aria-label={`Editar ${entry.item.description}`}
                          className="grid h-9 w-9 place-items-center rounded-lg text-foreground-subtle transition-colors hover:bg-surface-2 hover:text-foreground"
                        >
                          <Pencil size={15} />
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setDeleteError(null);
                            setEntryToDelete(entry);
                          }}
                          aria-label={`Excluir ${entry.item.description}`}
                          className="grid h-9 w-9 place-items-center rounded-lg text-foreground-subtle transition-colors hover:bg-danger/10 hover:text-danger"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </section>
          ))}

          <div className="flex flex-col items-start gap-2 pt-2 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-ui text-foreground-subtle">
              {filtered.length} {filtered.length === 1 ? "lançamento" : "lançamentos"}
              {hasFilters ? " com os filtros atuais" : " neste mês"}
            </p>
            <div className="flex items-center gap-3">
              {exportError && <p className="text-ui text-danger">{exportError}</p>}
              <button
                type="button"
                onClick={handleExport}
                disabled={isExporting}
                className="inline-flex items-center gap-2 rounded-[var(--radius-control)] border border-border bg-surface px-3 py-1.5 text-ui font-medium text-foreground transition-colors hover:bg-surface-2 disabled:opacity-60"
              >
                <Download size={14} />
                {isExporting
                  ? "Gerando CSV..."
                  : typeFilter === "income"
                    ? "Exportar receitas (CSV)"
                    : "Exportar despesas (CSV)"}
              </button>
            </div>
          </div>
        </div>
      )}

      <AddExpenseModal
        isOpen={isExpenseModalOpen}
        onClose={() => {
          setIsExpenseModalOpen(false);
          setExpenseToEdit(null);
        }}
        onSuccess={fetchData}
        expenseToEdit={expenseToEdit}
        recurringSchedules={recurringSchedules}
      />
      <AddIncomeModal
        isOpen={isIncomeModalOpen}
        onClose={() => {
          setIsIncomeModalOpen(false);
          setIncomeToEdit(null);
        }}
        onSuccess={fetchData}
        incomeToEdit={incomeToEdit}
        recurringSchedules={recurringSchedules}
      />
      <ConfirmActionModal
        isOpen={entryToDelete !== null}
        title={`Excluir ${deleteLabel}`}
        description={`Você está prestes a excluir permanentemente "${entryToDelete?.item.description ?? ""}". Esta ação não poderá ser desfeita.`}
        confirmLabel="Sim, excluir"
        onClose={() => {
          if (isDeleting) return;
          setDeleteError(null);
          setEntryToDelete(null);
        }}
        onConfirm={handleDelete}
        isConfirming={isDeleting}
        errorMessage={deleteError}
      />
    </div>
  );
}
