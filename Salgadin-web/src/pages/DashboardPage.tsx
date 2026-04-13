import { useEffect, useState, useCallback, useMemo } from "react";
import {
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
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
  ArrowUpRight,
  ArrowDownRight,
  Receipt,
  HandCoins,
  PieChart as PieChartIcon
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
  "Alimentação": Pizza,
  Transporte: Bus,
  Compras: ShoppingCart,
  Educacao: Laptop,
  "Educação": Laptop,
};

const CHART_COLORS = [
  "var(--color-primary)",
  "var(--color-accent)",
  "var(--color-warning)",
  "var(--color-danger)",
  "var(--color-success)",
  "var(--color-primary-strong)"
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
  const [isFabOpen, setIsFabOpen] = useState(false);
  const [currentDate, setCurrentDate] = useState(new Date());

  const fetchData = useCallback(async () => {
    try {
      setError(null);
      const year = currentDate.getFullYear();
      const month = currentDate.getMonth();
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

  const expensesByCategory = useMemo(() => {
    const map = new Map<string, number>();
    expenses.forEach(exp => {
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
        trend: balance >= 0 ? "Positivo" : "Atenção",
        trendIcon: balance >= 0 ? <ArrowUpRight size={14}/> : <ArrowDownRight size={14}/>,
        icon: Wallet,
        tone: balance >= 0 ? "success" : "danger",
      },
      {
        title: "Metas Ativas",
        helper: "Economia em progresso",
        value: "3 metas",
        trend: "Aguardando review",
        trendIcon: <Target size={14}/>,
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
        trendIcon: <TrendingDown size={14}/>,
        icon: TrendingDown,
        tone: "danger",
      },
    ],
    [balance, totalExpenses],
  );

  if (isLoading) {
    return (
      <div className="space-y-6 animate-pulse">
        <header className="flex justify-between items-center mb-6">
          <div className="space-y-3">
            <div className="h-4 w-32 bg-surface-3 rounded"></div>
            <div className="h-8 w-56 bg-surface-3 rounded"></div>
          </div>
          <div className="hidden sm:block h-10 w-48 bg-surface-3 rounded-full"></div>
        </header>

        <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[1,2,3].map(i => (
            <div key={i} className="rounded-3xl border border-border/40 bg-surface/50 p-5 h-[140px] flex flex-col justify-between">
               <div className="flex justify-between">
                 <div>
                   <div className="h-4 w-24 bg-surface-3 rounded mb-1.5"></div>
                   <div className="h-2 w-16 bg-surface-3 rounded"></div>
                 </div>
                 <div className="h-10 w-10 bg-surface-3 rounded-full"></div>
               </div>
               <div>
                 <div className="h-7 w-32 bg-surface-3 rounded mb-2"></div>
                 <div className="h-3 w-16 bg-surface-3 rounded"></div>
               </div>
            </div>
          ))}
        </section>
        
        <section className="grid grid-cols-1 xl:grid-cols-3 gap-6">
           <div className="xl:col-span-2 rounded-3xl border border-border/40 bg-surface/50 p-6 h-[350px]"></div>
           <div className="space-y-6">
             <div className="rounded-3xl border border-border/40 bg-surface/50 p-6 h-[200px]"></div>
             <div className="rounded-3xl border border-border/40 bg-surface/50 p-6 h-[250px]"></div>
           </div>
        </section>
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
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20 sm:pb-0">
      {/* Mobile FAB */}
      <div className="fixed bottom-6 right-6 sm:hidden z-40 flex flex-col items-end gap-3">
        {isFabOpen && (
           <div className="flex flex-col gap-3 items-end mb-2 animate-in slide-in-from-bottom-5 fade-in duration-200">
             <button onClick={() => { setIsAddIncomeModalOpen(true); setIsFabOpen(false); }} className="flex items-center gap-2 bg-success text-white px-5 py-3 rounded-full shadow-lg font-semibold text-sm">
               Nova Receita <ArrowUpRight size={18} />
             </button>
             <button onClick={() => { setIsAddExpenseModalOpen(true); setIsFabOpen(false); }} className="flex items-center gap-2 bg-danger-strong text-white px-5 py-3 rounded-full shadow-lg font-semibold text-sm">
               Nova Despesa <ArrowDownRight size={18} />
             </button>
           </div>
        )}
        <button
          onClick={() => setIsFabOpen(!isFabOpen)}
          className={clsx(
            "h-14 w-14 rounded-full shadow-[0_8px_30px_rgb(var(--shadow-color)/0.3)] flex items-center justify-center transition-transform",
            isFabOpen ? "bg-surface-3 text-foreground rotate-45" : "bg-primary text-white"
          )}
        >
          <Plus size={26} />
        </button>
      </div>

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

          <div className="hidden sm:flex items-center gap-3">
            <button
              onClick={() => setIsAddIncomeModalOpen(true)}
              className="inline-flex items-center gap-2 rounded-full border border-success/40 bg-success/10 px-4 py-2 text-sm font-semibold text-success hover:bg-success hover:text-white transition soft-hover-sm"
            >
              <Plus size={16} />
              Nova receita
            </button>
            <button
              onClick={() => setIsAddExpenseModalOpen(true)}
              className="inline-flex items-center gap-2 rounded-full border border-border bg-surface/80 px-4 py-2 text-sm font-semibold text-foreground hover:border-surface-3 hover:bg-surface-2 transition soft-hover-sm"
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
              className="rounded-3xl border border-border/70 bg-gradient-to-br from-surface/90 via-surface/75 to-surface-2/70 backdrop-blur-xl p-5 shadow-[0_18px_40px_rgba(60,42,32,0.12)] soft-hover animate-fade-in opacity-0 [animation-fill-mode:forwards]"
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
              <div className="mt-4 text-2xl font-semibold text-foreground font-mono tabular-nums tracking-tight">
                {card.value}
              </div>
              <div className={clsx("mt-2 text-xs flex items-center gap-1 font-medium", toneClass)}>
                {card.trendIcon} {card.trend}
              </div>
            </div>
          );
        })}
      </section>

      <section className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 rounded-3xl border border-border/70 bg-surface/75 backdrop-blur-xl p-6 shadow-[0_18px_40px_rgba(60,42,32,0.12)] soft-hover">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
            <div>
              <h2 className="text-lg font-semibold text-foreground">
                Fluxo de Caixa Mensal
              </h2>
              <p className="text-xs text-foreground-subtle">
                Evolução diária de gastos vs receitas
              </p>
            </div>
            <div className="flex items-center gap-2 text-[11px] text-foreground-subtle font-mono tabular-nums">
              <span className="rounded-full bg-success/10 text-success px-3 py-1 font-medium">
                Receita: {totalRevenue.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
              </span>
              <span className="rounded-full bg-danger/10 text-danger px-3 py-1 font-medium">
                Despesa: {totalExpenses.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
              </span>
            </div>
          </div>
          <div className="h-[280px]">
            {cashflowData.length > 0 ? (
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
                      fontFamily: "var(--font-mono, monospace)"
                    }}
                    itemStyle={{
                      fontFamily: "var(--font-mono, monospace)"
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="value"
                    stroke="var(--color-primary)"
                    strokeWidth={3}
                    dot={{ r: 4, strokeWidth: 2, fill: "var(--color-surface)", stroke: "var(--color-primary)" }}
                    activeDot={{ r: 6, fill: "var(--color-primary)", stroke: "var(--color-surface)", strokeWidth: 2 }}
                    fill={`url(#${chartGradient.id})`}
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
               <div className="h-full flex flex-col items-center justify-center text-foreground-subtle">
                 <TrendingDown size={40} className="mb-3 opacity-20" />
                 <p className="text-sm font-medium">Nenhum dado financeiro para o período.</p>
               </div>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-3xl border border-border/70 bg-surface/75 backdrop-blur-xl p-6 shadow-[0_18px_40px_rgba(60,42,32,0.12)] soft-hover">
            <h2 className="text-lg font-semibold text-foreground mb-4">Despesas por Categoria</h2>
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
                        <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(value: number) => value.toLocaleString('pt-BR', {style: 'currency', currency: 'BRL'})}
                      contentStyle={{ borderRadius: "12px", border: "1px solid var(--color-border)", background: "var(--color-surface)", color: "var(--color-text)", fontFamily: "var(--font-mono, monospace)" }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-[200px] flex flex-col items-center justify-center text-foreground-subtle">
                <PieChartIcon size={40} className="mb-3 opacity-20"/>
                <p className="text-sm font-medium">Nenhuma despesa para exibir</p>
              </div>
            )}
          </div>

          <div className="rounded-3xl border border-border/70 bg-surface/75 backdrop-blur-xl p-6 shadow-[0_18px_40px_rgba(60,42,32,0.12)] soft-hover">
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
                      className="rounded-2xl border border-border bg-surface-2 p-4 soft-hover-sm hover:bg-surface-3/60"
                    >
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-foreground font-medium">
                          {alert.category || "Geral"}
                        </span>
                        <span className={clsx("font-mono font-bold tracking-tight", isCritical ? "text-danger" : "text-primary")}>
                          {percent.toFixed(0)}%
                        </span>
                      </div>
                      <div className="flex justify-between text-xs text-foreground-subtle mt-1 mb-2 font-mono tabular-nums">
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
                <div className="flex flex-col items-center justify-center py-4 text-foreground-subtle">
                  <Target size={32} className="mb-2 opacity-20" />
                  <p className="text-sm font-medium text-center">
                     Dentro dos limites.<br/>Tudo sob controle!
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      <section className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <div className="rounded-3xl border border-border/70 bg-surface/75 backdrop-blur-xl p-6 shadow-[0_18px_40px_rgba(60,42,32,0.12)] soft-hover flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-foreground">
              Ultimas receitas
            </h2>
            <button className="text-sm font-medium text-primary hover:text-primary-strong transition">
              Ver todas
            </button>
          </div>
          <div className="space-y-3 flex-1 flex flex-col">
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
                    className="flex items-center gap-4 rounded-2xl border border-border bg-surface-2 p-3.5 soft-hover-sm hover:bg-surface-3/30 transition-colors"
                  >
                    <div className="h-11 w-11 rounded-full bg-success/10 text-success flex-shrink-0 grid place-items-center shadow-sm">
                      <Wallet size={18} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-foreground truncate">
                        {inc.description}
                      </p>
                      <p className="text-xs text-foreground-subtle mt-0.5">
                        {inc.isFixed ? "Renda Fixa" : "Renda Extra"} •{" "}
                        {new Date(inc.date).toLocaleDateString("pt-BR", {
                          day: "2-digit",
                          month: "short",
                        })}
                      </p>
                    </div>
                    <div className="text-sm font-semibold text-success font-mono tabular-nums tracking-tight">
                      + {amountLabel}
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center py-6 text-foreground-subtle">
                <HandCoins size={40} className="mb-3 opacity-20" />
                <p className="text-sm font-medium">Nenhuma receita registrada.</p>
              </div>
            )}
          </div>
        </div>

        <div className="rounded-3xl border border-border/70 bg-surface/75 backdrop-blur-xl p-6 shadow-[0_18px_40px_rgba(60,42,32,0.12)] soft-hover flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-foreground">
              Ultimas despesas
            </h2>
            <button className="text-sm font-medium text-primary hover:text-primary-strong transition">
              Ver todas
            </button>
          </div>
          <div className="space-y-3 flex-1 flex flex-col">
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
                    className="flex items-center gap-4 rounded-2xl border border-border bg-surface-2 p-3.5 soft-hover-sm hover:bg-surface-3/30 transition-colors group"
                  >
                    <div className="h-11 w-11 rounded-full bg-surface-3 text-primary flex-shrink-0 grid place-items-center shadow-sm">
                      <Icon size={18} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-foreground truncate group-hover:text-primary transition-colors">
                        {exp.description}
                      </p>
                      <p className="text-xs text-foreground-subtle mt-0.5">
                        {exp.category}
                        {exp.subcategory ? ` / ${exp.subcategory}` : ""} •{" "}
                        {new Date(exp.date).toLocaleDateString("pt-BR", {
                          day: "2-digit",
                          month: "short",
                        })}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-sm font-semibold text-danger font-mono tabular-nums tracking-tight">
                        - {amountLabel}
                      </div>
                      <button
                        onClick={() => handleDeleteExpense(exp.id)}
                        className="p-1.5 rounded-lg text-foreground-muted hover:text-danger hover:bg-danger/10 transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100"
                        title="Excluir despesa"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center py-6 text-foreground-subtle">
                <Receipt size={40} className="mb-3 opacity-20" />
                <p className="text-sm font-medium">Nenhuma despesa registrada.</p>
              </div>
            )}
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
