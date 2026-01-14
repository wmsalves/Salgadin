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
      <div className="min-h-screen bg-gradient-to-br from-white via-slate-50 to-slate-100 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block mb-4">
            <div className="animate-spin">
              <div className="h-12 w-12 border-4 border-emerald-200 border-t-emerald-500 rounded-full"></div>
            </div>
          </div>
          <p className="text-slate-600 font-medium">
            Carregando seu dashboard...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-white via-slate-50 to-slate-100 flex items-center justify-center">
        <div className="p-8 rounded-xl bg-red-50 border border-red-200 max-w-md">
          <p className="text-red-700 font-medium text-center">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-white via-slate-50 to-slate-100 overflow-y-scroll">
        <header className="sticky top-0 z-40 bg-white border-b border-slate-200 shadow-sm">
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
                <span className="text-sm font-medium text-slate-700 hidden sm:inline">
                  {user?.name}
                </span>
                <button
                  onClick={logout}
                  className="p-2 rounded-lg text-slate-600 hover:bg-red-50 hover:text-red-600 transition-colors"
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
            <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center text-sm font-semibold text-emerald-600 mb-2">
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
            <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center text-sm font-semibold text-red-600 mb-2">
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
            <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm hover:shadow-md transition-shadow">
              <p className="text-sm font-semibold text-slate-600 mb-2">
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
            <div className="lg:col-span-2 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
              <h3 className="font-bold text-lg text-slate-800 mb-4">
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
                    tick={{ fill: "#64748b" }}
                  />
                  <YAxis
                    tickFormatter={(value) => `R$${value}`}
                    tickLine={false}
                    axisLine={false}
                    width={50}
                    fontSize={12}
                    tick={{ fill: "#64748b" }}
                  />
                  <Tooltip
                    cursor={{ fill: "rgba(0,0,0,0.05)" }}
                    contentStyle={{
                      borderRadius: "8px",
                      border: "1px solid #e2e8f0",
                    }}
                    formatter={(value: number) => [
                      value.toLocaleString("pt-BR", {
                        style: "currency",
                        currency: "BRL",
                      }),
                      "Total",
                    ]}
                  />
                  <Bar dataKey="total" name="Total Gasto" radius={[8, 8, 0, 0]}>
                    {summary.map((_entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={index % 2 === 0 ? "#10b981" : "#f59e0b"}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Últimas Despesas */}
            <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
              <h3 className="font-bold text-lg text-slate-800 mb-4">
                Últimas Despesas
              </h3>
              <div className="space-y-3">
                {expenses.length > 0 ? (
                  expenses.slice(0, 5).map((exp) => {
                    const Icon = categoryIcons[exp.category] || PiggyBank;
                    return (
                      <div
                        key={exp.id}
                        className="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-50 transition-colors"
                      >
                        <div className="h-10 w-10 bg-gradient-to-br from-amber-100 to-emerald-100 rounded-lg grid place-items-center flex-shrink-0">
                          <Icon size={18} className="text-emerald-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-slate-800 truncate">
                            {exp.description}
                          </p>
                          <p className="text-xs text-slate-500">
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
                  <p className="text-sm text-slate-500 text-center py-4">
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
