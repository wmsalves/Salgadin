/* eslint-disable @typescript-eslint/no-unused-vars */
import { useEffect, useState } from "react";
import { useAuth } from "../hooks/useAuth";
import { getExpenses, getDailySummary } from "../services/expenseService";
import { type Expense, type DailySummary } from "../lib/types";

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

  if (isLoading) {
    return <div className="p-8">Carregando seu dashboard...</div>;
  }

  if (error) {
    return <div className="p-8 text-red-600">{error}</div>;
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white shadow-sm p-4 flex justify-between items-center">
        <h1 className="text-xl font-bold text-emerald-600">Meu Dashboard</h1>
        <div>
          <span>Olá, {user?.name}</span>
          <button
            onClick={logout}
            className="ml-4 text-sm text-red-500 hover:underline"
          >
            Sair
          </button>
        </div>
      </header>

      <main className="p-8">
        <h2 className="text-2xl font-bold mb-4">Resumo Financeiro</h2>

        <div className="mt-8">
          <h3 className="text-lg font-semibold">Últimas Despesas</h3>
          <ul>
            {expenses.length > 0 ? (
              expenses.map((exp) => (
                <li key={exp.id} className="border-b py-2">
                  {exp.description} - R$ {exp.amount.toFixed(2)} -{" "}
                  {exp.category}
                </li>
              ))
            ) : (
              <p>Você ainda não cadastrou nenhuma despesa.</p>
            )}
          </ul>
        </div>
      </main>
    </div>
  );
}
