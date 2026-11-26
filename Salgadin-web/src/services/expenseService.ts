import { api } from "./api";
import { type Expense, type DailySummary } from "../lib/types";

export interface CreateExpenseData {
  description: string;
  amount: number;
  date: string;
  categoryId: number;
  subcategoryId?: number | null;
  recurringScheduleId?: number | null;
}

export type UpdateExpenseData = CreateExpenseData;

interface PagedResponse<T> {
  items: T[];
  page: number;
  pageSize: number;
  totalCount: number;
}

// A API pagina em no maximo 100 itens; buscamos todas as paginas do periodo
// para que totais e listas nao parem silenciosamente nos primeiros 20.
const PAGE_SIZE = 100;
const MAX_PAGES = 50;

export const getExpenses = async (startDate?: string, endDate?: string): Promise<Expense[]> => {
  const all: Expense[] = [];
  for (let page = 1; page <= MAX_PAGES; page += 1) {
    const response = await api.get<PagedResponse<Expense>>("/expense", {
      params: { startDate, endDate, page, pageSize: PAGE_SIZE },
    });
    const { items, totalCount } = response.data;
    all.push(...items);
    if (items.length < PAGE_SIZE || all.length >= totalCount) break;
  }
  return all;
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

export const updateExpense = async (
  id: number,
  expenseData: UpdateExpenseData,
): Promise<void> => {
  await api.put(`/expense/${id}`, expenseData);
};

export interface FrequentExpense {
  description: string;
  amount: number;
  categoryId: number;
  category: string;
  count: number;
}

/** Registra uma despesa a partir de texto livre, ex.: "café 7,50 ontem". */
export const addQuickExpense = async (text: string, today: string): Promise<Expense> => {
  const response = await api.post<Expense>("/expense/quick", { text, today });
  return response.data;
};

/** Gastos avulsos que o usuário mais repete nos últimos 90 dias. */
export const getFrequentExpenses = async (limit = 6): Promise<FrequentExpense[]> => {
  const response = await api.get<FrequentExpense[]>("/expense/frequent", { params: { limit } });
  return response.data;
};
