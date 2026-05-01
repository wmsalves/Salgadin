import { api } from "./api";
import { type Income } from "../lib/types";

export interface CreateIncomeData {
  description: string;
  amount: number;
  date: string;
  isFixed: boolean;
}

export type UpdateIncomeData = CreateIncomeData;

export const getIncomes = async (startDate?: string, endDate?: string): Promise<Income[]> => {
  const response = await api.get("/income", { params: { startDate, endDate } });
  return response.data.items;
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
