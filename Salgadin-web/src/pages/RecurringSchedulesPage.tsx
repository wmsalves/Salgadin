import { useEffect, useMemo, useState } from "react";
import clsx from "clsx";
import {
  Archive,
  CalendarDays,
  CircleDollarSign,
  PauseCircle,
  Pencil,
  PlayCircle,
  Plus,
  Receipt,
  RefreshCw,
  Repeat,
  Wallet,
} from "lucide-react";
import { EmptyState } from "../components/EmptyState";
import { Button } from "../components/ui/Button";
import { getCategories, type Category } from "../services/categoryService";
import { getSubcategories } from "../services/subcategoryService";
import {
  archiveRecurringSchedule,
  createRecurringSchedule,
  generateDueRecurringSchedules,
  listRecurringSchedules,
  pauseRecurringSchedule,
  resumeRecurringSchedule,
  updateRecurringSchedule,
} from "../services/recurringScheduleService";
import type {
  GenerateRecurringSchedulesResult,
  RecurringSchedule,
  RecurringSchedulePayload,
  RecurringScheduleStatus,
  RecurringScheduleType,
  Subcategory,
} from "../lib/types";
import { formatDateForInput, toDateInputValue } from "../lib/dates";

type FilterMode = "all" | "income" | "expense" | "active" | "paused";

type FormState = {
  type: RecurringScheduleType;
  description: string;
  amount: string;
  categoryId: string;
  subcategoryId: string;
  dayOfMonth: string;
  startDate: string;
  endDate: string;
  isActive: boolean;
};

const emptyForm = (): FormState => ({
  type: "Expense",
  description: "",
  amount: "",
  categoryId: "",
  subcategoryId: "",
  dayOfMonth: "1",
  startDate: formatDateForInput(new Date()),
  endDate: "",
  isActive: true,
});

const filterOptions: Array<{ value: FilterMode; label: string }> = [
  { value: "all", label: "Todas" },
  { value: "income", label: "Receitas" },
  { value: "expense", label: "Despesas" },
  { value: "active", label: "Ativas" },
  { value: "paused", label: "Pausadas" },
];

const statusLabels: Record<RecurringScheduleStatus, string> = {
  Active: "Ativa",
  Paused: "Pausada",
  Finished: "Finalizada",
  Archived: "Arquivada",
};

const statusClasses: Record<RecurringScheduleStatus, string> = {
  Active: "border-success/20 bg-success/10 text-success",
  Paused: "border-warning/20 bg-warning/10 text-warning",
  Finished: "border-border bg-surface-2 text-foreground-muted",
  Archived: "border-border bg-surface-2 text-foreground-muted",
};

const formatCurrency = (value: number) =>
  value.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });

const formatDisplayDate = (value: string | null | undefined) => {
  if (!value) {
    return "Sem data";
  }

  return new Date(value).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const parseAmount = (value: string) =>
  Number(value.replace(/\./g, "").replace(",", "."));

const formatBillingDay = (dayOfMonth: number) =>
  dayOfMonth === 31 ? "Dia 31 ou ultimo dia do mes" : `Todo dia ${dayOfMonth}`;

export default function RecurringSchedulesPage() {
  const [schedules, setSchedules] = useState<RecurringSchedule[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [subcategories, setSubcategories] = useState<Subcategory[]>([]);
  const [filter, setFilter] = useState<FilterMode>("all");
  const [isLoading, setIsLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingSchedule, setEditingSchedule] =
    useState<RecurringSchedule | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [apiError, setApiError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [scheduleData, categoryData] = await Promise.all([
        listRecurringSchedules(),
        getCategories(),
      ]);
      setSchedules(scheduleData);
      setCategories(categoryData);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (form.type !== "Expense" || !form.categoryId) {
      setSubcategories([]);
      return;
    }

    getSubcategories(Number(form.categoryId))
      .then(setSubcategories)
      .catch(() => setSubcategories([]));
  }, [form.categoryId, form.type]);

  const filteredSchedules = useMemo(() => {
    return schedules.filter((schedule) => {
      if (filter === "income") return schedule.type === "Income";
      if (filter === "expense") return schedule.type === "Expense";
      if (filter === "active") return schedule.status === "Active";
      if (filter === "paused") return schedule.status === "Paused";
      return true;
    });
  }, [filter, schedules]);

  const summary = useMemo(
    () => ({
      total: schedules.length,
      active: schedules.filter((item) => item.status === "Active").length,
      expense: schedules.filter((item) => item.type === "Expense").length,
      income: schedules.filter((item) => item.type === "Income").length,
    }),
    [schedules],
  );

  const openCreateForm = () => {
    setEditingSchedule(null);
    setForm(emptyForm());
    setApiError(null);
    setSuccessMessage(null);
    setIsFormOpen(true);
  };

  const openEditForm = (schedule: RecurringSchedule) => {
    setEditingSchedule(schedule);
    setForm({
      type: schedule.type,
      description: schedule.description,
      amount: schedule.amount.toLocaleString("pt-BR", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }),
      categoryId: schedule.categoryId ? String(schedule.categoryId) : "",
      subcategoryId: schedule.subcategoryId
        ? String(schedule.subcategoryId)
        : "",
      dayOfMonth: String(schedule.dayOfMonth),
      startDate: toDateInputValue(schedule.startDate),
      endDate: schedule.endDate ? toDateInputValue(schedule.endDate) : "",
      isActive: schedule.status === "Active",
    });
    setApiError(null);
    setSuccessMessage(null);
    setIsFormOpen(true);
  };

  const closeForm = () => {
    setIsFormOpen(false);
    setEditingSchedule(null);
    setForm(emptyForm());
    setApiError(null);
  };

  const buildPayload = (): RecurringSchedulePayload => ({
    type: form.type,
    description: form.description.trim(),
    amount: parseAmount(form.amount),
    categoryId: form.type === "Expense" ? Number(form.categoryId) : null,
    subcategoryId:
      form.type === "Expense" && form.subcategoryId
        ? Number(form.subcategoryId)
        : null,
    frequency: "Monthly",
    startDate: form.startDate,
    endDate: form.endDate || null,
    dayOfMonth: Number(form.dayOfMonth),
    isActive: form.isActive,
    status: form.isActive ? "Active" : "Paused",
  });

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setApiError(null);
    setSuccessMessage(null);

    if (form.type === "Expense" && !form.categoryId) {
      setApiError("Selecione uma categoria para a despesa recorrente.");
      return;
    }

    setIsSaving(true);
    try {
      const payload = buildPayload();

      if (editingSchedule) {
        await updateRecurringSchedule(editingSchedule.id, payload);
        setSuccessMessage("Recorrencia atualizada.");
      } else {
        await createRecurringSchedule(payload);
        setSuccessMessage("Recorrencia criada. Ela sera registrada como lancamento quando estiver vencida.");
      }

      await fetchData();
      closeForm();
    } catch {
      setApiError("Nao foi possivel salvar a recorrencia. Revise os dados e tente novamente.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleGenerateDue = async () => {
    setIsGenerating(true);
    setApiError(null);
    setSuccessMessage(null);
    try {
      const result = await generateDueRecurringSchedules();
      setSuccessMessage(buildGenerateMessage(result));
      await fetchData();
    } catch {
      setApiError("Nao foi possivel registrar os lancamentos vencidos agora.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handlePauseResume = async (schedule: RecurringSchedule) => {
    setApiError(null);
    setSuccessMessage(null);
    try {
      if (schedule.status === "Active") {
        await pauseRecurringSchedule(schedule.id);
        setSuccessMessage("Recorrencia pausada.");
      } else {
        await resumeRecurringSchedule(schedule.id);
        setSuccessMessage("Recorrencia reativada.");
      }
      await fetchData();
    } catch {
      setApiError("Nao foi possivel alterar o status da recorrencia.");
    }
  };

  const handleArchive = async (schedule: RecurringSchedule) => {
    setApiError(null);
    setSuccessMessage(null);
    try {
      await archiveRecurringSchedule(schedule.id);
      setSuccessMessage("Recorrencia arquivada.");
      await fetchData();
    } catch {
      setApiError("Nao foi possivel arquivar a recorrencia.");
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <header className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">
            Recorrencias
          </h1>
          <p className="text-sm text-foreground-muted">
            Organize receitas e despesas mensais antes de elas entrarem no seu fluxo.
          </p>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <div className="sm:text-right">
            <Button
              type="button"
              variant="secondary"
              onClick={handleGenerateDue}
              isLoading={isGenerating}
              className="w-full sm:w-auto"
            >
              <RefreshCw size={16} />
              {isGenerating ? "Registrando..." : "Registrar vencidas"}
            </Button>
            <p className="mt-1 max-w-xs text-xs text-foreground-subtle">
              Cria os lancamentos que ja chegaram na data combinada.
            </p>
          </div>
          <Button type="button" onClick={openCreateForm} className="w-full sm:w-auto">
            <Plus size={16} />
            Nova recorrencia
          </Button>
        </div>
      </header>

      <section className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {[
          { label: "Total", value: summary.total, icon: Repeat },
          { label: "Ativas", value: summary.active, icon: CalendarDays },
          { label: "Despesas", value: summary.expense, icon: Receipt },
          { label: "Receitas", value: summary.income, icon: Wallet },
        ].map((item) => {
          const Icon = item.icon;
          return (
            <div
              key={item.label}
              className="rounded-2xl border border-border/70 bg-surface/92 p-4 shadow-[0_14px_30px_rgba(60,42,32,0.08)]"
            >
              <div className="flex items-center justify-between gap-3">
                <span className="text-xs uppercase tracking-[0.18em] text-foreground-subtle">
                  {item.label}
                </span>
                <Icon size={16} className="text-primary" />
              </div>
              <div className="mt-2 text-2xl font-semibold text-foreground">
                {item.value}
              </div>
            </div>
          );
        })}
      </section>

      {isFormOpen && (
        <section className="rounded-3xl border border-border/70 bg-surface/92 p-5 shadow-[0_14px_30px_rgba(60,42,32,0.10)]">
          <div className="mb-4 flex items-start justify-between gap-3">
            <div>
              <h2 className="text-lg font-semibold text-foreground">
                {editingSchedule ? "Editar recorrencia" : "Nova recorrencia mensal"}
              </h2>
              <p className="text-sm text-foreground-muted">
                Defina o agendamento. O lancamento real sera criado quando voce registrar as vencidas.
              </p>
            </div>
            <button
              type="button"
              onClick={closeForm}
              className="rounded-full border border-border px-3 py-1.5 text-xs font-semibold text-foreground-muted transition hover:bg-surface-2 hover:text-foreground"
            >
              Fechar
            </button>
          </div>

          <form onSubmit={handleSubmit} className="grid gap-4 lg:grid-cols-6">
            <div>
              <label className="text-xs text-foreground-muted">
                Tipo de recorrencia
              </label>
              <select
                value={form.type}
                onChange={(event) =>
                  setForm((prev) => ({
                    ...prev,
                    type: event.target.value as RecurringScheduleType,
                    categoryId: "",
                    subcategoryId: "",
                  }))
                }
                className="mt-1 w-full rounded-xl border border-border bg-surface-2 px-3 py-2 text-sm text-foreground"
              >
                <option value="Expense">Despesa</option>
                <option value="Income">Receita</option>
              </select>
            </div>

            <div className="lg:col-span-2">
              <label className="text-xs text-foreground-muted">Descricao</label>
              <input
                value={form.description}
                onChange={(event) =>
                  setForm((prev) => ({
                    ...prev,
                    description: event.target.value,
                  }))
                }
                className="mt-1 w-full rounded-xl border border-border bg-surface-2 px-3 py-2 text-sm text-foreground"
                placeholder="Ex: internet, aluguel, salario"
                required
              />
            </div>

            <div>
              <label className="text-xs text-foreground-muted">Valor</label>
              <input
                value={form.amount}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, amount: event.target.value }))
                }
                className="mt-1 w-full rounded-xl border border-border bg-surface-2 px-3 py-2 text-sm text-foreground"
                placeholder="0,00"
                inputMode="decimal"
                required
              />
            </div>

            <div>
              <label className="text-xs text-foreground-muted">Dia do mes</label>
              <input
                value={form.dayOfMonth}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, dayOfMonth: event.target.value }))
                }
                className="mt-1 w-full rounded-xl border border-border bg-surface-2 px-3 py-2 text-sm text-foreground"
                type="number"
                min={1}
                max={31}
                required
              />
              <p className="mt-1 text-xs text-foreground-subtle">
                Se o mes tiver menos dias, usamos o ultimo dia.
              </p>
            </div>

            <div>
              <label className="text-xs text-foreground-muted">Frequencia</label>
              <div className="mt-1 rounded-xl border border-border bg-surface-2 px-3 py-2 text-sm font-medium text-foreground">
                Mensal
              </div>
              <p className="mt-1 text-xs text-foreground-subtle">
                Outras frequencias entram depois.
              </p>
            </div>

            {form.type === "Expense" && (
              <>
                <div className="lg:col-span-2">
                  <label className="text-xs text-foreground-muted">
                    Categoria
                  </label>
                  <select
                    value={form.categoryId}
                    onChange={(event) =>
                      setForm((prev) => ({
                        ...prev,
                        categoryId: event.target.value,
                        subcategoryId: "",
                      }))
                    }
                    className="mt-1 w-full rounded-xl border border-border bg-surface-2 px-3 py-2 text-sm text-foreground"
                    required
                  >
                    <option value="">Selecione</option>
                    {categories.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="lg:col-span-2">
                  <label className="text-xs text-foreground-muted">
                    Subcategoria
                  </label>
                  <select
                    value={form.subcategoryId}
                    onChange={(event) =>
                      setForm((prev) => ({
                        ...prev,
                        subcategoryId: event.target.value,
                      }))
                    }
                    className="mt-1 w-full rounded-xl border border-border bg-surface-2 px-3 py-2 text-sm text-foreground"
                    disabled={!form.categoryId || subcategories.length === 0}
                  >
                    <option value="">Opcional</option>
                    {subcategories.map((subcategory) => (
                      <option key={subcategory.id} value={subcategory.id}>
                        {subcategory.name}
                      </option>
                    ))}
                  </select>
                </div>
              </>
            )}

            <div>
              <label className="text-xs text-foreground-muted">
                Data inicial
              </label>
              <input
                value={form.startDate}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, startDate: event.target.value }))
                }
                className="mt-1 w-full rounded-xl border border-border bg-surface-2 px-3 py-2 text-sm text-foreground"
                type="date"
                required
              />
            </div>

            <div>
              <label className="text-xs text-foreground-muted">Data final</label>
              <input
                value={form.endDate}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, endDate: event.target.value }))
                }
                className="mt-1 w-full rounded-xl border border-border bg-surface-2 px-3 py-2 text-sm text-foreground"
                type="date"
              />
            </div>

            <div className="flex items-end">
              <label className="flex w-full items-center gap-3 rounded-xl border border-border bg-surface-2 px-3 py-2 text-sm text-foreground-muted">
                <input
                  type="checkbox"
                  checked={form.isActive}
                  onChange={(event) =>
                    setForm((prev) => ({
                      ...prev,
                      isActive: event.target.checked,
                    }))
                  }
                  className="h-4 w-4 rounded border-border text-primary focus:ring-primary/40"
                />
                Iniciar ativa
              </label>
            </div>

            <div className="flex items-end lg:col-span-2">
              <Button type="submit" isLoading={isSaving} className="w-full">
                {editingSchedule ? "Salvar recorrencia" : "Criar recorrencia"}
              </Button>
            </div>
          </form>
        </section>
      )}

      {(apiError || successMessage) && (
        <div
          role={apiError ? "alert" : "status"}
          className={clsx(
            "rounded-2xl border px-4 py-3 text-sm font-medium",
            apiError
              ? "border-danger/30 bg-danger/10 text-danger"
              : "border-success/30 bg-success/10 text-success",
          )}
        >
          {apiError || successMessage}
        </div>
      )}

      <section className="rounded-2xl border border-border bg-surface/70 p-4 shadow-[0_20px_60px_rgba(0,0,0,0.10)]">
        <div className="flex flex-wrap items-center gap-2">
          {filterOptions.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => setFilter(option.value)}
              className={clsx(
                "min-h-10 rounded-full px-4 py-2 text-xs font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40",
                filter === option.value
                  ? "bg-primary text-white"
                  : "border border-border text-foreground-muted hover:bg-surface-2 hover:text-foreground",
              )}
            >
              {option.label}
            </button>
          ))}
        </div>
      </section>

      {isLoading ? (
        <div className="rounded-3xl border border-border/70 bg-surface/92 p-8 text-sm text-foreground-subtle">
          Carregando recorrencias...
        </div>
      ) : schedules.length === 0 ? (
        <EmptyState
          icon={Repeat}
          title="Organize o que se repete todo mes"
          description="Cadastre assinaturas, internet, academia, salario, aluguel e outras entradas ou saidas previsiveis. Depois, registre as vencidas como lancamentos reais."
          primaryAction={{
            label: "Criar primeira recorrencia",
            onClick: openCreateForm,
          }}
          size="spacious"
        />
      ) : filteredSchedules.length === 0 ? (
        <EmptyState
          icon={Repeat}
          title="Nenhuma recorrencia neste filtro"
          description="Troque o filtro ou crie uma nova recorrencia mensal."
          compact
        />
      ) : (
        <section className="grid grid-cols-1 gap-4 xl:grid-cols-2">
          {filteredSchedules.map((schedule) => {
            const isExpense = schedule.type === "Expense";
            const Icon = isExpense ? Receipt : CircleDollarSign;

            return (
              <article
                key={schedule.id}
                className="rounded-3xl border border-border/70 bg-gradient-to-br from-surface/95 via-surface/90 to-surface-2/75 p-5 shadow-[0_14px_30px_rgba(60,42,32,0.10)] soft-hover"
              >
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div className="flex min-w-0 items-start gap-3">
                    <div
                      className={clsx(
                        "grid h-12 w-12 shrink-0 place-items-center rounded-2xl",
                        isExpense
                          ? "bg-warning/10 text-warning"
                          : "bg-success/10 text-success",
                      )}
                    >
                      <Icon size={20} />
                    </div>
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <h2 className="truncate text-base font-semibold text-foreground">
                          {schedule.description}
                        </h2>
                        <span
                          className={clsx(
                            "inline-flex rounded-full border px-2.5 py-1 text-[11px] font-semibold",
                            statusClasses[schedule.status],
                          )}
                        >
                          {statusLabels[schedule.status]}
                        </span>
                      </div>
                      <p className="mt-1 text-sm text-foreground-muted">
                        {isExpense ? "Despesa mensal" : "Receita mensal"}
                        {schedule.category ? ` / ${schedule.category}` : ""}
                        {schedule.subcategory ? ` / ${schedule.subcategory}` : ""}
                      </p>
                    </div>
                  </div>

                  <div className="font-mono text-lg font-semibold tabular-nums text-foreground">
                    {isExpense ? "-" : "+"} {formatCurrency(schedule.amount)}
                  </div>
                </div>

                <div className="mt-5 grid gap-3 sm:grid-cols-3">
                  <div className="rounded-2xl border border-border bg-surface/80 px-4 py-3">
                    <div className="text-[11px] uppercase tracking-[0.16em] text-foreground-subtle">
                      Dia
                    </div>
                    <div className="mt-1 text-sm font-semibold text-foreground">
                      {formatBillingDay(schedule.dayOfMonth)}
                    </div>
                  </div>
                  <div className="rounded-2xl border border-border bg-surface/80 px-4 py-3">
                    <div className="text-[11px] uppercase tracking-[0.16em] text-foreground-subtle">
                      Proxima
                    </div>
                    <div className="mt-1 text-sm font-semibold text-foreground">
                      {formatDisplayDate(schedule.nextOccurrenceDate)}
                    </div>
                  </div>
                  <div className="rounded-2xl border border-border bg-surface/80 px-4 py-3">
                    <div className="text-[11px] uppercase tracking-[0.16em] text-foreground-subtle">
                      Fim
                    </div>
                    <div className="mt-1 text-sm font-semibold text-foreground">
                      {schedule.endDate
                        ? formatDisplayDate(schedule.endDate)
                        : "Sem data final"}
                    </div>
                  </div>
                </div>

                <div className="mt-5 flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => openEditForm(schedule)}
                    className="inline-flex items-center gap-2 rounded-full border border-border bg-surface px-3 py-2 text-xs font-semibold text-foreground-muted transition hover:bg-surface-2 hover:text-foreground"
                  >
                    <Pencil size={14} />
                    Editar
                  </button>
                  {schedule.status !== "Finished" && (
                    <button
                      type="button"
                      onClick={() => handlePauseResume(schedule)}
                      className="inline-flex items-center gap-2 rounded-full border border-border bg-surface px-3 py-2 text-xs font-semibold text-foreground-muted transition hover:bg-surface-2 hover:text-foreground"
                    >
                      {schedule.status === "Active" ? (
                        <PauseCircle size={14} />
                      ) : (
                        <PlayCircle size={14} />
                      )}
                      {schedule.status === "Active" ? "Pausar" : "Reativar"}
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => handleArchive(schedule)}
                    className="inline-flex items-center gap-2 rounded-full border border-danger/20 bg-danger/10 px-3 py-2 text-xs font-semibold text-danger transition hover:bg-danger/15"
                  >
                    <Archive size={14} />
                    Arquivar
                  </button>
                </div>
              </article>
            );
          })}
        </section>
      )}
    </div>
  );
}

function buildGenerateMessage(result: GenerateRecurringSchedulesResult) {
  const total = result.generatedExpenses + result.generatedIncomes;

  if (total === 0) {
    return "Nenhum lancamento recorrente vencido para registrar agora.";
  }

  return `${total} lancamento${total === 1 ? "" : "s"} recorrente${total === 1 ? "" : "s"} registrado${total === 1 ? "" : "s"}: ${result.generatedExpenses} despesa${result.generatedExpenses === 1 ? "" : "s"} e ${result.generatedIncomes} receita${result.generatedIncomes === 1 ? "" : "s"}.`;
}
