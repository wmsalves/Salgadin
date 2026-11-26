import { useCallback, useEffect, useRef, useState, type FormEvent } from "react";
import { AxiosError } from "axios";
import { Loader2, Plus } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { statusMotion } from "../../lib/motion";

import { formatApiDate } from "../../lib/dates";
import type { Expense } from "../../lib/types";
import {
  addExpense,
  addQuickExpense,
  deleteExpense,
  getFrequentExpenses,
  type FrequentExpense,
} from "../../services/expenseService";

const currency = (value: number) =>
  value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

type Status =
  | { kind: "idle" }
  | { kind: "saved"; expense: Expense }
  | { kind: "undone"; description: string }
  | { kind: "error"; message: string };

function readError(error: unknown, fallback: string) {
  if (error instanceof AxiosError) {
    const detail = error.response?.data?.detail;
    if (typeof detail === "string" && detail.trim()) return detail;
  }
  return fallback;
}

interface QuickEntryProps {
  /** Chamado depois de registrar (com o gasto criado) ou desfazer, para atualizar o painel. */
  onChange: (created?: Expense) => void;
}

/**
 * Registro rapido: um campo que entende "café 7,50" ou "uber 23,40 ontem"
 * e atalhos para os gastos que mais se repetem.
 */
export function QuickEntry({ onChange }: QuickEntryProps) {
  const [text, setText] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [status, setStatus] = useState<Status>({ kind: "idle" });
  const [frequent, setFrequent] = useState<FrequentExpense[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  const loadFrequent = useCallback(() => {
    getFrequentExpenses(6)
      .then(setFrequent)
      .catch((err) => console.error("Falha ao carregar gastos frequentes:", err));
  }, []);

  useEffect(() => {
    loadFrequent();
  }, [loadFrequent]);

  const afterSave = (expense: Expense) => {
    setStatus({ kind: "saved", expense });
    onChange(expense);
    loadFrequent();
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    const value = text.trim();
    if (!value || isSaving) return;
    setIsSaving(true);
    try {
      const expense = await addQuickExpense(value, formatApiDate(new Date()));
      setText("");
      afterSave(expense);
    } catch (error) {
      setStatus({
        kind: "error",
        message: readError(error, "Não foi possível registrar agora. Tente novamente."),
      });
    } finally {
      setIsSaving(false);
      inputRef.current?.focus();
    }
  };

  const handleChip = async (item: FrequentExpense) => {
    if (isSaving) return;
    setIsSaving(true);
    try {
      const expense = await addExpense({
        description: item.description,
        amount: item.amount,
        categoryId: item.categoryId,
        date: formatApiDate(new Date()),
      });
      afterSave(expense);
    } catch (error) {
      setStatus({
        kind: "error",
        message: readError(error, "Não foi possível registrar agora. Tente novamente."),
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleUndo = async () => {
    if (status.kind !== "saved") return;
    const { expense } = status;
    try {
      await deleteExpense(expense.id);
      setStatus({ kind: "undone", description: expense.description });
      onChange();
      loadFrequent();
    } catch (error) {
      setStatus({
        kind: "error",
        message: readError(error, "Não foi possível desfazer. Exclua o lançamento em Lançamentos."),
      });
    }
  };

  return (
    <section aria-label="Registro rápido" className="rounded-2xl border border-border bg-surface p-4 sm:p-5">
      <form onSubmit={handleSubmit} className="flex gap-2">
        <label htmlFor="quick-entry" className="sr-only">
          Registrar gasto rápido
        </label>
        <input
          id="quick-entry"
          ref={inputRef}
          value={text}
          onChange={(event) => {
            setText(event.target.value);
            if (status.kind === "error") setStatus({ kind: "idle" });
          }}
          placeholder="Ex.: café 7,50 ou uber 23,40 ontem"
          autoComplete="off"
          enterKeyHint="done"
          maxLength={120}
          className="ui-input h-11 min-w-0 flex-1 rounded-[var(--radius-control)] border border-border bg-background px-3.5 text-sm text-foreground placeholder:text-foreground-subtle outline-none focus:border-primary"
        />
        <button
          type="submit"
          disabled={isSaving || text.trim() === ""}
          className="inline-flex h-11 shrink-0 items-center gap-1.5 rounded-[var(--radius-control)] bg-primary px-4 text-ui font-medium text-[var(--color-on-primary)] transition-colors hover:bg-primary-strong disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isSaving ? <Loader2 size={15} className="animate-spin" /> : <Plus size={15} />}
          Registrar
        </button>
      </form>

      {frequent.length > 0 && (
        <div className="mt-3 flex flex-wrap items-center gap-1.5">
          <span className="mr-1 text-xs text-foreground-subtle">Frequentes</span>
          {frequent.map((item) => (
            <button
              key={`${item.description}-${item.categoryId}`}
              type="button"
              onClick={() => handleChip(item)}
              disabled={isSaving}
              title={`Registrar ${item.description} (${currency(item.amount)}) hoje`}
              className="inline-flex min-h-8 items-center gap-1.5 rounded-full border border-border bg-background px-3 text-ui text-foreground-muted transition-colors hover:border-primary/40 hover:text-foreground disabled:opacity-60"
            >
              <span className="max-w-32 truncate">{item.description}</span>
              <span className="font-medium text-foreground tabular-nums">{currency(item.amount)}</span>
            </button>
          ))}
        </div>
      )}

      <div aria-live="polite" className="min-h-0">
        <AnimatePresence mode="wait" initial={false}>
        {status.kind === "saved" && (
          <motion.p
            key={`saved-${status.expense.id}`}
            {...statusMotion}
            className="mt-3 flex flex-wrap items-center gap-x-2 text-ui text-foreground-muted"
          >
            <span>
              <span className="font-medium text-foreground">{status.expense.description}</span>{" "}
              <span className="tabular-nums">{currency(Math.abs(status.expense.amount))}</span> registrado em{" "}
              {status.expense.category}.
            </span>
            <button
              type="button"
              onClick={handleUndo}
              className="font-medium text-primary underline-offset-2 hover:underline"
            >
              Desfazer
            </button>
          </motion.p>
        )}
        {status.kind === "undone" && (
          <motion.p key="undone" {...statusMotion} className="mt-3 text-ui text-foreground-muted">
            {status.description} foi removido.
          </motion.p>
        )}
        {status.kind === "error" && (
          <motion.p key={`error-${status.message}`} {...statusMotion} role="alert" className="mt-3 text-ui text-danger">
            {status.message}
          </motion.p>
        )}
        </AnimatePresence>
      </div>
    </section>
  );
}
