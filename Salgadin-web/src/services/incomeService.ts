import { api } from "./api";
import { type Income } from "../lib/types";

export interface CreateIncomeData {
  description: string;
  amount: number;
  date: string;
  isFixed: boolean;
  recurringScheduleId?: number | null;
}

export type UpdateIncomeData = CreateIncomeData;

interface PagedResponse<T> {
  items: T[];
  page: number;
  pageSize: number;
  totalCount: number;
}

const PAGE_SIZE = 100;
const MAX_PAGES = 50;

export const getIncomes = async (startDate?: string, endDate?: string): Promise<Income[]> => {
  const all: Income[] = [];
  for (let page = 1; page <= MAX_PAGES; page += 1) {
    const response = await api.get<PagedResponse<Income>>("/income", {
      params: { startDate, endDate, page, pageSize: PAGE_SIZE },
    });
    const { items, totalCount } = response.data;
    all.push(...items);
    if (items.length < PAGE_SIZE || all.length >= totalCount) break;
  }
  return all;
};

export const addIncome = async (
  incomeData: CreateIncomeData
): Promise<Income> => {
  const response = await api.post("/income", incomeData);
  return response.data;
};

export const updateIncome = async (
  id: number,
  incomeData: UpdateIncomeData,
): Promise<void> => {
  await api.put(`/income/${id}`, incomeData);
};

export const deleteIncome = async (id: number): Promise<void> => {
  await api.delete(`/income/${id}`);
};
