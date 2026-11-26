import { useCallback, useEffect, useMemo, useState } from "react";
import clsx from "clsx";
import {
  Plus,
  CheckCircle2,
  Flag,
  Shield,
  Target,
  TriangleAlert,
} from "lucide-react";
import { getGoals, createGoal, getGoalAlerts } from "../services/goalService";
import { getCategories, type Category } from "../services/categoryService";
import type { Goal, GoalAlert } from "../lib/types";
import { EmptyState } from "../components/EmptyState";
import { PageHeader, StatRow } from "../components/PageHeader";

const defaultAlertThreshold = 0.8;

type GoalStatus =
  | "healthy"
  | "near-limit"
  | "limit-reached"
  | "over-limit"
  | "paused";

const formatCurrency = (value: number) =>
  value.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });

const formatPercent = (value: number) =>
  `${Math.max(0, Math.round(value)).toLocaleString("pt-BR")}%`;

const toThresholdPercent = (value: number) =>
  Math.max(1, Math.min(100, Math.round(value * 100)));

const clamp = (value: number, min: number, max: number) =>
  Math.min(max, Math.max(min, value));

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

  if (percent > 100) {
    return "over-limit";
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
    label: "Saudável",
    description: "Seu ritmo segue dentro do planejado neste mês.",
    toneClass: "text-success",
    badgeClass: "border-success/20 bg-success/10 text-success",
    progressClass: "bg-success",
    icon: CheckCircle2,
  },
  "near-limit": {
    label: "Atenção",
    description: "Vale acompanhar os próximos gastos para manter o controle.",
    toneClass: "text-warning",
    badgeClass: "border-warning/20 bg-warning/10 text-warning",
    progressClass: "bg-warning",
    icon: Flag,
  },
  "limit-reached": {
    label: "Limite atingido",
    description: "O limite mensal foi usado. Revise os próximos lançamentos com calma.",
    toneClass: "text-danger",
    badgeClass: "border-danger/20 bg-danger/10 text-danger",
    progressClass: "bg-danger",
    icon: TriangleAlert,
  },
  "over-limit": {
    label: "Limite ultrapassado",
    description: "O limite mensal passou do planejado. Vale ajustar os próximos gastos com calma.",
    toneClass: "text-danger",
    badgeClass: "border-danger/20 bg-danger/10 text-danger",
    progressClass: "bg-danger",
    icon: TriangleAlert,
  },
  paused: {
    label: "Meta pausada",
    description: "Essa meta não está contando alertas enquanto estiver pausada.",
    toneClass: "text-foreground-muted",
    badgeClass: "border-border bg-surface-2 text-foreground-muted",
    progressClass: "bg-foreground-muted/40",
    icon: Shield,
  },
};

const getGoalStatusHeadline = (
  status: GoalStatus,
  categoryLabel: string,
  percent: number,
  overflow: number,
) => {
  if (status === "over-limit") {
    return `A meta de ${categoryLabel} passou do limite em ${formatCurrency(overflow)}.`;
  }

  if (status === "limit-reached") {
    return `A meta de ${categoryLabel} chegou a ${formatPercent(percent)} do limite.`;
  }

  if (status === "near-limit") {
    return `Você já usou ${formatPercent(percent)} da meta de ${categoryLabel}.`;
  }

  if (status === "paused") {
    return `A meta de ${categoryLabel} está pausada neste momento.`;
  }

  return `A meta de ${categoryLabel} segue dentro do planejado neste mês.`;
};

const getGoalStatusDetail = (
  status: GoalStatus,
  remaining: number,
  overflow: number,
) => {
  if (status === "over-limit") {
    return `Você passou ${formatCurrency(overflow)} do valor planejado neste mês.`;
  }

  if (status === "limit-reached") {
    return "O limite mensal foi usado por completo. Vale acompanhar os próximos gastos com calma.";
  }

  if (status === "near-limit") {
    return `Restam ${formatCurrency(remaining)} para manter a meta neste mês.`;
  }

  if (status === "paused") {
    return "Essa meta não gera alertas enquanto estiver pausada.";
  }

  return `Ainda restam ${formatCurrency(remaining)} para essa meta neste mês.`;
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
    alertThreshold: toThresholdPercent(defaultAlertThreshold).toString(),
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
      const percent = Math.max(0, Math.round(percentRaw));
      const status = getGoalStatus(goal, alert, percentRaw);
      const remaining = Math.max(goal.monthlyLimit - spent, 0);
      const overflow = Math.max(spent - goal.monthlyLimit, 0);
      const thresholdPercent = toThresholdPercent(goal.alertThreshold);
      const categoryLabel = goal.category || "Meta geral";

      return {
        goal,
        alert,
        categoryLabel,
        spent,
        percent,
        percentRaw,
        remaining,
        overflow,
        status,
        thresholdPercent,
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
      ({ status }) => status === "limit-reached" || status === "over-limit",
    );

    return {
      activeGoals: activeGoals.length,
      healthyGoals: healthyGoals.length,
      attentionGoals: nearLimitGoals.length + reachedGoals.length,
      topAlerts: goalCards
        .filter(({ status }) =>
          status === "near-limit" ||
          status === "limit-reached" ||
          status === "over-limit",
        )
        .sort((a, b) => b.percentRaw - a.percentRaw)
        .slice(0, 3),
    };
  }, [goalCards]);

  const handleSubmit = async () => {
    if (!form.monthlyLimit) return;

    const parsedThresholdPercent = Number(form.alertThreshold.replace(",", "."));

    const payload = {
      categoryId: form.categoryId ? Number(form.categoryId) : null,
      monthlyLimit: Number(form.monthlyLimit.replace(",", ".")),
      alertThreshold:
        Number.isFinite(parsedThresholdPercent) && parsedThresholdPercent > 0
          ? clamp(parsedThresholdPercent, 1, 100) / 100
          : defaultAlertThreshold,
      isActive: form.isActive,
    };

    await createGoal(payload);
    setForm({
      categoryId: "",
      monthlyLimit: "",
      alertThreshold: toThresholdPercent(defaultAlertThreshold).toString(),
      isActive: true,
    });
    setIsFormOpen(false);
    fetchData();
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Metas"
        description={<>Limites mensais por categoria, com aviso antes de estourar em {currentMonthLabel}.</>}
        actions={
          <button type="button" onClick={() => setIsFormOpen((prev) => !prev)} className="inline-flex min-h-10 items-center gap-2 whitespace-nowrap rounded-[var(--radius-control)] bg-primary px-3.5 text-ui font-medium text-[var(--color-on-primary)] transition-colors hover:bg-primary-strong disabled:cursor-not-allowed disabled:opacity-50">
            <Plus size={15} />
            Nova meta
          </button>
        }
      />

      {isFormOpen && (
        <section className="rounded-2xl border border-border bg-surface p-6">
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
                Avisar quando atingir
              </label>
              <input
                value={form.alertThreshold}
                onChange={(event) =>
                  setForm((prev) => ({
                    ...prev,
                    alertThreshold: event.target.value,
                  }))
                }
                type="number"
                min="1"
                max="100"
                step="1"
                inputMode="numeric"
                placeholder="80"
                className="mt-1 w-full rounded-xl border border-border bg-surface-2 px-3 py-2 text-sm"
              />
              <p className="mt-2 text-xs text-foreground-subtle">
                Avisar quando atingir {form.alertThreshold || "80"}% da meta.
              </p>
            </div>
            <div className="flex items-end">
              <button
                onClick={handleSubmit}
                className="w-full rounded-xl bg-primary/90 px-4 py-2 text-sm font-medium text-[var(--color-on-primary)] hover:bg-primary"
              >
                Salvar meta
              </button>
            </div>
          </div>
        </section>
      )}

      {isLoading ? (
        <div className="flex flex-col items-center justify-center gap-4 rounded-2xl border border-border bg-surface p-12 text-center text-foreground-subtle">
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
          description="Escolha um limite simples para os pequenos gastos do mês. O Salgadin avisa quando você estiver chegando perto e mostra como o consumo evolui."
          size="spacious"
          primaryAction={{
            label: "Criar meta",
            onClick: () => setIsFormOpen(true),
          }}
          secondaryAction={
            categories.length === 0
              ? { label: "Criar categorias", href: "/lancamentos/categorias" }
              : undefined
          }
        >
          <div className="grid gap-3 text-left sm:grid-cols-3">
            {[
              "Limites gerais ou por categoria.",
              "Alertas suaves antes de estourar o valor planejado.",
              "Leitura rápida para decidir os próximos gastos do mês.",
            ].map((item) => (
              <div
                key={item}
                className="rounded-2xl border border-border bg-surface px-4 py-3 text-sm text-foreground-muted"
              >
                {item}
              </div>
            ))}
          </div>
        </EmptyState>
      ) : (
        <>
          <StatRow
            items={[
              { label: "Metas ativas", value: summary.activeGoals },
              { label: "Com folga", value: summary.healthyGoals, tone: summary.healthyGoals > 0 ? "success" : "default" },
              {
                label: "Pedem atenção",
                value: summary.attentionGoals,
                tone: summary.attentionGoals > 0 ? "warning" : "default",
                hint: summary.attentionGoals > 0 ? "Acompanhe os próximos gastos" : "Nenhuma precisa de ajuste",
              },
            ]}
          />

          <section className="rounded-2xl border border-border bg-surface p-6">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <h2 className="text-base font-medium text-foreground">
                  Alertas do mês
                </h2>
                <p className="text-sm text-foreground-muted">
                  Recomendações simples com base no consumo registrado até agora.
                </p>
              </div>
            </div>

            {summary.topAlerts.length > 0 ? (
              <div className="mt-5 grid gap-4 lg:grid-cols-3">
                {summary.topAlerts.map(({
                  goal,
                  spent,
                  percent,
                  percentRaw,
                  remaining,
                  overflow,
                  status,
                  categoryLabel,
                  thresholdPercent,
                }) => {
                  const config = statusConfig[status];
                  const Icon = config.icon;
                  const progressWidth = clamp(percentRaw, 0, 100);

                  return (
                    <div
                      key={goal.id}
                      className="rounded-2xl border border-border bg-surface-2/80 p-4"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <div className="text-sm font-medium text-foreground">
                            {categoryLabel}
                          </div>
                          <p className="mt-1 text-xs text-foreground-muted">
                            {getGoalStatusHeadline(
                              status,
                              categoryLabel,
                              percent,
                              overflow,
                            )}
                          </p>
                        </div>
                        <span
                          className={clsx(
                            "inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-medium",
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
                          <div className="text-lg font-medium text-foreground">
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
                          style={{ width: `${progressWidth}%` }}
                        />
                      </div>

                      <div className="mt-3 flex items-center justify-between text-xs text-foreground-subtle">
                        <span>{formatPercent(percent)} usado</span>
                        <span>Alerta em {thresholdPercent}%</span>
                      </div>

                      <div className="mt-4 rounded-2xl border border-border bg-surface px-3.5 py-3 text-sm text-foreground-muted">
                        {getGoalStatusDetail(status, remaining, overflow)}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <EmptyState
                icon={Shield}
                title="Tudo sob controle neste mês"
                description="Suas metas ativas ainda estão em uma zona confortável. Continue registrando os gastos para manter os alertas atualizados."
                compact
                className="mt-5"
              />
            )}
          </section>

          <section className="grid grid-cols-1 gap-5 lg:grid-cols-2 xl:grid-cols-3">
            {goalCards.map(({
              goal,
              spent,
              percent,
              percentRaw,
              remaining,
              overflow,
              status,
              categoryLabel,
              thresholdPercent,
            }) => {
              const config = statusConfig[status];
              const Icon = config.icon;
              const progressWidth = clamp(percentRaw, 0, 100);

              return (
                <div
                  key={goal.id}
                  className=" rounded-2xl border border-border bg-surface p-6"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex min-w-0 items-center gap-3">
                      <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-primary/15 text-primary">
                        <Target size={18} />
                      </div>
                      <div className="min-w-0">
                        <h2 className="truncate text-base font-medium text-foreground">
                          {categoryLabel}
                          {!goal.isActive && (
                            <span className="ml-2 text-xs font-normal text-foreground-subtle">
                              pausada
                            </span>
                          )}
                        </h2>
                        <p className="text-ui text-foreground-muted tabular-nums">
                          {formatCurrency(spent)} de {formatCurrency(goal.monthlyLimit)}
                        </p>
                      </div>
                    </div>
                    <span
                      className={clsx(
                        "inline-flex shrink-0 items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-medium",
                        config.badgeClass,
                      )}
                    >
                      <Icon size={12} />
                      {config.label}
                    </span>
                  </div>

                  <div className="mt-5 h-2 rounded-full bg-surface-3">
                    <div
                      className={clsx("h-2 rounded-full", config.progressClass)}
                      style={{ width: `${progressWidth}%` }}
                    />
                  </div>

                  <div className="mt-2 flex flex-wrap items-center justify-between gap-2 text-xs text-foreground-subtle tabular-nums">
                    <span>
                      {formatPercent(percent)} usado · aviso em {thresholdPercent}%
                    </span>
                    <span className={overflow > 0 ? "font-medium text-danger" : undefined}>
                      {overflow > 0
                        ? `${formatCurrency(overflow)} acima`
                        : `${formatCurrency(remaining)} restantes`}
                    </span>
                  </div>

                  <div className="mt-5 border-t border-border pt-4">
                    <p className="text-ui text-foreground">
                      {getGoalStatusHeadline(
                        status,
                        categoryLabel,
                        percent,
                        overflow,
                      )}
                    </p>
                    <p className="mt-1 text-ui text-foreground-muted">
                      {getGoalStatusDetail(status, remaining, overflow)}
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
