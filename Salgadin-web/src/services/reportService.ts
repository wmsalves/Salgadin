import { api } from "./api";
import type { ReportResponse, ReportComparison, ReportSummary } from "../lib/types";

export const getMonthlyReport = async (
  year: number,
  month: number,
  filters?: {
    categoryId?: number;
    subcategoryId?: number;
    minAmount?: number;
    maxAmount?: number;
  }
): Promise<ReportResponse> => {
  const response = await api.get("/reports/monthly", {
    params: { year, month, ...filters },
  });
  return response.data;
};

export const getWeeklyReport = async (
  startDate: string,
  endDate: string,
  filters?: {
    categoryId?: number;
    subcategoryId?: number;
    minAmount?: number;
    maxAmount?: number;
  }
): Promise<ReportResponse> => {
  const response = await api.get("/reports/weekly", {
    params: { startDate, endDate, ...filters },
  });
  return response.data;
};

export const compareMonthlyReports = async (
  year: number,
  month: number,
  compareYear: number,
  compareMonth: number,
  filters?: {
    categoryId?: number;
    subcategoryId?: number;
    minAmount?: number;
    maxAmount?: number;
  }
): Promise<ReportComparison> => {
  const response = await api.get("/reports/compare-monthly", {
    params: { year, month, compareYear, compareMonth, ...filters },
  });
  return response.data;
};

export const getReportSummary = async (
  startDate: string,
  endDate: string,
  filters?: {
    categoryId?: number;
    subcategoryId?: number;
    minAmount?: number;
    maxAmount?: number;
  }
): Promise<ReportSummary> => {
  const response = await api.get("/reports/summary", {
    params: { startDate, endDate, ...filters },
  });
  return response.data;
};
