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
  Laptop,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Calendar,
  ShoppingCart,
} from "lucide-react";
import clsx from "clsx";
import { getExpenses, getDailySummary, deleteExpense } from "../services/expenseService";
import { getIncomes } from "../services/incomeService";
import { getGoalAlerts } from "../services/goalService";
import { type Expense, type DailySummary, type Income, type GoalAlert } from "../lib/types";
import { AddExpenseModal } from "../components/AddExpenseModal";
import { AddIncomeModal } from "../components/AddIncomeModal";

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
  const [incomes, setIncomes] = useState<Income[]>([]);
  const [summary, setSummary] = useState<DailySummary[]>([]);
  const [alerts, setAlerts] = useState<GoalAlert[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAddExpenseModalOpen, setIsAddExpenseModalOpen] = useState(false);
  const [isAddIncomeModalOpen, setIsAddIncomeModalOpen] = useState(false);
  const [currentDate, setCurrentDate] = useState(new Date());

  const fetchData = useCallback(async () => {
    try {
      setError(null);
      const year = currentDate.getFullYear();
      const month = currentDate.getMonth();
      // Usando UTC e o dia exato para evitar conversões de timezone problemáticas no Prisma/EF
      const startDate = new Date(year, month, 1).toISOString();
      const endDate = new Date(year, month + 1, 0, 23, 59, 59).toISOString();

      const [expensesData, summaryData, incomesData, alertsData] = await Promise.all([
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
    if (window.confirm("Deseja apagar esta despesa permanentemente?")) {
      try {
        await deleteExpense(id);
        fetchData();
      } catch (err) {
        console.error("Falha ao remover despesa:", err);
        alert("Não foi possível excluir a despesa.");
      }
    }
  };

  const handlePrevMonth = () => setCurrentDate((prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  const handleNextMonth = () => setCurrentDate((prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));

  const totalExpenses = summary.reduce((acc, day) => acc + day.total, 0);
  const totalRevenue = incomes.reduce((acc, inc) => acc + inc.amount, 0);
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
        trend: balance >= 0 ? "Positivo" : "Negativo",
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
        helper: "Despesas totais",
        value: totalExpenses.toLocaleString("pt-BR", {
          style: "currency",
          currency: "BRL",
        }),
        trend: "Monitorando",
        icon: TrendingDown,
        tone: "danger",
      },
    ],
    [balance, totalExpenses],
  );

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center animate-in fade-in duration-500">
        <div className="text-center flex flex-col items-center gap-4">
          <div className="h-10 w-10 text-primary animate-spin">
            <svg className="h-full w-full" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
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
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <header className="flex flex-col gap-3">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <p className="text-sm text-foreground-muted">Bem-vindo de volta</p>
            <h1 className="text-3xl font-semibold text-foreground">
              Seu painel financeiro
            </h1>
          </div>
          
          <div className="flex items-center gap-2 bg-surface-2 rounded-full px-4 py-2 border border-border shadow-sm">
            <button
              onClick={handlePrevMonth}
              className="p-1 rounded-full hover:bg-surface-3 transition text-foreground-muted hover:text-foreground"
            >
              <ChevronLeft size={18} />
            </button>
            <div className="flex items-center gap-2 min-w-[130px] justify-center">
              <Calendar size={16} className="text-primary" />
              <span className="text-sm font-semibold text-foreground capitalize">
                {currentDate.toLocaleDateString("pt-BR", { month: "long", year: "numeric" })}
              </span>
            </div>
            <button
              onClick={handleNextMonth}
              className="p-1 rounded-full hover:bg-surface-3 transition text-foreground-muted hover:text-foreground"
            >
              <ChevronRight size={18} />
            </button>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsAddIncomeModalOpen(true)}
              className="inline-flex items-center gap-2 rounded-full border border-success/40 bg-success/10 px-4 py-2 text-sm font-semibold text-success hover:bg-success hover:text-white transition"
            >
              <Plus size={16} />
              Nova receita
            </button>
            <button
              onClick={() => setIsAddExpenseModalOpen(true)}
              className="inline-flex items-center gap-2 rounded-full border border-border bg-surface/80 px-4 py-2 text-sm font-semibold text-foreground hover:border-surface-3 hover:bg-surface-2 transition"
            >
              <Plus size={16} />
              Nova despesa
            </button>
          </div>
        </div>
      </header>

      <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
              className="rounded-3xl border border-border/70 bg-gradient-to-br from-surface/90 via-surface/75 to-surface-2/70 backdrop-blur-xl p-5 shadow-[0_18px_40px_rgba(60,42,32,0.12)] hover:-translate-y-1 hover:shadow-xl transition-all duration-300 animate-fade-in opacity-0 [animation-fill-mode:forwards]"
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
                Fluxo de Caixa Mensal
              </h2>
              <p className="text-xs text-foreground-subtle">
                Evolução diária de gastos
              </p>
            </div>
            <div className="flex items-center gap-2 text-[11px] text-foreground-subtle">
              <span className="rounded-full bg-success/10 text-success px-2 py-0.5">
                Receita: {totalRevenue.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
              </span>
              <span className="rounded-full bg-danger/10 text-danger px-2 py-0.5">
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
            <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
               <Target size={20} className="text-info" />
               Alertas de Metas
            </h2>
            <div className="space-y-4">
              {alerts.length > 0 ? (
                alerts.slice(0, 3).map((alert, index) => {
                  const percent = Math.min((alert.spent / alert.monthlyLimit) * 100, 100);
                  const isCritical = alert.thresholdReached || percent >= 90;
                  return (
                    <div
                      key={alert.goalId || index}
                      className="rounded-2xl border border-border bg-surface-2 p-4"
                    >
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-foreground font-medium">
                          {alert.category || "Geral"}
                        </span>
                        <span className={isCritical ? "text-danger font-bold" : "text-primary"}>
                          {percent.toFixed(0)}%
                        </span>
                      </div>
                      <div className="flex justify-between text-xs text-foreground-subtle mt-1 mb-2">
                        <span>Gasto: R$ {alert.spent}</span>
                        <span>Limite: R$ {alert.monthlyLimit}</span>
                      </div>
                      <div className="h-2 rounded-full bg-surface-3">
                        <div
                          className={clsx("h-2 rounded-full", isCritical ? "bg-danger" : "bg-primary")}
                          style={{ width: `${percent}%` }}
                        />
                      </div>
                    </div>
                  );
                })
              ) : (
                <p className="text-sm text-foreground-subtle text-center">
                  Nenhuma meta sob alerta agora. Tudo sob controle!
                </p>
              )}
            </div>
          </div>
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
              Últimas receitas
            </h2>
            <div className="space-y-3">
              {incomes.length > 0 ? (
                incomes.slice(0, 5).map((inc) => {
                  const amountValue = inc.amount;
                  const amountLabel = amountValue.toLocaleString("pt-BR", {
                    style: "currency",
                    currency: "BRL",
                  });
                  return (
                    <div
                      key={inc.id}
                      className="flex items-center gap-3 rounded-2xl border border-border bg-surface-2 p-3"
                    >
                      <div className="h-10 w-10 rounded-full bg-success/10 text-success grid place-items-center">
                        <Wallet size={16} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-foreground truncate">
                          {inc.description}
                        </p>
                        <p className="text-xs text-foreground-subtle">
                          {inc.isFixed ? "Renda Fixa" : "Renda Extra"} •{" "}
                          {new Date(inc.date).toLocaleDateString("pt-BR", {
                            day: "2-digit",
                            month: "short",
                          })}
                        </p>
                      </div>
                      <div className="text-sm font-semibold text-success">
                        + {amountLabel}
                      </div>
                    </div>
                  );
                })
              ) : (
                <p className="text-sm text-foreground-subtle text-center">
                  Nenhuma receita encontrada.
                </p>
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
                          {exp.category}
                          {exp.subcategory ? ` / ${exp.subcategory}` : ""} •{" "}
                          {new Date(exp.date).toLocaleDateString("pt-BR", {
                            day: "2-digit",
                            month: "short",
                          })}
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="text-sm font-semibold text-danger">
                          - {amountLabel}
                        </div>
                        <button
                          onClick={() => handleDeleteExpense(exp.id)}
                          className="p-1.5 rounded-lg text-foreground-muted hover:text-danger hover:bg-danger/10 transition-colors"
                          title="Excluir despesa"
                        >
                          <Trash2 size={15} />
                        </button>
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
      <AddIncomeModal
        isOpen={isAddIncomeModalOpen}
        onClose={() => setIsAddIncomeModalOpen(false)}
        onSuccess={fetchData}
      />
    </div>
  );
}
