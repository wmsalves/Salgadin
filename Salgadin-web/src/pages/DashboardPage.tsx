import { useEffect, useState, useCallback } from "react";
import { useAuth } from "../hooks/useAuth";
import { getExpenses, getDailySummary } from "../services/expenseService";
import { type Expense, type DailySummary } from "../lib/types";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { useTheme } from "../hooks/useTheme";

function adjustHex(hex: string, amount: number) {
  const h = hex.replace("#", "");
  const num = parseInt(h, 16);
  let r = (num >> 16) + amount;
  let g = ((num >> 8) & 0x00ff) + amount;
  let b = (num & 0x0000ff) + amount;
  r = Math.max(Math.min(255, r), 0);
  g = Math.max(Math.min(255, g), 0);
  b = Math.max(Math.min(255, b), 0);
  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, "0")}`;
}
import {
  ArrowUpRight,
  ArrowDownLeft,
  LogOut,
  Pizza,
  Bus,
  ShoppingCart,
  Laptop,
  PiggyBank,
  Plus,
  type LucideProps,
} from "lucide-react";
import { AddExpenseModal } from "../components/AddExpenseModal";

const categoryIcons: Record<string, React.ComponentType<LucideProps>> = {
  Alimentação: Pizza,
  Transporte: Bus,
  Compras: ShoppingCart,
  Educação: Laptop,
};

export default function DashboardPage() {
  const { user, logout } = useAuth();
  const { theme } = useTheme();
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
        "Não foi possível carregar seus dados financeiros. Tente novamente mais tarde."
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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-white via-slate-50 to-slate-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block mb-4">
            <div className="animate-spin">
              <div className="h-12 w-12 border-4 border-emerald-200 border-t-emerald-500 rounded-full"></div>
            </div>
          </div>
          <p className="text-slate-600 dark:text-slate-400 font-medium">
            Carregando seu dashboard...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-white via-slate-50 to-slate-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-900 flex items-center justify-center">
        <div className="p-8 rounded-xl bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 max-w-md">
          <p className="text-red-700 dark:text-red-400 font-medium text-center">
            {error}
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-white via-slate-50 to-slate-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-900 overflow-y-scroll">
        <header className="sticky top-0 z-40 bg-white border-b border-slate-200 dark:bg-slate-900 dark:border-slate-700 shadow-sm">
          <div className="mx-auto max-w-7xl px-4 py-4 flex justify-between items-center">
            <h1 className="text-2xl font-bold bg-gradient-to-r from-amber-500 to-emerald-500 bg-clip-text text-transparent">
              Meu Dashboard
            </h1>
            <div className="flex items-center gap-4">
              {/* Botão para abrir o modal */}
              <button
                onClick={() => setIsAddExpenseModalOpen(true)}
                className="flex items-center gap-2 bg-gradient-to-r from-amber-500 to-emerald-500 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:shadow-lg transition-all active:scale-95"
              >
                <Plus size={16} />
                <span className="hidden sm:inline">Adicionar Despesa</span>
              </button>
              <div className="flex items-center gap-3">
                <span className="text-sm font-medium text-slate-700 dark:text-slate-300 hidden sm:inline">
                  {user?.name}
                </span>
                <button
                  onClick={logout}
                  className="p-2 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                  title="Sair"
                >
                  <LogOut size={18} />
                </button>
              </div>
            </div>
          </div>
        </header>

        <main className="mx-auto max-w-7xl p-4 sm:p-6 lg:p-8">
          {/* Cards de Resumo */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center text-sm font-semibold text-emerald-600 dark:text-emerald-400 mb-2">
                <ArrowUpRight size={16} className="mr-2" />
                Receita do Mês
              </div>
              <p className="font-bold text-3xl text-emerald-600">
                {totalRevenue.toLocaleString("pt-BR", {
                  style: "currency",
                  currency: "BRL",
                })}
              </p>
            </div>
            <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center text-sm font-semibold text-red-600 dark:text-red-400 mb-2">
                <ArrowDownLeft size={16} className="mr-2" />
                Despesas do Mês
              </div>
              <p className="font-bold text-3xl text-red-600">
                {totalExpenses.toLocaleString("pt-BR", {
                  style: "currency",
                  currency: "BRL",
                })}
              </p>
            </div>
            <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-6 shadow-sm hover:shadow-md transition-shadow">
              <p className="text-sm font-semibold text-slate-600 dark:text-slate-400 mb-2">
                Balanço
              </p>
              <p
                className={`font-bold text-3xl ${
                  balance >= 0 ? "text-emerald-600" : "text-amber-600"
                }`}
              >
                {balance.toLocaleString("pt-BR", {
                  style: "currency",
                  currency: "BRL",
                })}
              </p>
            </div>
          </div>

          {/* Gráfico e Últimas Despesas */}
          <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Gráfico de Barras */}
            <div className="lg:col-span-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-6 shadow-sm">
              <h3 className="font-bold text-lg text-slate-800 dark:text-white mb-4">
                Gastos Diários
              </h3>
              <ResponsiveContainer width="100%" height={350}>
                <BarChart data={summary}>
                  <XAxis
                    dataKey="date"
                    tickFormatter={(dateStr) =>
                      new Date(dateStr).toLocaleDateString("pt-BR", {
                        day: "2-digit",
                      })
                    }
                    tickLine={false}
                    axisLine={false}
                    fontSize={12}
                    tick={{ fill: "#94a3b8" }}
                  />
                  <YAxis
                    tickFormatter={(value) => `R$${value}`}
                    tickLine={false}
                    axisLine={false}
                    width={50}
                    fontSize={12}
                    tick={{ fill: "#94a3b8" }}
                  />
                  <Tooltip
                    cursor={{
                      fill:
                        theme === "dark"
                          ? "rgba(255,255,255,0.02)"
                          : "rgba(0,0,0,0.05)",
                    }}
                    contentStyle={
                      theme === "dark"
                        ? {
                            borderRadius: "8px",
                            border: "1px solid rgba(255,255,255,0.06)",
                            backgroundColor: "#0f1720",
                            color: "#e6eef8",
                          }
                        : {
                            borderRadius: "8px",
                            border: "1px solid #e2e8f0",
                            backgroundColor: "#ffffff",
                            color: "#1e293b",
                          }
                    }
                    formatter={(value: number) => [
                      value.toLocaleString("pt-BR", {
                        style: "currency",
                        currency: "BRL",
                      }),
                      "Total",
                    ]}
                  />
                  <Bar dataKey="total" name="Total Gasto" radius={[8, 8, 0, 0]}>
                    {summary.map((_entry, index) => {
                      const base = index % 2 === 0 ? "#10b981" : "#f59e0b";
                      const fill =
                        theme === "dark" ? adjustHex(base, 18) : base;
                      return <Cell key={`cell-${index}`} fill={fill} />;
                    })}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Últimas Despesas */}
            <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-6 shadow-sm">
              <h3 className="font-bold text-lg text-slate-800 dark:text-white mb-4">
                Últimas Despesas
              </h3>
              <div className="space-y-3">
                {expenses.length > 0 ? (
                  expenses.slice(0, 5).map((exp) => {
                    const Icon = categoryIcons[exp.category] || PiggyBank;
                    return (
                      <div
                        key={exp.id}
                        className="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                      >
                        <div className="h-10 w-10 bg-gradient-to-br from-amber-100 to-emerald-100 rounded-lg grid place-items-center flex-shrink-0">
                          <Icon size={18} className="text-emerald-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-slate-800 dark:text-slate-100 truncate">
                            {exp.description}
                          </p>
                          <p className="text-xs text-slate-500 dark:text-slate-400">
                            {exp.category}
                          </p>
                        </div>
                        <p className="font-bold text-sm text-emerald-600 whitespace-nowrap">
                          {exp.amount.toLocaleString("pt-BR", {
                            style: "currency",
                            currency: "BRL",
                          })}
                        </p>
                      </div>
                    );
                  })
                ) : (
                  <p className="text-sm text-slate-500 dark:text-slate-400 text-center py-4">
                    Nenhuma despesa encontrada.
                  </p>
                )}
              </div>
            </div>
          </div>
        </main>
      </div>
      <AddExpenseModal
        isOpen={isAddExpenseModalOpen}
        onClose={() => setIsAddExpenseModalOpen(false)}
        onSuccess={fetchData}
      />
    </>
  );
}
