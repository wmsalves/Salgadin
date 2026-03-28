import { api } from "./api";
import { type Expense, type DailySummary } from "../lib/types";

export interface CreateExpenseData {
  description: string;
  amount: number;
  date: string;
  categoryId: number;
  subcategoryId?: number | null;
}

export const getExpenses = async (startDate?: string, endDate?: string): Promise<Expense[]> => {
  const response = await api.get("/expense", { params: { startDate, endDate } });
  return response.data.items;
};

export const getDailySummary = async (startDate?: string, endDate?: string): Promise<DailySummary[]> => {
  const response = await api.get("/expense/summary", { params: { startDate, endDate } });
  return response.data;
};

export const addExpense = async (
  expenseData: CreateExpenseData
): Promise<Expense> => {
  const response = await api.post("/expense", expenseData);
  return response.data;
};
export const deleteExpense = async (id: number): Promise<void> => {
  await api.delete(`/expense/${id}`);
};
