import type { CalendarMonth } from "../lib/types";
import { api } from "./api";

export const getFinancialCalendar = async (
  year: number,
  month: number,
): Promise<CalendarMonth> => {
  const response = await api.get("/calendar", {
    params: { year, month },
  });

  return response.data;
};
