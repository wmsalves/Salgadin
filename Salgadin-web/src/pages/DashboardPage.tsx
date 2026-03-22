import { useEffect, useState, useCallback, useMemo } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import {
  Wallet,
  Target,
  TrendingDown,
  Plus,
  PiggyBank,
  Pizza,
  Bus,
  ShoppingCart,
  Laptop,
} from "lucide-react";
import clsx from "clsx";
import { getExpenses, getDailySummary } from "../services/expenseService";
import { type Expense, type DailySummary } from "../lib/types";
import { AddExpenseModal } from "../components/AddExpenseModal";

const categoryIcons: Record<string, React.ComponentType<{ size?: number }>> = {
  Alimentacao: Pizza,
  "AlimentaÃ§Ã£o": Pizza,
  Transporte: Bus,
  Compras: ShoppingCart,
  Educacao: Laptop,
  "EducaÃ§Ã£o": Laptop,
};

export default function DashboardPage() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [summary, setSummary] = useState<DailySummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAddExpenseModalOpen, setIsAddExpenseModalOpen] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      setError(null);
      const [expensesData, summaryData] = await Promise.all([
        getExpenses(),
        getDailySummary(),
      ]);
      setExpenses(expensesData);
      setSummary(summaryData);
    } catch (err) {
      console.error("Falha ao buscar dados do dashboard:", err);
      setError(
        "Nao foi possivel carregar seus dados financeiros. Tente novamente mais tarde.",
      );
    }
  }, []);

  useEffect(() => {
    setIsLoading(true);
    fetchData().finally(() => setIsLoading(false));
  }, [fetchData]);

  const totalExpenses = summary.reduce((acc, day) => acc + day.total, 0);
  const totalRevenue = 3500.0;
  const balance = totalRevenue - totalExpenses;

  const chartGradient = useMemo(
    () => ({ id: "cashflow", from: "var(--color-primary)", to: "rgba(242,139,91,0)" }),
    [],
  );

  const cashflowData = useMemo(
    () =>
      summary
        .slice()
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
        .map((item) => ({
          day: new Date(item.date).toLocaleDateString("pt-BR", {
            weekday: "short",
          }),
          value: item.total,
        })),
    [summary],
  );

  const summaryCards = useMemo(
    () => [
      {
        title: "Saldo Atual",
        helper: "Disponivel hoje",
        value: balance.toLocaleString("pt-BR", {
          style: "currency",
          currency: "BRL",
        }),
        trend: balance >= 0 ? "+12%" : "-4%",
        icon: Wallet,
        tone: balance >= 0 ? "success" : "danger",
      },
      {
        title: "Metas Ativas",
        helper: "Economia em progresso",
        value: "3 metas",
        trend: "68%",
        icon: Target,
        tone: "info",
      },
      {
        title: "Gastos do Mes",
        helper: "Comparado ao mes anterior",
        value: totalExpenses.toLocaleString("pt-BR", {
          style: "currency",
          currency: "BRL",
        }),
        trend: "-8%",
        icon: TrendingDown,
        tone: "danger",
      },
    ],
    [balance, totalExpenses],
  );

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block mb-4">
            <div className="animate-spin">
              <div className="h-12 w-12 border-4 border-surface-3 border-t-primary rounded-full"></div>
            </div>
          </div>
          <p className="text-foreground-muted font-medium">
            Carregando seu dashboard...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="p-8 rounded-xl bg-surface-2 border border-danger/30 max-w-md">
          <p className="text-danger font-medium text-center">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-3">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <p className="text-sm text-foreground-muted">Bem-vindo de volta</p>
            <h1 className="text-3xl font-semibold text-foreground">
              Seu painel financeiro
            </h1>
          </div>
          <button
            onClick={() => setIsAddExpenseModalOpen(true)}
            className="inline-flex items-center gap-2 rounded-full border border-border bg-surface/80 px-4 py-2 text-sm font-semibold text-foreground hover:border-surface-3 hover:bg-surface-2 transition"
          >
            <Plus size={16} />
            Nova despesa
          </button>
        </div>
      </header>

      <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {summaryCards.map((card) => {
          const Icon = card.icon;
          const toneClass =
            card.tone === "success"
              ? "text-success"
              : card.tone === "danger"
                ? "text-danger"
                : "text-primary";

          return (
            <div
              key={card.title}
              className="rounded-3xl border border-border/70 bg-gradient-to-br from-surface/90 via-surface/75 to-surface-2/70 backdrop-blur-xl p-5 shadow-[0_18px_40px_rgba(60,42,32,0.12)] animate-fade-in"
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm text-foreground-subtle">
                    {card.title}
                  </div>
                  <div className="text-[11px] text-foreground-muted">
                    {card.helper}
                  </div>
                </div>
                <div
                  className={clsx(
                    "h-10 w-10 rounded-full bg-surface-2 grid place-items-center shadow-sm",
                    toneClass,
                  )}
                >
                  <Icon size={18} />
                </div>
              </div>
              <div className="mt-4 text-2xl font-semibold text-foreground">
                {card.value}
              </div>
              <div className={clsx("mt-2 text-xs", toneClass)}>
                {card.trend}
              </div>
            </div>
          );
        })}
      </section>

      <section className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 rounded-3xl border border-border/70 bg-surface/75 backdrop-blur-xl p-6 shadow-[0_18px_40px_rgba(60,42,32,0.12)]">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-semibold text-foreground">
                Fluxo de Caixa
              </h2>
              <p className="text-xs text-foreground-subtle">
                Receitas e despesas ao longo da semana
              </p>
            </div>
            <div className="flex items-center gap-2 text-[11px] text-foreground-subtle">
              <span className="rounded-full bg-surface-2 px-2 py-0.5">
                Receita: {totalRevenue.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
              </span>
              <span className="rounded-full bg-surface-2 px-2 py-0.5">
                Despesa: {totalExpenses.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
              </span>
            </div>
          </div>
          <div className="h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={cashflowData}>
                <defs>
                  <linearGradient
                    id={chartGradient.id}
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop
                      offset="0%"
                      stopColor={chartGradient.from}
                      stopOpacity={0.35}
                    />
                    <stop
                      offset="100%"
                      stopColor={chartGradient.to}
                      stopOpacity={0}
                    />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  stroke="var(--color-border)"
                  strokeDasharray="4 4"
                  vertical={false}
                  opacity={0.6}
                />
                <XAxis
                  dataKey="day"
                  tickLine={false}
                  axisLine={false}
                  tick={{ fill: "var(--chart-muted)" }}
                />
                <YAxis
                  tickFormatter={(value) => `R$ ${value}`}
                  tickLine={false}
                  axisLine={false}
                  tick={{ fill: "var(--chart-muted)" }}
                />
                <Tooltip
                  contentStyle={{
                    background: "var(--color-surface)",
                    border: "1px solid var(--color-border)",
                    color: "var(--color-text)",
                    borderRadius: "16px",
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="value"
                  stroke="var(--color-primary)"
                  strokeWidth={2.5}
                  dot={false}
                  activeDot={{ r: 4, fill: "var(--color-primary)" }}
                  fill={`url(#${chartGradient.id})`}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-3xl border border-border/70 bg-surface/75 backdrop-blur-xl p-6 shadow-[0_18px_40px_rgba(60,42,32,0.12)]">
            <h2 className="text-lg font-semibold text-foreground mb-4">
              Resumo do Mes
            </h2>
            <div className="space-y-3">
              {[
                {
                  label: "Receitas",
                  value: totalRevenue,
                  tone: "text-success",
                },
                {
                  label: "Despesas",
                  value: totalExpenses,
                  tone: "text-danger",
                },
                {
                  label: "Saldo",
                  value: balance,
                  tone: balance >= 0 ? "text-success" : "text-danger",
                },
              ].map((item) => (
                <div
                  key={item.label}
                  className="flex items-center justify-between rounded-2xl border border-border bg-surface-2 px-4 py-3"
                >
                  <span className="text-sm text-foreground-subtle">
                    {item.label}
                  </span>
                  <span className={clsx("text-sm font-semibold", item.tone)}>
                    {item.value.toLocaleString("pt-BR", {
                      style: "currency",
                      currency: "BRL",
                    })}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-3xl border border-border/70 bg-surface/75 backdrop-blur-xl p-6 shadow-[0_18px_40px_rgba(60,42,32,0.12)]">
            <h2 className="text-lg font-semibold text-foreground mb-4">
              Proximas metas
            </h2>
            <div className="space-y-4">
              {["Reserva de emergencia", "Viagem", "Novo notebook"].map(
                (goal, index) => (
                  <div
                    key={goal}
                    className="rounded-2xl border border-border bg-surface-2 p-4"
                  >
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-foreground">{goal}</span>
                      <span className="text-primary">{60 + index * 10}%</span>
                    </div>
                    <div className="mt-3 h-2 rounded-full bg-surface-3">
                      <div
                        className="h-2 rounded-full bg-primary"
                        style={{ width: `${60 + index * 10}%` }}
                      />
                    </div>
                  </div>
                ),
              )}
            </div>
          </div>

          <div className="rounded-3xl border border-border/70 bg-surface/75 backdrop-blur-xl p-6 shadow-[0_18px_40px_rgba(60,42,32,0.12)]">
            <h2 className="text-lg font-semibold text-foreground mb-4">
              Ultimas despesas
            </h2>
            <div className="space-y-3">
              {expenses.length > 0 ? (
                expenses.slice(0, 5).map((exp) => {
                  const Icon = categoryIcons[exp.category] || PiggyBank;
                  const amountValue = Math.abs(exp.amount);
                  const amountLabel = amountValue.toLocaleString("pt-BR", {
                    style: "currency",
                    currency: "BRL",
                  });
                  return (
                    <div
                      key={exp.id}
                      className="flex items-center gap-3 rounded-2xl border border-border bg-surface-2 p-3"
                    >
                      <div className="h-10 w-10 rounded-full bg-surface-3 text-primary grid place-items-center">
                        <Icon size={16} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-foreground truncate">
                          {exp.description}
                        </p>
                        <p className="text-xs text-foreground-subtle">
                          {exp.category} •{" "}
                          {new Date(exp.date).toLocaleDateString("pt-BR", {
                            day: "2-digit",
                            month: "short",
                          })}
                        </p>
                      </div>
                      <div className="text-sm font-semibold text-danger">
                        - {amountLabel}
                      </div>
                    </div>
                  );
                })
              ) : (
                <p className="text-sm text-foreground-subtle text-center">
                  Nenhuma despesa encontrada.
                </p>
              )}
            </div>
          </div>
        </div>
      </section>

      <AddExpenseModal
        isOpen={isAddExpenseModalOpen}
        onClose={() => setIsAddExpenseModalOpen(false)}
        onSuccess={fetchData}
      />
    </div>
  );
}
