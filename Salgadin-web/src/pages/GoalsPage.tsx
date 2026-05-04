import { useCallback, useEffect, useMemo, useState } from "react";
import { Trophy, Sparkles, Target, ArrowUpRight } from "lucide-react";
import { getGoals, createGoal, getGoalAlerts } from "../services/goalService";
import { getCategories, type Category } from "../services/categoryService";
import type { Goal, GoalAlert } from "../lib/types";
import { EmptyState } from "../components/EmptyState";

const defaultAlertThreshold = 0.8;

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

  const handleSubmit = async () => {
    if (!form.monthlyLimit) return;
    const payload = {
      categoryId: form.categoryId ? Number(form.categoryId) : null,
      monthlyLimit: Number(form.monthlyLimit.replace(",", ".")),
      alertThreshold: Number(form.alertThreshold.replace(",", ".")) || defaultAlertThreshold,
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
      <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Metas</h1>
          <p className="text-sm text-foreground-muted">
            Transforme seus objetivos em conquistas visuais.
          </p>
        </div>
        <button
          onClick={() => setIsFormOpen((prev) => !prev)}
          className="flex items-center gap-2 rounded-xl border border-border bg-surface/70 px-4 py-2 text-sm font-semibold text-foreground hover:border-surface-3 hover:bg-surface-2 transition"
        >
          <Sparkles size={16} />
          Nova meta
        </button>
      </header>

      {isFormOpen && (
        <section className="rounded-2xl border border-border bg-surface/92 p-6 shadow-[0_14px_30px_rgba(0,0,0,0.10)]">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="text-xs text-foreground-muted">
                Categoria
              </label>
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
                className="w-full rounded-xl bg-primary/90 text-white px-4 py-2 text-sm font-semibold hover:bg-primary"
              >
                Salvar meta
              </button>
            </div>
          </div>
        </section>
      )}

      {isLoading ? (
        <div className="rounded-3xl border border-border/70 bg-surface/92 p-12 text-center text-foreground-subtle flex flex-col items-center justify-center gap-4 animate-in fade-in duration-500">
          <div className="h-10 w-10 text-primary animate-spin">
            <svg className="h-full w-full" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          </div>
          Carregando metas...
        </div>
      ) : goals.length === 0 ? (
        <EmptyState
          icon={Target}
          title="Crie sua primeira meta"
          description="Escolha um limite simples para os pequenos gastos do mes. O Salgadin avisa quando voce estiver chegando perto."
          primaryAction={{
            label: "Criar meta",
            onClick: () => setIsFormOpen(true),
          }}
          secondaryAction={
            categories.length === 0
              ? { label: "Criar categorias", href: "/categorias" }
              : undefined
          }
        />
      ) : (
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {goals.map((goal, index) => {
            const alert = alertsByGoal[goal.id];
            const spent = alert?.spent ?? 0;
            const percent =
              goal.monthlyLimit > 0
                ? Math.min(Math.round((spent / goal.monthlyLimit) * 100), 100)
                : 0;
            const reward = percent >= 90 ? "Ouro" : percent >= 70 ? "Prata" : "Bronze";

            return (
              <div
                key={goal.id}
                style={{ animationDelay: `${index * 100}ms` }}
                className="rounded-3xl border border-border/70 bg-gradient-to-br from-surface/95 via-surface/90 to-surface-2/75 p-6 shadow-[0_14px_30px_rgba(60,42,32,0.10)] soft-hover animate-fade-in opacity-0 [animation-fill-mode:forwards]"
              >
                <div className="flex items-center justify-between">
                  <div className="h-12 w-12 rounded-xl bg-primary/15 text-primary grid place-items-center">
                    <Target size={18} />
                  </div>
                  <span className="text-xs text-foreground-subtle">
                    {reward}
                  </span>
                </div>

                <h2 className="mt-4 text-lg font-semibold text-foreground">
                  {goal.category || "Meta geral"}
                </h2>
                <p className="text-sm text-foreground-muted">
                  R$ {spent.toFixed(2)} de R$ {goal.monthlyLimit.toFixed(2)}
                </p>

                <div className="mt-4 h-2 rounded-full bg-surface-3">
                  <div
                    className="h-2 rounded-full bg-primary"
                    style={{ width: `${percent}%` }}
                  />
                </div>

                <div className="mt-3 flex items-center justify-between text-xs text-foreground-subtle">
                  <span>{percent}% consumido</span>
                  <span>
                    Alerta em {(goal.alertThreshold * 100).toFixed(0)}%
                  </span>
                </div>

                <div className="mt-5 flex items-center justify-between rounded-xl border border-border bg-surface-2 px-4 py-3 text-sm">
                  <div className="flex items-center gap-2 text-primary">
                    <Trophy size={16} />
                    Status: {goal.isActive ? "Ativa" : "Pausada"}
                  </div>
                  <ArrowUpRight size={16} className="text-primary" />
                </div>
              </div>
            );
          })}
        </section>
      )}
    </div>
  );
}
