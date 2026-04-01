import { api } from "./api";

export const exportExpenses = async (
  format: "csv" | "pdf",
  startDate?: string,
  endDate?: string,
  filters?: {
    category?: string;
    categoryId?: number;
    subcategoryId?: number;
    minAmount?: number;
    maxAmount?: number;
  }
): Promise<Blob> => {
  const response = await api.get("/expense/export", {
    params: { format, startDate, endDate, ...filters },
    responseType: "blob",
  });
  return response.data;
};
