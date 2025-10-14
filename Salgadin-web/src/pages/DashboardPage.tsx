import { useEffect, useState } from "react";
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
} from "lucide-react";

const categoryIcons: Record<string, React.ElementType> = {
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

  useEffect(() => {
    async function loadData() {
      try {
        setIsLoading(true);
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
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, []);

  const totalExpenses = summary.reduce((acc, day) => acc + day.total, 0);
  const totalRevenue = 3500.0;
  const balance = totalRevenue - totalExpenses;

  if (isLoading) {
    return <div className="p-8 text-center">Carregando seu dashboard...</div>;
  }

  if (error) {
    return <div className="p-8 text-center text-red-600">{error}</div>;
  }

  return (
    <div className="min-h-screen bg-slate-100">
      <header className="bg-white shadow-sm">
        <div className="mx-auto max-w-7xl px-4 py-3 flex justify-between items-center">
          <h1 className="text-xl font-bold text-emerald-600">Meu Dashboard</h1>
          <div className="flex items-center gap-4">
            <span className="text-sm hidden sm:inline">Olá, {user?.name}</span>
            <button
              onClick={logout}
              className="p-2 rounded-full hover:bg-red-50"
              title="Sair"
            >
              <LogOut size={18} className="text-red-500" />
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl p-4 sm:p-6 lg:p-8">
        {/* Cards de Resumo */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-white p-4 rounded-lg shadow-sm">
            <div className="flex items-center text-sm text-slate-500">
              <ArrowUpRight size={14} className="mr-1 text-emerald-500" />
              Receita do Mês
            </div>
            <p className="font-bold text-2xl text-emerald-600 mt-1">
              {totalRevenue.toLocaleString("pt-BR", {
                style: "currency",
                currency: "BRL",
              })}
            </p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm">
            <div className="flex items-center text-sm text-slate-500">
              <ArrowDownLeft size={14} className="mr-1 text-red-500" />
              Despesas do Mês
            </div>
            <p className="font-bold text-2xl text-red-500 mt-1">
              {totalExpenses.toLocaleString("pt-BR", {
                style: "currency",
                currency: "BRL",
              })}
            </p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm">
            <p className="text-sm text-slate-500">Balanço</p>
            <p
              className={`font-bold text-2xl mt-1 ${
                balance >= 0 ? "text-slate-700" : "text-amber-600"
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
          <div className="lg:col-span-2 bg-white p-4 rounded-lg shadow-sm h-96">
            <h3 className="font-semibold text-slate-700 mb-4">
              Gastos Diários
            </h3>
            <ResponsiveContainer width="100%" height="90%">
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
                />
                <YAxis
                  tickFormatter={(value) => `R$${value}`}
                  tickLine={false}
                  axisLine={false}
                  width={50}
                  fontSize={12}
                />
                <Tooltip
                  cursor={{ fill: "rgba(0,0,0,0.05)" }}
                  contentStyle={{ borderRadius: "8px" }}
                  formatter={(value: number) => [
                    value.toLocaleString("pt-BR", {
                      style: "currency",
                      currency: "BRL",
                    }),
                    "Total",
                  ]}
                />
                <Bar dataKey="total" name="Total Gasto" radius={[4, 4, 0, 0]}>
                  {summary.map((entry, index) => (
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
          <div className="bg-white p-4 rounded-lg shadow-sm">
            <h3 className="font-semibold text-slate-700 mb-4">
              Últimas Despesas
            </h3>
            <div className="space-y-3">
              {expenses.length > 0 ? (
                expenses.slice(0, 5).map((exp) => {
                  const Icon = categoryIcons[exp.category] || PiggyBank;
                  return (
                    <div key={exp.id} className="flex items-center gap-3">
                      <div className="h-8 w-8 bg-slate-100 rounded-full grid place-items-center flex-shrink-0">
                        <Icon size={16} className="text-slate-500" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">{exp.description}</p>
                        <p className="text-xs text-slate-500">{exp.category}</p>
                      </div>
                      <p className="font-bold text-sm">
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
  );
}
