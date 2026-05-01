import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  ArrowDownRight,
  ArrowUpRight,
  Calendar,
  ChevronLeft,
  ChevronRight,
  HandCoins,
  Laptop,
  Pencil,
  PieChart as PieChartIcon,
  PiggyBank,
  Pizza,
  Plus,
  Receipt,
  ShoppingCart,
  Target,
  Trash2,
  TrendingDown,
  Bus,
  Wallet,
} from "lucide-react";
import clsx from "clsx";
import {
  deleteExpense,
  getDailySummary,
  getExpenses,
} from "../services/expenseService";
import { deleteIncome, getIncomes } from "../services/incomeService";
import { getGoalAlerts } from "../services/goalService";
import type { DailySummary, Expense, GoalAlert, Income } from "../lib/types";
import { AddExpenseModal } from "../components/AddExpenseModal";
import { AddIncomeModal } from "../components/AddIncomeModal";
import { formatApiDate, formatDisplayDate } from "../lib/dates";

const categoryIcons: Record<string, React.ComponentType<{ size?: number }>> = {
  Alimentacao: Pizza,
  "AlimentaÃ§Ã£o": Pizza,
  Transporte: Bus,
  Compras: ShoppingCart,
  Educacao: Laptop,
  "EducaÃ§Ã£o": Laptop,
};

const CHART_COLORS = [
  "var(--color-primary)",
  "var(--color-accent)",
  "var(--color-warning)",
  "var(--color-danger)",
  "var(--color-success)",
  "var(--color-primary-strong)",
];

export default function DashboardPage() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [incomes, setIncomes] = useState<Income[]>([]);
  const [summary, setSummary] = useState<DailySummary[]>([]);
  const [alerts, setAlerts] = useState<GoalAlert[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAddExpenseModalOpen, setIsAddExpenseModalOpen] = useState(false);
  const [isAddIncomeModalOpen, setIsAddIncomeModalOpen] = useState(false);
  const [expenseToEdit, setExpenseToEdit] = useState<Expense | null>(null);
  const [incomeToEdit, setIncomeToEdit] = useState<Income | null>(null);
  const [isFabOpen, setIsFabOpen] = useState(false);
  const [currentDate, setCurrentDate] = useState(new Date());

  const fetchData = useCallback(async () => {
    try {
      setError(null);
      const year = currentDate.getFullYear();
      const month = currentDate.getMonth();
      const startDate = formatApiDate(new Date(year, month, 1));
      const endDate = formatApiDate(new Date(year, month + 1, 0));

      const [expensesData, summaryData, incomesData, alertsData] =
        await Promise.all([
          getExpenses(startDate, endDate),
          getDailySummary(startDate, endDate),
          getIncomes(startDate, endDate),
          getGoalAlerts(year, month + 1),
        ]);

      setExpenses(expensesData);
      setSummary(summaryData);
      setIncomes(incomesData);
      setAlerts(alertsData);
    } catch (err) {
      console.error("Falha ao buscar dados do dashboard:", err);
      setError(
        "Nao foi possivel carregar seus dados financeiros. Tente novamente mais tarde.",
      );
    }
  }, [currentDate]);

  useEffect(() => {
    setIsLoading(true);
    fetchData().finally(() => setIsLoading(false));
  }, [fetchData]);

  const handleDeleteExpense = async (id: number) => {
    if (!window.confirm("Deseja apagar esta despesa permanentemente?")) {
      return;
    }

    try {
      await deleteExpense(id);
      fetchData();
    } catch (err) {
      console.error("Falha ao remover despesa:", err);
      alert("Nao foi possivel excluir a despesa.");
    }
  };

  const handleDeleteIncome = async (id: number) => {
    if (!window.confirm("Deseja apagar esta receita permanentemente?")) {
      return;
    }

    try {
      await deleteIncome(id);
      fetchData();
    } catch (err) {
      console.error("Falha ao remover receita:", err);
      alert("Nao foi possivel excluir a receita.");
    }
  };

  const handlePrevMonth = () =>
    setCurrentDate(
      (prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1),
    );

  const handleNextMonth = () =>
    setCurrentDate(
      (prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1),
    );

  const totalExpenses = summary.reduce((acc, day) => acc + day.total, 0);
  const totalRevenue = incomes.reduce((acc, inc) => acc + inc.amount, 0);
  const balance = totalRevenue - totalExpenses;

  const currentMonthLabel = useMemo(
    () =>
      currentDate.toLocaleDateString("pt-BR", {
        month: "long",
        year: "numeric",
      }),
    [currentDate],
  );

  const chartGradient = useMemo(
    () => ({
      id: "cashflow",
      from: "var(--color-primary)",
      to: "rgba(242,139,91,0)",
    }),
    [],
  );

  const cashflowData = useMemo(
    () =>
      summary
        .slice()
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
        .map((item) => ({
          day: formatDisplayDate(String(item.date), { weekday: "short" }),
          value: item.total,
        })),
    [summary],
  );

  const expensesByCategory = useMemo(() => {
    const map = new Map<string, number>();
    expenses.forEach((exp) => {
      const val = Math.abs(exp.amount);
      const cat = exp.category || "Outros";
      map.set(cat, (map.get(cat) || 0) + val);
    });
    return Array.from(map.entries())
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  }, [expenses]);

  const summaryCards = useMemo(
    () => [
      {
        title: "Saldo Atual",
        helper: "Disponivel hoje",
        value: balance.toLocaleString("pt-BR", {
          style: "currency",
          currency: "BRL",
        }),
        trend: balance >= 0 ? "Positivo" : "Atencao",
        trendIcon:
          balance >= 0 ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />,
        icon: Wallet,
        tone: balance >= 0 ? "success" : "danger",
      },
      {
        title: "Metas Ativas",
        helper: "Economia em progresso",
        value: "3 metas",
        trend: "Aguardando review",
        trendIcon: <Target size={14} />,
        icon: Target,
        tone: "info",
      },
      {
        title: "Gastos do Mes",
        helper: "Despesas totais",
        value: totalExpenses.toLocaleString("pt-BR", {
          style: "currency",
          currency: "BRL",
        }),
        trend: "Monitorando",
        trendIcon: <TrendingDown size={14} />,
        icon: TrendingDown,
        tone: "danger",
      },
    ],
    [balance, totalExpenses],
  );

  if (isLoading) {
    return (
      <div className="space-y-6 animate-pulse">
        <header className="mb-6 flex justify-between items-center">
          <div className="space-y-3">
            <div className="h-4 w-32 rounded bg-surface-3"></div>
            <div className="h-8 w-56 rounded bg-surface-3"></div>
          </div>
          <div className="hidden h-10 w-48 rounded-full bg-surface-3 sm:block"></div>
        </header>

        <section className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-[140px] rounded-3xl border border-border/40 bg-surface/50 p-5 flex flex-col justify-between"
            >
              <div className="flex justify-between">
                <div>
                  <div className="mb-1.5 h-4 w-24 rounded bg-surface-3"></div>
                  <div className="h-2 w-16 rounded bg-surface-3"></div>
                </div>
                <div className="h-10 w-10 rounded-full bg-surface-3"></div>
              </div>
              <div>
                <div className="mb-2 h-7 w-32 rounded bg-surface-3"></div>
                <div className="h-3 w-16 rounded bg-surface-3"></div>
              </div>
            </div>
          ))}
        </section>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="max-w-md rounded-xl border border-danger/30 bg-surface-2 p-8">
          <p className="text-center font-medium text-danger">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20 sm:pb-0">
      <div className="fixed bottom-[calc(5.5rem+env(safe-area-inset-bottom))] right-4 z-40 flex flex-col items-end gap-3 sm:hidden">
        {isFabOpen && (
          <div className="mb-2 flex flex-col items-end gap-3 animate-in slide-in-from-bottom-5 fade-in duration-200">
            <button
              onClick={() => {
                setIncomeToEdit(null);
                setIsAddIncomeModalOpen(true);
                setIsFabOpen(false);
              }}
              className="flex items-center gap-2 rounded-full bg-success px-5 py-3 text-sm font-semibold text-white shadow-lg"
            >
              Nova Receita <ArrowUpRight size={18} />
            </button>
            <button
              onClick={() => {
                setExpenseToEdit(null);
                setIsAddExpenseModalOpen(true);
                setIsFabOpen(false);
              }}
              className="flex items-center gap-2 rounded-full bg-danger-strong px-5 py-3 text-sm font-semibold text-white shadow-lg"
            >
              Nova Despesa <ArrowDownRight size={18} />
            </button>
          </div>
        )}
        <button
          onClick={() => setIsFabOpen(!isFabOpen)}
          className={clsx(
            "flex h-14 w-14 items-center justify-center rounded-full shadow-[0_8px_30px_rgb(var(--shadow-color)/0.3)] transition-transform",
            isFabOpen ? "rotate-45 bg-surface-3 text-foreground" : "bg-primary text-white",
          )}
        >
          <Plus size={26} />
        </button>
      </div>

      <header className="flex flex-col gap-3">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="hidden sm:block">
            <p className="text-sm text-foreground-muted">Bem-vindo de volta</p>
            <h1 className="text-3xl font-semibold text-foreground">
              Seu painel financeiro
            </h1>
          </div>

          <div className="flex w-full items-center justify-center gap-2 rounded-full border border-border bg-surface-2 px-4 py-2 shadow-sm sm:w-auto">
            <button
              onClick={handlePrevMonth}
              className="rounded-full p-1 text-foreground-muted transition hover:bg-surface-3 hover:text-foreground"
            >
              <ChevronLeft size={18} />
            </button>
            <div className="flex min-w-[170px] items-center justify-center gap-2 text-center">
              <Calendar size={16} className="text-primary" />
              <span className="text-sm font-semibold capitalize text-foreground">
                {currentMonthLabel}
              </span>
            </div>
            <button
              onClick={handleNextMonth}
              className="rounded-full p-1 text-foreground-muted transition hover:bg-surface-3 hover:text-foreground"
            >
              <ChevronRight size={18} />
            </button>
          </div>

          <div className="hidden items-center gap-3 sm:flex">
            <button
              onClick={() => {
                setIncomeToEdit(null);
                setIsAddIncomeModalOpen(true);
              }}
              className="inline-flex items-center gap-2 rounded-full border border-success/40 bg-success/10 px-4 py-2 text-sm font-semibold text-success transition soft-hover-sm hover:bg-success hover:text-white"
            >
              <Plus size={16} />
              Nova receita
            </button>
            <button
              onClick={() => {
                setExpenseToEdit(null);
                setIsAddExpenseModalOpen(true);
              }}
              className="inline-flex items-center gap-2 rounded-full border border-border bg-surface/80 px-4 py-2 text-sm font-semibold text-foreground transition soft-hover-sm hover:border-surface-3 hover:bg-surface-2"
            >
              <Plus size={16} />
              Nova despesa
            </button>
          </div>
        </div>
      </header>

      <section className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {summaryCards.map((card, index) => {
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
              style={{ animationDelay: `${index * 100}ms` }}
              className="rounded-3xl border border-border/70 bg-gradient-to-br from-surface/95 via-surface/90 to-surface-2/75 p-5 shadow-[0_14px_30px_rgba(60,42,32,0.10)] soft-hover animate-fade-in opacity-0 [animation-fill-mode:forwards]"
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
                    "grid h-10 w-10 place-items-center rounded-full bg-surface-2 shadow-sm",
                    toneClass,
                  )}
                >
                  <Icon size={18} />
                </div>
              </div>
              <div className="mt-4 font-mono text-2xl font-semibold tracking-tight text-foreground tabular-nums">
                {card.value}
              </div>
              <div className={clsx("mt-2 flex items-center gap-1 text-xs font-medium", toneClass)}>
                {card.trendIcon} {card.trend}
              </div>
            </div>
          );
        })}
      </section>

      <section className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <div className="rounded-3xl border border-border/70 bg-surface/92 p-6 shadow-[0_14px_30px_rgba(60,42,32,0.10)] soft-hover xl:col-span-2">
          <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-lg font-semibold text-foreground">
                Fluxo de Caixa Mensal
              </h2>
              <p className="text-xs text-foreground-subtle">
                Evolucao diaria de gastos vs receitas
              </p>
            </div>
            <div className="flex items-center gap-2 text-[11px] font-mono text-foreground-subtle tabular-nums">
              <span className="rounded-full bg-success/10 px-3 py-1 font-medium text-success">
                Receita:{" "}
                {totalRevenue.toLocaleString("pt-BR", {
                  style: "currency",
                  currency: "BRL",
                })}
              </span>
              <span className="rounded-full bg-danger/10 px-3 py-1 font-medium text-danger">
                Despesa:{" "}
                {totalExpenses.toLocaleString("pt-BR", {
                  style: "currency",
                  currency: "BRL",
                })}
              </span>
            </div>
          </div>
          <div className="h-[280px]">
            {cashflowData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={cashflowData}>
                  <defs>
                    <linearGradient id={chartGradient.id} x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={chartGradient.from} stopOpacity={0.35} />
                      <stop offset="100%" stopColor={chartGradient.to} stopOpacity={0} />
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
                    tick={{ fill: "var(--chart-muted)", fontSize: 12 }}
                    dy={10}
                  />
                  <YAxis
                    tickFormatter={(value) => `R$ ${value}`}
                    tickLine={false}
                    axisLine={false}
                    tick={{ fill: "var(--chart-muted)", fontSize: 12 }}
                    dx={-10}
                  />
                  <Tooltip
                    contentStyle={{
                      background: "var(--color-surface)",
                      border: "1px solid var(--color-border)",
                      color: "var(--color-text)",
                      borderRadius: "16px",
                      fontFamily: "var(--font-mono, monospace)",
                    }}
                    itemStyle={{
                      fontFamily: "var(--font-mono, monospace)",
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="value"
                    stroke="var(--color-primary)"
                    strokeWidth={3}
                    dot={{
                      r: 4,
                      strokeWidth: 2,
                      fill: "var(--color-surface)",
                      stroke: "var(--color-primary)",
                    }}
                    activeDot={{
                      r: 6,
                      fill: "var(--color-primary)",
                      stroke: "var(--color-surface)",
                      strokeWidth: 2,
                    }}
                    fill={`url(#${chartGradient.id})`}
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-full flex-col items-center justify-center text-foreground-subtle">
                <TrendingDown size={40} className="mb-3 opacity-20" />
                <p className="text-sm font-medium">
                  Nenhum dado financeiro para o periodo.
                </p>
              </div>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-3xl border border-border/70 bg-surface/92 p-6 shadow-[0_14px_30px_rgba(60,42,32,0.10)] soft-hover">
            <h2 className="mb-4 text-lg font-semibold text-foreground">
              Despesas por Categoria
            </h2>
            {expensesByCategory.length > 0 ? (
              <div className="h-[200px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={expensesByCategory}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                      stroke="none"
                    >
                      {expensesByCategory.map((_, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={CHART_COLORS[index % CHART_COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(value: number) =>
                        value.toLocaleString("pt-BR", {
                          style: "currency",
                          currency: "BRL",
                        })
                      }
                      contentStyle={{
                        borderRadius: "12px",
                        border: "1px solid var(--color-border)",
                        background: "var(--color-surface)",
                        color: "var(--color-text)",
                        fontFamily: "var(--font-mono, monospace)",
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="flex h-[200px] flex-col items-center justify-center text-foreground-subtle">
                <PieChartIcon size={40} className="mb-3 opacity-20" />
                <p className="text-sm font-medium">Nenhuma despesa para exibir</p>
              </div>
            )}
          </div>

          <div className="rounded-3xl border border-border/70 bg-surface/92 p-6 shadow-[0_14px_30px_rgba(60,42,32,0.10)] soft-hover">
            <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-foreground">
              <Target size={20} className="text-info" />
              Alertas de Metas
            </h2>
            <div className="space-y-4">
              {alerts.length > 0 ? (
                alerts.slice(0, 3).map((alert, index) => {
                  const percent = Math.min(
                    (alert.spent / alert.monthlyLimit) * 100,
                    100,
                  );
                  const isCritical = alert.thresholdReached || percent >= 90;

                  return (
                    <div
                      key={alert.goalId || index}
                      className="rounded-2xl border border-border bg-surface-2 p-4 soft-hover-sm hover:bg-surface-3/60"
                    >
                      <div className="flex items-center justify-between text-sm">
                        <span className="font-medium text-foreground">
                          {alert.category || "Geral"}
                        </span>
                        <span
                          className={clsx(
                            "font-mono font-bold tracking-tight",
                            isCritical ? "text-danger" : "text-primary",
                          )}
                        >
                          {percent.toFixed(0)}%
                        </span>
                      </div>
                      <div className="mt-1 mb-2 flex justify-between font-mono text-xs text-foreground-subtle tabular-nums">
                        <span>Gasto: R$ {alert.spent}</span>
                        <span>Limite: R$ {alert.monthlyLimit}</span>
                      </div>
                      <div className="h-2 rounded-full bg-surface-3">
                        <div
                          className={clsx(
                            "h-2 rounded-full",
                            isCritical ? "bg-danger" : "bg-primary",
                          )}
                          style={{ width: `${percent}%` }}
                        />
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="flex flex-col items-center justify-center py-4 text-foreground-subtle">
                  <Target size={32} className="mb-2 opacity-20" />
                  <p className="text-center text-sm font-medium">
                    Dentro dos limites.
                    <br />
                    Tudo sob controle!
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      <section className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <div className="rounded-3xl border border-border/70 bg-surface/92 p-6 shadow-[0_14px_30px_rgba(60,42,32,0.10)] soft-hover flex flex-col">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-foreground">
              Ultimas receitas
            </h2>
          </div>
          <div className="space-y-3 flex-1 flex flex-col">
            {incomes.length > 0 ? (
              incomes.slice(0, 5).map((inc) => {
                const amountLabel = inc.amount.toLocaleString("pt-BR", {
                  style: "currency",
                  currency: "BRL",
                });

                return (
                  <div
                    key={inc.id}
                    className="group flex items-center gap-4 rounded-2xl border border-border bg-surface-2 p-3.5 soft-hover-sm hover:bg-surface-3/30 transition-colors"
                  >
                    <div className="grid h-11 w-11 flex-shrink-0 place-items-center rounded-full bg-success/10 text-success shadow-sm">
                      <Wallet size={18} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-foreground">
                        {inc.description}
                      </p>
                      <p className="mt-0.5 text-xs text-foreground-subtle">
                        {inc.isFixed ? "Renda Fixa" : "Renda Extra"} •{" "}
                        {formatDisplayDate(inc.date, {
                          day: "2-digit",
                          month: "short",
                        })}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="font-mono text-sm font-semibold tracking-tight text-success tabular-nums">
                        + {amountLabel}
                      </div>
                      <button
                        onClick={() => {
                          setIncomeToEdit(inc);
                          setIsAddIncomeModalOpen(true);
                        }}
                        className="rounded-lg p-1.5 text-foreground-muted transition-colors hover:bg-primary/10 hover:text-primary"
                        title="Editar receita"
                      >
                        <Pencil size={15} />
                      </button>
                      <button
                        onClick={() => handleDeleteIncome(inc.id)}
                        className="rounded-lg p-1.5 text-foreground-muted transition-colors hover:bg-danger/10 hover:text-danger"
                        title="Excluir receita"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="flex flex-1 flex-col items-center justify-center py-6 text-foreground-subtle">
                <HandCoins size={40} className="mb-3 opacity-20" />
                <p className="text-sm font-medium">Nenhuma receita registrada.</p>
              </div>
            )}
          </div>
        </div>

        <div className="rounded-3xl border border-border/70 bg-surface/92 p-6 shadow-[0_14px_30px_rgba(60,42,32,0.10)] soft-hover flex flex-col">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-foreground">
              Ultimas despesas
            </h2>
          </div>
          <div className="space-y-3 flex-1 flex flex-col">
            {expenses.length > 0 ? (
              expenses.slice(0, 5).map((exp) => {
                const Icon = categoryIcons[exp.category] || PiggyBank;
                const amountLabel = Math.abs(exp.amount).toLocaleString("pt-BR", {
                  style: "currency",
                  currency: "BRL",
                });

                return (
                  <div
                    key={exp.id}
                    className="group flex items-center gap-4 rounded-2xl border border-border bg-surface-2 p-3.5 soft-hover-sm hover:bg-surface-3/30 transition-colors"
                  >
                    <div className="grid h-11 w-11 flex-shrink-0 place-items-center rounded-full bg-surface-3 text-primary shadow-sm">
                      <Icon size={18} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-foreground transition-colors group-hover:text-primary">
                        {exp.description}
                      </p>
                      <p className="mt-0.5 text-xs text-foreground-subtle">
                        {exp.category}
                        {exp.subcategory ? ` / ${exp.subcategory}` : ""} •{" "}
                        {formatDisplayDate(exp.date, {
                          day: "2-digit",
                          month: "short",
                        })}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="font-mono text-sm font-semibold tracking-tight text-danger tabular-nums">
                        - {amountLabel}
                      </div>
                      <button
                        onClick={() => {
                          setExpenseToEdit(exp);
                          setIsAddExpenseModalOpen(true);
                        }}
                        className="rounded-lg p-1.5 text-foreground-muted transition-colors hover:bg-primary/10 hover:text-primary"
                        title="Editar despesa"
                      >
                        <Pencil size={15} />
                      </button>
                      <button
                        onClick={() => handleDeleteExpense(exp.id)}
                        className="rounded-lg p-1.5 text-foreground-muted transition-colors hover:bg-danger/10 hover:text-danger"
                        title="Excluir despesa"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="flex flex-1 flex-col items-center justify-center py-6 text-foreground-subtle">
                <Receipt size={40} className="mb-3 opacity-20" />
                <p className="text-sm font-medium">Nenhuma despesa registrada.</p>
              </div>
            )}
          </div>
        </div>
      </section>

      <AddExpenseModal
        isOpen={isAddExpenseModalOpen}
        onClose={() => {
          setIsAddExpenseModalOpen(false);
          setExpenseToEdit(null);
        }}
        onSuccess={fetchData}
        expenseToEdit={expenseToEdit}
      />
      <AddIncomeModal
        isOpen={isAddIncomeModalOpen}
        onClose={() => {
          setIsAddIncomeModalOpen(false);
          setIncomeToEdit(null);
        }}
        onSuccess={fetchData}
        incomeToEdit={incomeToEdit}
      />
    </div>
  );
}
