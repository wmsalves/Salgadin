import { useEffect, useId, useState, type FormEvent, type ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { AxiosError } from "axios";
import { Check, Loader2, Plus, X } from "lucide-react";

import { formatApiDate } from "../../lib/dates";
import { MOTION_EASE } from "../../lib/motion";
import { parseAmount } from "../../lib/money";
import { normalizeTextForMatch } from "../../lib/recurringSchedules";
import { getCategories, type Category } from "../../services/categoryService";
import { addQuickExpense } from "../../services/expenseService";
import {
  createRecurringSchedule,
  generateDueRecurringSchedules,
} from "../../services/recurringScheduleService";

const currency = (value: number) =>
  value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });


function readError(error: unknown, fallback: string) {
  if (error instanceof AxiosError) {
    const detail = error.response?.data?.detail;
    if (typeof detail === "string" && detail.trim()) return detail;
  }
  return fallback;
}

type Bill = { key: string; description: string; amount: string; day: string; category: string };

const billPresets: Omit<Bill, "key" | "amount">[] = [
  { description: "Aluguel", day: "5", category: "Moradia" },
  { description: "Condomínio", day: "10", category: "Moradia" },
  { description: "Internet", day: "10", category: "Moradia" },
  { description: "Celular", day: "15", category: "Outros" },
  { description: "Streaming", day: "18", category: "Lazer" },
  { description: "Academia", day: "5", category: "Lazer" },
];

const firstExpenseExamples = ["café 7,50", "coxinha 8", "uber 23,40"];

const STEPS = ["Renda", "Contas fixas", "Primeiro gasto"] as const;

interface OnboardingFlowProps {
  userName?: string;
  /** Chamado ao concluir ou pular; o painel recarrega os dados. */
  onFinish: () => void;
}

/**
 * Primeiro acesso: tres passos curtos para o Inicio ja mostrar
 * "quanto ainda da para gastar por dia".
 */
export function OnboardingFlow({ userName, onFinish }: OnboardingFlowProps) {
  const [step, setStep] = useState(0);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [income, setIncome] = useState("");
  const [incomeDay, setIncomeDay] = useState("5");
  const [bills, setBills] = useState<Bill[]>([]);
  const [firstExpense, setFirstExpense] = useState("");
  const [createdExpenseLabel, setCreatedExpenseLabel] = useState<string | null>(null);

  const ids = { income: useId(), incomeDay: useId(), expense: useId() };
  const firstDayOfMonth = (() => {
    const now = new Date();
    return formatApiDate(new Date(now.getFullYear(), now.getMonth(), 1));
  })();

  useEffect(() => {
    getCategories()
      .then(setCategories)
      .catch((err) => console.error("Falha ao carregar categorias:", err));
  }, []);

  const categoryId = (name: string) => {
    const key = normalizeTextForMatch(name);
    return (
      categories.find((c) => normalizeTextForMatch(c.name) === key)?.id ??
      categories.find((c) => normalizeTextForMatch(c.name) === "outros")?.id ??
      categories[0]?.id ??
      null
    );
  };

  const goNext = () => {
    setError(null);
    setStep((current) => Math.min(current + 1, STEPS.length - 1));
  };

  // Passo 1: renda vira uma recorrencia mensal de receita.
  const saveIncome = async (event: FormEvent) => {
    event.preventDefault();
    const amount = parseAmount(income);
    if (amount <= 0) {
      setError("Informe quanto você recebe por mês, por exemplo 4.800.");
      return;
    }
    setIsSaving(true);
    setError(null);
    try {
      await createRecurringSchedule({
        type: "Income",
        description: "Salário",
        amount,
        frequency: "Monthly",
        startDate: firstDayOfMonth,
        dayOfMonth: Math.min(Math.max(Number(incomeDay) || 1, 1), 31),
        isActive: true,
      });
      goNext();
    } catch (err) {
      setError(readError(err, "Não foi possível salvar sua renda. Tente novamente."));
    } finally {
      setIsSaving(false);
    }
  };

  // Passo 2: contas fixas viram recorrencias de despesa.
  const saveBills = async () => {
    const valid = bills.filter((bill) => parseAmount(bill.amount) > 0);
    if (valid.length === 0) {
      goNext();
      return;
    }
    setIsSaving(true);
    setError(null);
    try {
      for (const bill of valid) {
        await createRecurringSchedule({
          type: "Expense",
          description: bill.description.trim() || "Conta fixa",
          amount: parseAmount(bill.amount),
          categoryId: categoryId(bill.category),
          frequency: "Monthly",
          startDate: firstDayOfMonth,
          dayOfMonth: Math.min(Math.max(Number(bill.day) || 1, 1), 31),
          isActive: true,
        });
      }
      goNext();
    } catch (err) {
      setError(readError(err, "Não foi possível salvar as contas fixas. Tente novamente."));
    } finally {
      setIsSaving(false);
    }
  };

  // Passo 3: primeiro gasto pelo registro rapido.
  const saveFirstExpense = async (event: FormEvent) => {
    event.preventDefault();
    const text = firstExpense.trim();
    if (!text) return;
    setIsSaving(true);
    setError(null);
    try {
      const expense = await addQuickExpense(text, formatApiDate(new Date()));
      setCreatedExpenseLabel(
        `${expense.description} · ${currency(Math.abs(expense.amount))} em ${expense.category}`,
      );
      setFirstExpense("");
    } catch (err) {
      setError(readError(err, "Não entendi esse gasto. Tente algo como “café 7,50”."));
    } finally {
      setIsSaving(false);
    }
  };

  const finish = async () => {
    setIsSaving(true);
    try {
      // Lanca o que ja venceu neste mes (ex.: salario do dia 5, aluguel).
      await generateDueRecurringSchedules();
    } catch (err) {
      console.error("Falha ao registrar recorrências vencidas:", err);
    } finally {
      setIsSaving(false);
      onFinish();
    }
  };

  const addBill = (preset?: Omit<Bill, "key" | "amount">) => {
    setBills((prev) => [
      ...prev,
      {
        key: `${Date.now()}-${prev.length}`,
        description: preset?.description ?? "",
        day: preset?.day ?? "10",
        category: preset?.category ?? "Outros",
        amount: "",
      },
    ]);
  };

  const usedPresets = new Set(bills.map((bill) => bill.description));

  return (
    <section
      aria-labelledby="onboarding-title"
      className="mx-auto w-full max-w-2xl rounded-2xl border border-border bg-surface"
    >
      <header className="flex items-start justify-between gap-4 border-b border-border px-5 py-4 sm:px-7">
        <div>
          <p className="text-ui text-foreground-muted">
            {userName ? `Boas-vindas, ${userName.split(" ")[0]}` : "Boas-vindas"}
          </p>
          <h1 id="onboarding-title" className="mt-0.5 text-xl font-medium text-foreground">
            Vamos montar o seu mês
          </h1>
        </div>
        <button
          type="button"
          onClick={onFinish}
          className="shrink-0 rounded-[var(--radius-control)] px-2.5 py-1.5 text-ui text-foreground-muted transition-colors hover:bg-surface-2 hover:text-foreground"
        >
          Pular por agora
        </button>
      </header>

      <ol className="flex gap-2 px-5 pt-5 sm:px-7" aria-label="Etapas">
        {STEPS.map((label, index) => (
          <li key={label} className="flex-1" aria-current={index === step ? "step" : undefined}>
            <div className="h-1 overflow-hidden rounded-full bg-surface-2">
              <motion.div
                className="h-full rounded-full bg-primary"
                initial={false}
                animate={{ width: index < step ? "100%" : index === step ? "50%" : "0%" }}
                transition={{ duration: 0.35, ease: MOTION_EASE }}
              />
            </div>
            <p
              className={`mt-1.5 text-xs ${index <= step ? "text-foreground" : "text-foreground-subtle"}`}
            >
              {index + 1}. {label}
            </p>
          </li>
        ))}
      </ol>

      <div className="relative overflow-hidden px-5 pb-6 pt-5 sm:px-7">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 16 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -16 }}
            transition={{ duration: 0.22, ease: MOTION_EASE }}
          >
            {step === 0 && (
              <form onSubmit={saveIncome} noValidate>
                <StepIntro
                  title="Quanto entra por mês?"
                  text="Com a sua renda, o Salgadin calcula quanto ainda dá para gastar por dia."
                />
                <div className="mt-5 grid gap-4 sm:grid-cols-[minmax(0,1fr)_9rem]">
                  <div>
                    <label htmlFor={ids.income} className="mb-1.5 block text-ui text-foreground-muted">
                      Renda mensal (R$)
                    </label>
                    <input
                      id={ids.income}
                      inputMode="decimal"
                      autoFocus
                      value={income}
                      onChange={(event) => setIncome(event.target.value)}
                      placeholder="4.800,00"
                      className="h-12 w-full rounded-[var(--radius-control)] border border-border bg-background px-3.5 text-2xl font-medium tabular-nums text-foreground outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/25"
                    />
                  </div>
                  <div>
                    <label htmlFor={ids.incomeDay} className="mb-1.5 block text-ui text-foreground-muted">
                      Cai no dia
                    </label>
                    <input
                      id={ids.incomeDay}
                      type="number"
                      min={1}
                      max={31}
                      value={incomeDay}
                      onChange={(event) => setIncomeDay(event.target.value)}
                      className="h-12 w-full rounded-[var(--radius-control)] border border-border bg-background px-3.5 text-sm tabular-nums text-foreground outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/25"
                    />
                  </div>
                </div>
                <p className="mt-2 text-xs text-foreground-subtle">
                  Vira uma receita recorrente. Você pode ajustar depois em Lançamentos › Recorrentes.
                </p>
                <StepActions error={error}>
                  <SecondaryButton onClick={goNext}>Não tenho renda fixa</SecondaryButton>
                  <PrimaryButton type="submit" isLoading={isSaving}>
                    Continuar
                  </PrimaryButton>
                </StepActions>
              </form>
            )}

            {step === 1 && (
              <div>
                <StepIntro
                  title="Quais contas chegam todo mês?"
                  text="Elas entram no cálculo antes mesmo de vencer, para o valor por dia ser realista."
                />
                <div className="mt-4 flex flex-wrap gap-1.5">
                  {billPresets
                    .filter((preset) => !usedPresets.has(preset.description))
                    .map((preset) => (
                      <button
                        key={preset.description}
                        type="button"
                        onClick={() => addBill(preset)}
                        className="inline-flex min-h-9 items-center gap-1 rounded-full border border-border px-3 text-ui text-foreground-muted transition-colors hover:border-primary/40 hover:text-foreground"
                      >
                        <Plus size={13} />
                        {preset.description}
                      </button>
                    ))}
                  <button
                    type="button"
                    onClick={() => addBill()}
                    className="inline-flex min-h-9 items-center gap-1 rounded-full border border-dashed border-border px-3 text-ui text-foreground-muted transition-colors hover:text-foreground"
                  >
                    <Plus size={13} />
                    Outra
                  </button>
                </div>

                <ul className="mt-4 space-y-2">
                  <AnimatePresence initial={false}>
                    {bills.map((bill, index) => (
                      <motion.li
                        key={bill.key}
                        layout="position"
                        initial={{ opacity: 0, y: -6 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.2, ease: MOTION_EASE }}
                        className="grid grid-cols-[minmax(0,1fr)_6.5rem_4.5rem_2.25rem] items-center gap-2"
                      >
                        <input
                          aria-label="Nome da conta"
                          value={bill.description}
                          placeholder="Nome"
                          onChange={(event) =>
                            setBills((prev) =>
                              prev.map((b) => (b.key === bill.key ? { ...b, description: event.target.value } : b)),
                            )
                          }
                          className="h-10 min-w-0 rounded-[var(--radius-control)] border border-border bg-background px-3 text-sm text-foreground outline-none focus:border-primary"
                        />
                        <input
                          aria-label={`Valor de ${bill.description || "conta"}`}
                          inputMode="decimal"
                          value={bill.amount}
                          placeholder="R$ 0,00"
                          autoFocus={index === bills.length - 1}
                          onChange={(event) =>
                            setBills((prev) =>
                              prev.map((b) => (b.key === bill.key ? { ...b, amount: event.target.value } : b)),
                            )
                          }
                          className="h-10 min-w-0 rounded-[var(--radius-control)] border border-border bg-background px-3 text-sm tabular-nums text-foreground outline-none focus:border-primary"
                        />
                        <input
                          aria-label={`Dia de vencimento de ${bill.description || "conta"}`}
                          type="number"
                          min={1}
                          max={31}
                          value={bill.day}
                          onChange={(event) =>
                            setBills((prev) =>
                              prev.map((b) => (b.key === bill.key ? { ...b, day: event.target.value } : b)),
                            )
                          }
                          className="h-10 min-w-0 rounded-[var(--radius-control)] border border-border bg-background px-2 text-center text-sm tabular-nums text-foreground outline-none focus:border-primary"
                        />
                        <button
                          type="button"
                          aria-label={`Remover ${bill.description || "conta"}`}
                          onClick={() => setBills((prev) => prev.filter((b) => b.key !== bill.key))}
                          className="grid h-9 w-9 place-items-center rounded-lg text-foreground-subtle transition-colors hover:bg-surface-2 hover:text-foreground"
                        >
                          <X size={15} />
                        </button>
                      </motion.li>
                    ))}
                  </AnimatePresence>
                </ul>
                {bills.length > 0 && (
                  <p className="mt-2 text-xs text-foreground-subtle">Valor e dia do vencimento de cada conta.</p>
                )}

                <StepActions error={error}>
                  <SecondaryButton onClick={goNext}>Pular</SecondaryButton>
                  <PrimaryButton onClick={saveBills} isLoading={isSaving}>
                    {bills.some((bill) => parseAmount(bill.amount) > 0) ? "Salvar e continuar" : "Continuar"}
                  </PrimaryButton>
                </StepActions>
              </div>
            )}

            {step === 2 && (
              <div>
                <StepIntro
                  title="Registre um gasto de hoje"
                  text="Escreva como você falaria. É assim que você vai registrar no dia a dia."
                />
                <form onSubmit={saveFirstExpense} className="mt-5 flex gap-2">
                  <label htmlFor={ids.expense} className="sr-only">
                    Primeiro gasto
                  </label>
                  <input
                    id={ids.expense}
                    autoFocus
                    value={firstExpense}
                    onChange={(event) => setFirstExpense(event.target.value)}
                    placeholder="Ex.: café 7,50"
                    className="h-11 min-w-0 flex-1 rounded-[var(--radius-control)] border border-border bg-background px-3.5 text-sm text-foreground outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/25"
                  />
                  <PrimaryButton type="submit" isLoading={isSaving} disabled={!firstExpense.trim()}>
                    Registrar
                  </PrimaryButton>
                </form>
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {firstExpenseExamples.map((example) => (
                    <button
                      key={example}
                      type="button"
                      onClick={() => setFirstExpense(example)}
                      className="min-h-8 rounded-full border border-border px-3 text-ui text-foreground-muted transition-colors hover:text-foreground"
                    >
                      {example}
                    </button>
                  ))}
                </div>
                <div aria-live="polite">
                  {createdExpenseLabel && (
                    <motion.p
                      initial={{ opacity: 0, y: 4 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mt-4 flex items-center gap-2 text-ui text-foreground"
                    >
                      <span className="grid h-5 w-5 place-items-center rounded-full bg-success/15 text-success">
                        <Check size={12} />
                      </span>
                      {createdExpenseLabel}
                    </motion.p>
                  )}
                </div>
                <StepActions error={error}>
                  <PrimaryButton onClick={finish} isLoading={isSaving && !firstExpense}>
                    {createdExpenseLabel ? "Ver meu painel" : "Concluir sem registrar"}
                  </PrimaryButton>
                </StepActions>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  );
}

function StepIntro({ title, text }: { title: string; text: string }) {
  return (
    <div>
      <h2 className="text-lg font-medium text-foreground">{title}</h2>
      <p className="mt-1 text-sm text-foreground-muted">{text}</p>
    </div>
  );
}

function StepActions({ error, children }: { error: string | null; children: ReactNode }) {
  return (
    <div className="mt-6">
      {error && (
        <p role="alert" className="mb-3 text-ui text-danger">
          {error}
        </p>
      )}
      <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">{children}</div>
    </div>
  );
}

function PrimaryButton({
  children,
  isLoading,
  type = "button",
  onClick,
  disabled,
}: {
  children: ReactNode;
  isLoading?: boolean;
  type?: "button" | "submit";
  onClick?: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={isLoading || disabled}
      className="inline-flex min-h-11 items-center justify-center gap-2 rounded-[var(--radius-control)] bg-primary px-5 text-sm font-medium text-[var(--color-on-primary)] transition-colors hover:bg-primary-strong disabled:cursor-not-allowed disabled:opacity-60"
    >
      {isLoading && <Loader2 size={15} className="animate-spin" />}
      {children}
    </button>
  );
}

function SecondaryButton({ children, onClick }: { children: ReactNode; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex min-h-11 items-center justify-center rounded-[var(--radius-control)] px-4 text-sm font-medium text-foreground-muted transition-colors hover:bg-surface-2 hover:text-foreground"
    >
      {children}
    </button>
  );
}
