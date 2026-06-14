import { api } from "./api";
import type {
  GenerateRecurringSchedulesResult,
  RecurringSchedule,
  RecurringSchedulePayload,
} from "../lib/types";

export const listRecurringSchedules = async (): Promise<RecurringSchedule[]> => {
  const response = await api.get("/recurring-schedules");
  return response.data;
};

export const getRecurringSchedule = async (
  id: number,
): Promise<RecurringSchedule> => {
  const response = await api.get(`/recurring-schedules/${id}`);
  return response.data;
};

export const createRecurringSchedule = async (
  data: RecurringSchedulePayload,
): Promise<RecurringSchedule> => {
  const response = await api.post("/recurring-schedules", data);
  return response.data;
};

export const updateRecurringSchedule = async (
  id: number,
  data: RecurringSchedulePayload,
): Promise<RecurringSchedule> => {
  const response = await api.put(`/recurring-schedules/${id}`, data);
  return response.data;
};

export const pauseRecurringSchedule = async (
  id: number,
): Promise<RecurringSchedule> => {
  const response = await api.patch(`/recurring-schedules/${id}/pause`);
  return response.data;
};

export const resumeRecurringSchedule = async (
  id: number,
): Promise<RecurringSchedule> => {
  const response = await api.patch(`/recurring-schedules/${id}/resume`);
  return response.data;
};

export const archiveRecurringSchedule = async (id: number): Promise<void> => {
  await api.delete(`/recurring-schedules/${id}`);
};

export const generateDueRecurringSchedules =
  async (): Promise<GenerateRecurringSchedulesResult> => {
    const response = await api.post("/recurring-schedules/generate-due");
    return response.data;
  };
