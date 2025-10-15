import { api } from "./api";
import { type Expense, type DailySummary } from "../lib/types";

export interface CreateExpenseData {
  description: string;
  amount: number;
  date: string;
  categoryId: number;
}

export const getExpenses = async (): Promise<Expense[]> => {
  const response = await api.get("/expense");
  return response.data.items;
};

export const getDailySummary = async (): Promise<DailySummary[]> => {
  const response = await api.get("/expense/summary");
  return response.data;
};

export const addExpense = async (
  expenseData: CreateExpenseData
): Promise<Expense> => {
  const response = await api.post("/expense", expenseData);
  return response.data;
};
