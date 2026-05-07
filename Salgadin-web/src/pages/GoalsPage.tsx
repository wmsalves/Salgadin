import { useCallback, useEffect, useMemo, useState } from "react";
import clsx from "clsx";
import {
  ArrowUpRight,
  CheckCircle2,
  Flag,
  Shield,
  Sparkles,
  Target,
  Trophy,
  TriangleAlert,
} from "lucide-react";
import { getGoals, createGoal, getGoalAlerts } from "../services/goalService";
import { getCategories, type Category } from "../services/categoryService";
import type { Goal, GoalAlert } from "../lib/types";
import { EmptyState } from "../components/EmptyState";

const defaultAlertThreshold = 0.8;

type GoalStatus = "healthy" | "near-limit" | "limit-reached" | "paused";

const formatCurrency = (value: number) =>
  value.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });

const formatMonthLabel = (date: Date) =>
  date.toLocaleDateString("pt-BR", {
    month: "long",
    year: "numeric",
  });

const getGoalStatus = (
  goal: Goal,
  alert: GoalAlert | undefined,
  percent: number,
): GoalStatus => {
  if (!goal.isActive) {
    return "paused";
  }

  if (percent >= 100) {
    return "limit-reached";
  }

  if (alert?.thresholdReached || percent >= goal.alertThreshold * 100) {
    return "near-limit";
  }

  return "healthy";
};

const statusConfig: Record<
  GoalStatus,
  {
    label: string;
    description: string;
    toneClass: string;
    badgeClass: string;
    progressClass: string;
    icon: typeof CheckCircle2;
  }
> = {
  healthy: {
    label: "Meta saudavel",
    description: "Seu ritmo segue dentro do planejado neste mes.",
    toneClass: "text-success",
    badgeClass: "border-success/20 bg-success/10 text-success",
    progressClass: "bg-success",
    icon: CheckCircle2,
  },
  "near-limit": {
    label: "Proximo do limite",
    description: "Vale acompanhar os proximos gastos para manter o controle.",
    toneClass: "text-primary",
    badgeClass: "border-primary/20 bg-primary/10 text-primary",
    progressClass: "bg-primary",
    icon: Flag,
  },
  "limit-reached": {
    label: "Limite atingido",
    description: "O limite mensal foi usado. Revise os proximos lancamentos com calma.",
    toneClass: "text-danger",
    badgeClass: "border-danger/20 bg-danger/10 text-danger",
    progressClass: "bg-danger",
    icon: TriangleAlert,
  },
  paused: {
    label: "Meta pausada",
    description: "Essa meta nao esta contando alertas enquanto estiver pausada.",
    toneClass: "text-foreground-muted",
    badgeClass: "border-border bg-surface-2 text-foreground-muted",
    progressClass: "bg-foreground-muted/40",
    icon: Shield,
  },
};

export default function GoalsPage() {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [alerts, setAlerts] = useState<GoalAlert[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [form, setForm] = useState({
    categoryId: "",
    monthlyLimit: "",
    alertThreshold: defaultAlertThreshold.toString(),
    isActive: true,
  });

  const now = useMemo(() => new Date(), []);
  const currentMonthLabel = useMemo(() => formatMonthLabel(now), [now]);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [goalsData, alertsData, categoriesData] = await Promise.all([
        getGoals(),
        getGoalAlerts(now.getFullYear(), now.getMonth() + 1),
        getCategories(),
      ]);
      setGoals(goalsData);
      setAlerts(alertsData);
      setCategories(categoriesData);
    } finally {
      setIsLoading(false);
    }
  }, [now]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const alertsByGoal = useMemo(() => {
    return alerts.reduce<Record<number, GoalAlert>>((acc, item) => {
      acc[item.goalId] = item;
      return acc;
    }, {});
  }, [alerts]);

  const goalCards = useMemo(() => {
    return goals.map((goal) => {
      const alert = alertsByGoal[goal.id];
      const spent = alert?.spent ?? 0;
      const percentRaw =
        goal.monthlyLimit > 0 ? (spent / goal.monthlyLimit) * 100 : 0;
      const percent = Math.max(0, Math.min(Math.round(percentRaw), 100));
      const status = getGoalStatus(goal, alert, percentRaw);
      const remaining = Math.max(goal.monthlyLimit - spent, 0);
      const overflow = Math.max(spent - goal.monthlyLimit, 0);

      return {
        goal,
        alert,
        spent,
        percent,
        percentRaw,
        remaining,
        overflow,
        status,
      };
    });
  }, [alertsByGoal, goals]);

  const summary = useMemo(() => {
    const activeGoals = goalCards.filter(({ goal }) => goal.isActive);
    const healthyGoals = goalCards.filter(({ status }) => status === "healthy");
    const nearLimitGoals = goalCards.filter(
      ({ status }) => status === "near-limit",
    );
    const reachedGoals = goalCards.filter(
      ({ status }) => status === "limit-reached",
    );

    return {
      activeGoals: activeGoals.length,
      healthyGoals: healthyGoals.length,
      attentionGoals: nearLimitGoals.length + reachedGoals.length,
      topAlerts: goalCards
        .filter(({ status }) =>
          status === "near-limit" || status === "limit-reached",
        )
        .sort((a, b) => b.percentRaw - a.percentRaw)
        .slice(0, 3),
    };
  }, [goalCards]);

  const handleSubmit = async () => {
    if (!form.monthlyLimit) return;

    const payload = {
      categoryId: form.categoryId ? Number(form.categoryId) : null,
      monthlyLimit: Number(form.monthlyLimit.replace(",", ".")),
      alertThreshold:
        Number(form.alertThreshold.replace(",", ".")) || defaultAlertThreshold,
      isActive: form.isActive,
    };

    await createGoal(payload);
    setForm({
      categoryId: "",
      monthlyLimit: "",
      alertThreshold: defaultAlertThreshold.toString(),
      isActive: true,
    });
    setIsFormOpen(false);
    fetchData();
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Metas</h1>
          <p className="text-sm text-foreground-muted">
            Acompanhe limites mensais com leitura simples e alertas claros para{" "}
            {currentMonthLabel}.
          </p>
        </div>
        <button
          onClick={() => setIsFormOpen((prev) => !prev)}
          className="flex items-center gap-2 rounded-xl border border-border bg-surface/70 px-4 py-2 text-sm font-semibold text-foreground transition hover:border-surface-3 hover:bg-surface-2"
        >
          <Sparkles size={16} />
          Nova meta
        </button>
      </header>

      {isFormOpen && (
        <section className="rounded-2xl border border-border bg-surface/92 p-6 shadow-[0_14px_30px_rgba(0,0,0,0.10)]">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
            <div>
              <label className="text-xs text-foreground-muted">Categoria</label>
              <select
                value={form.categoryId}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, categoryId: event.target.value }))
                }
                className="mt-1 w-full rounded-xl border border-border bg-surface-2 px-3 py-2 text-sm"
              >
                <option value="">Meta geral</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs text-foreground-muted">
                Limite mensal (R$)
              </label>
              <input
                value={form.monthlyLimit}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, monthlyLimit: event.target.value }))
                }
                placeholder="2000"
                className="mt-1 w-full rounded-xl border border-border bg-surface-2 px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="text-xs text-foreground-muted">
                Limiar de alerta (0-1)
              </label>
              <input
                value={form.alertThreshold}
                onChange={(event) =>
                  setForm((prev) => ({
                    ...prev,
                    alertThreshold: event.target.value,
                  }))
                }
                placeholder="0.8"
                className="mt-1 w-full rounded-xl border border-border bg-surface-2 px-3 py-2 text-sm"
              />
            </div>
            <div className="flex items-end">
              <button
                onClick={handleSubmit}
                className="w-full rounded-xl bg-primary/90 px-4 py-2 text-sm font-semibold text-white hover:bg-primary"
              >
                Salvar meta
              </button>
            </div>
          </div>
        </section>
      )}

      {isLoading ? (
        <div className="flex flex-col items-center justify-center gap-4 rounded-3xl border border-border/70 bg-surface/92 p-12 text-center text-foreground-subtle animate-in fade-in duration-500">
          <div className="h-10 w-10 animate-spin text-primary">
            <svg
              className="h-full w-full"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
          </div>
          Carregando metas...
        </div>
      ) : goals.length === 0 ? (
        <EmptyState
          icon={Target}
          title="Crie sua primeira meta"
          description="Escolha um limite simples para os pequenos gastos do mes. O Salgadin avisa quando voce estiver chegando perto e mostra como o consumo evolui."
          size="spacious"
          primaryAction={{
            label: "Criar meta",
            onClick: () => setIsFormOpen(true),
          }}
          secondaryAction={
            categories.length === 0
              ? { label: "Criar categorias", href: "/categorias" }
              : undefined
          }
        >
          <div className="grid gap-3 text-left sm:grid-cols-3">
            {[
              "Limites gerais ou por categoria.",
              "Alertas suaves antes de estourar o valor planejado.",
              "Leitura rapida para decidir os proximos gastos do mes.",
            ].map((item) => (
              <div
                key={item}
                className="rounded-2xl border border-border/80 bg-surface/80 px-4 py-3 text-sm text-foreground-muted"
              >
                {item}
              </div>
            ))}
          </div>
        </EmptyState>
      ) : (
        <>
          <section className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div className="rounded-2xl border border-border/70 bg-surface/92 p-5 shadow-[0_14px_30px_rgba(60,42,32,0.08)]">
              <div className="text-xs uppercase tracking-[0.2em] text-foreground-subtle">
                Metas ativas
              </div>
              <div className="mt-2 text-2xl font-semibold text-foreground">
                {summary.activeGoals}
              </div>
              <p className="mt-1 text-sm text-foreground-muted">
                Limites acompanhados neste ciclo mensal.
              </p>
            </div>

            <div className="rounded-2xl border border-border/70 bg-surface/92 p-5 shadow-[0_14px_30px_rgba(60,42,32,0.08)]">
              <div className="text-xs uppercase tracking-[0.2em] text-foreground-subtle">
                Saude financeira
              </div>
              <div className="mt-2 text-2xl font-semibold text-foreground">
                {summary.healthyGoals}
              </div>
              <p className="mt-1 text-sm text-foreground-muted">
                {summary.healthyGoals === 1
                  ? "meta segue com folga neste mes."
                  : "metas seguem com folga neste mes."}
              </p>
            </div>

            <div className="rounded-2xl border border-border/70 bg-surface/92 p-5 shadow-[0_14px_30px_rgba(60,42,32,0.08)]">
              <div className="text-xs uppercase tracking-[0.2em] text-foreground-subtle">
                Pedem atencao
              </div>
              <div className="mt-2 text-2xl font-semibold text-foreground">
                {summary.attentionGoals}
              </div>
              <p className="mt-1 text-sm text-foreground-muted">
                {summary.attentionGoals > 0
                  ? "Acompanhe os proximos gastos para manter o planejamento."
                  : "Nenhuma meta exige ajuste agora."}
              </p>
            </div>
          </section>

          <section className="rounded-3xl border border-border/70 bg-surface/92 p-6 shadow-[0_14px_30px_rgba(60,42,32,0.10)]">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <h2 className="text-lg font-semibold text-foreground">
                  Alertas do mes
                </h2>
                <p className="text-sm text-foreground-muted">
                  Recomendacoes simples com base no consumo registrado ate agora.
                </p>
              </div>
              <span className="rounded-full border border-border bg-surface-2 px-3 py-1 text-xs font-medium text-foreground-subtle">
                {currentMonthLabel}
              </span>
            </div>

            {summary.topAlerts.length > 0 ? (
              <div className="mt-5 grid gap-4 lg:grid-cols-3">
                {summary.topAlerts.map(({ goal, spent, percent, percentRaw, remaining, overflow, status }) => {
                  const config = statusConfig[status];
                  const Icon = config.icon;
                  const isOverLimit = status === "limit-reached";

                  return (
                    <div
                      key={goal.id}
                      className="rounded-2xl border border-border bg-surface-2/80 p-4"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <div className="text-sm font-semibold text-foreground">
                            {goal.category || "Meta geral"}
                          </div>
                          <p className="mt-1 text-xs text-foreground-muted">
                            {config.description}
                          </p>
                        </div>
                        <span
                          className={clsx(
                            "inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[11px] font-semibold",
                            config.badgeClass,
                          )}
                        >
                          <Icon size={12} />
                          {config.label}
                        </span>
                      </div>

                      <div className="mt-4 flex items-end justify-between gap-3">
                        <div>
                          <div className="text-xs text-foreground-subtle">
                            Gasto atual
                          </div>
                          <div className="text-lg font-semibold text-foreground">
                            {formatCurrency(spent)}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-xs text-foreground-subtle">
                            Limite mensal
                          </div>
                          <div className="text-sm font-medium text-foreground">
                            {formatCurrency(goal.monthlyLimit)}
                          </div>
                        </div>
                      </div>

                      <div className="mt-4 h-2 rounded-full bg-surface-3">
                        <div
                          className={clsx("h-2 rounded-full", config.progressClass)}
                          style={{ width: `${Math.min(percentRaw, 100)}%` }}
                        />
                      </div>

                      <div className="mt-3 flex items-center justify-between text-xs text-foreground-subtle">
                        <span>{percent}% usado</span>
                        <span>
                          Alerta em {(goal.alertThreshold * 100).toFixed(0)}%
                        </span>
                      </div>

                      <div className="mt-4 rounded-2xl border border-border/70 bg-surface px-3.5 py-3 text-sm text-foreground-muted">
                        {isOverLimit
                          ? `Voce ultrapassou ${formatCurrency(overflow)} do limite planejado.`
                          : `Ainda restam ${formatCurrency(remaining)} para esta meta neste mes.`}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <EmptyState
                icon={Shield}
                title="Tudo sob controle neste mes"
                description="Suas metas ativas ainda estao em uma zona confortavel. Continue registrando os gastos para manter os alertas atualizados."
                compact
                className="mt-5"
              />
            )}
          </section>

          <section className="grid grid-cols-1 gap-5 lg:grid-cols-2 xl:grid-cols-3">
            {goalCards.map(({ goal, spent, percent, percentRaw, remaining, overflow, status }, index) => {
              const config = statusConfig[status];
              const Icon = config.icon;
              const reward =
                percentRaw >= 100 ? "Ajustar" : percentRaw >= 80 ? "Acompanhar" : "Estavel";

              return (
                <div
                  key={goal.id}
                  style={{ animationDelay: `${index * 80}ms` }}
                  className="animate-fade-in rounded-3xl border border-border/70 bg-gradient-to-br from-surface/95 via-surface/90 to-surface-2/75 p-6 opacity-0 shadow-[0_14px_30px_rgba(60,42,32,0.10)] soft-hover [animation-fill-mode:forwards]"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="grid h-12 w-12 place-items-center rounded-xl bg-primary/15 text-primary">
                      <Target size={18} />
                    </div>
                    <div className="text-right">
                      <div className="text-xs uppercase tracking-[0.18em] text-foreground-subtle">
                        Prioridade
                      </div>
                      <div className="mt-1 text-sm font-semibold text-foreground">
                        {reward}
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <h2 className="text-lg font-semibold text-foreground">
                        {goal.category || "Meta geral"}
                      </h2>
                      <p className="mt-1 text-sm text-foreground-muted">
                        {formatCurrency(spent)} usados de {formatCurrency(goal.monthlyLimit)}
                      </p>
                    </div>
                    <span
                      className={clsx(
                        "inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[11px] font-semibold",
                        config.badgeClass,
                      )}
                    >
                      <Icon size={12} />
                      {config.label}
                    </span>
                  </div>

                  <div className="mt-5 h-2.5 rounded-full bg-surface-3">
                    <div
                      className={clsx("h-2.5 rounded-full", config.progressClass)}
                      style={{ width: `${Math.min(percentRaw, 100)}%` }}
                    />
                  </div>

                  <div className="mt-3 flex items-center justify-between text-xs text-foreground-subtle">
                    <span>{percent}% do limite usado</span>
                    <span>Meta em {(goal.alertThreshold * 100).toFixed(0)}%</span>
                  </div>

                  <div className="mt-5 grid gap-3 sm:grid-cols-3">
                    <div className="rounded-2xl border border-border bg-surface/80 px-4 py-3">
                      <div className="text-[11px] uppercase tracking-[0.16em] text-foreground-subtle">
                        Atual
                      </div>
                      <div className="mt-1 text-sm font-semibold text-foreground">
                        {formatCurrency(spent)}
                      </div>
                    </div>
                    <div className="rounded-2xl border border-border bg-surface/80 px-4 py-3">
                      <div className="text-[11px] uppercase tracking-[0.16em] text-foreground-subtle">
                        Limite
                      </div>
                      <div className="mt-1 text-sm font-semibold text-foreground">
                        {formatCurrency(goal.monthlyLimit)}
                      </div>
                    </div>
                    <div className="rounded-2xl border border-border bg-surface/80 px-4 py-3">
                      <div className="text-[11px] uppercase tracking-[0.16em] text-foreground-subtle">
                        {overflow > 0 ? "Acima" : "Saldo"}
                      </div>
                      <div className="mt-1 text-sm font-semibold text-foreground">
                        {formatCurrency(overflow > 0 ? overflow : remaining)}
                      </div>
                    </div>
                  </div>

                  <div className="mt-5 rounded-2xl border border-border bg-surface-2 px-4 py-3">
                    <div className="flex items-center justify-between gap-3 text-sm">
                      <div className="flex items-center gap-2 text-foreground">
                        <Trophy size={16} className={config.toneClass} />
                        <span className="font-medium">
                          {goal.isActive ? "Status ativo" : "Status pausado"}
                        </span>
                      </div>
                      <ArrowUpRight size={16} className={config.toneClass} />
                    </div>
                    <p className="mt-2 text-sm text-foreground-muted">
                      {config.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </section>
        </>
      )}
    </div>
  );
}
