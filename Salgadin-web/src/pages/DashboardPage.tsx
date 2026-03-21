import { useEffect, useState, useCallback } from "react";
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
import {
  ArrowUpRight,
  ArrowDownLeft,
  Pizza,
  Bus,
  ShoppingCart,
  Laptop,
  PiggyBank,
  Plus,
  type LucideProps,
} from "lucide-react";
import { AddExpenseModal } from "../components/AddExpenseModal";

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

const categoryIcons: Record<string, React.ComponentType<LucideProps>> = {
  Alimentacao: Pizza,
  "AlimentaÃ§Ã£o": Pizza,
  Transporte: Bus,
  Compras: ShoppingCart,
  Educacao: Laptop,
  "EducaÃ§Ã£o": Laptop,
};

export default function DashboardPage() {
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
        "Nao foi possivel carregar seus dados financeiros. Tente novamente mais tarde."
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
    <>
      <div className="space-y-6">
        <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Meu Dashboard</h1>
            <p className="text-sm text-foreground-muted">
              Uma visao rapida das suas financas.
            </p>
          </div>
          <button
            onClick={() => setIsAddExpenseModalOpen(true)}
            className="flex items-center gap-2 bg-gradient-to-r from-[var(--brand-from)] to-[var(--brand-to)] text-white px-4 py-2 rounded-lg text-sm font-semibold hover:shadow-lg transition-all active:scale-95"
          >
            <Plus size={16} />
            <span className="hidden sm:inline">Adicionar Despesa</span>
          </button>
        </header>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="rounded-xl border border-border bg-surface p-6 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center text-sm font-semibold text-success mb-2">
              <ArrowUpRight size={16} className="mr-2" />
              Receita do Mes
            </div>
            <p className="font-bold text-3xl text-success">
              {totalRevenue.toLocaleString("pt-BR", {
                style: "currency",
                currency: "BRL",
              })}
            </p>
          </div>
          <div className="rounded-xl border border-border bg-surface p-6 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center text-sm font-semibold text-danger mb-2">
              <ArrowDownLeft size={16} className="mr-2" />
              Despesas do Mes
            </div>
            <p className="font-bold text-3xl text-danger">
              {totalExpenses.toLocaleString("pt-BR", {
                style: "currency",
                currency: "BRL",
              })}
            </p>
          </div>
          <div className="rounded-xl border border-border bg-surface p-6 shadow-sm hover:shadow-md transition-shadow">
            <p className="text-sm font-semibold text-foreground-muted mb-2">
              Balanco
            </p>
            <p
              className={`font-bold text-3xl ${
                balance >= 0 ? "text-success" : "text-warning"
              }`}
            >
              {balance.toLocaleString("pt-BR", {
                style: "currency",
                currency: "BRL",
              })}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 rounded-xl border border-border bg-surface p-6 shadow-sm">
            <h3 className="font-bold text-lg text-foreground mb-4">
              Gastos Diarios
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
                  tick={{ fill: "var(--chart-muted)" }}
                />
                <YAxis
                  tickFormatter={(value) => `R$${value}`}
                  tickLine={false}
                  axisLine={false}
                  width={50}
                  fontSize={12}
                  tick={{ fill: "var(--chart-muted)" }}
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
                    const fill = theme === "dark" ? adjustHex(base, 18) : base;
                    return <Cell key={`cell-${index}`} fill={fill} />;
                  })}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="rounded-xl border border-border bg-surface p-6 shadow-sm">
            <h3 className="font-bold text-lg text-foreground mb-4">
              Ultimas Despesas
            </h3>
            <div className="space-y-3">
              {expenses.length > 0 ? (
                expenses.slice(0, 5).map((exp) => {
                  const Icon = categoryIcons[exp.category] || PiggyBank;
                  return (
                    <div
                      key={exp.id}
                      className="flex items-center gap-3 p-2 rounded-lg hover:bg-surface-2 transition-colors"
                    >
                      <div className="h-10 w-10 bg-surface-2 rounded-lg grid place-items-center flex-shrink-0 text-primary">
                        <Icon size={18} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-foreground truncate">
                          {exp.description}
                        </p>
                        <p className="text-xs text-foreground-subtle">
                          {exp.category}
                        </p>
                      </div>
                      <p className="font-bold text-sm text-success whitespace-nowrap">
                        {exp.amount.toLocaleString("pt-BR", {
                          style: "currency",
                          currency: "BRL",
                        })}
                      </p>
                    </div>
                  );
                })
              ) : (
                <p className="text-sm text-foreground-subtle text-center py-4">
                  Nenhuma despesa encontrada.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
      <AddExpenseModal
        isOpen={isAddExpenseModalOpen}
        onClose={() => setIsAddExpenseModalOpen(false)}
        onSuccess={fetchData}
      />
    </>
  );
}
