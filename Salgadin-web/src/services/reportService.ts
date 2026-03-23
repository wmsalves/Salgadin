import { api } from "./api";
import type { ReportResponse } from "../lib/types";

export const getMonthlyReport = async (
  year: number,
  month: number
): Promise<ReportResponse> => {
  const response = await api.get("/reports/monthly", {
    params: { year, month },
  });
  return response.data;
};

export const getWeeklyReport = async (
  startDate: string,
  endDate: string
): Promise<ReportResponse> => {
  const response = await api.get("/reports/weekly", {
    params: { startDate, endDate },
  });
  return response.data;
};
