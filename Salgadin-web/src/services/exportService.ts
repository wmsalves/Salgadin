import { api } from "./api";

export const exportExpenses = async (
  format: "csv" | "pdf",
  startDate?: string,
  endDate?: string,
  category?: string
): Promise<Blob> => {
  const response = await api.get("/expense/export", {
    params: { format, startDate, endDate, category },
    responseType: "blob",
  });
  return response.data;
};
