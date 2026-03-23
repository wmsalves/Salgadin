import { api } from "./api";
import type { Goal, GoalAlert } from "../lib/types";

export interface CreateGoalData {
  categoryId?: number | null;
  monthlyLimit: number;
  alertThreshold: number;
  isActive: boolean;
}

export const getGoals = async (): Promise<Goal[]> => {
  const response = await api.get("/goals");
  return response.data;
};

export const createGoal = async (data: CreateGoalData): Promise<Goal> => {
  const response = await api.post("/goals", data);
  return response.data;
};

export const updateGoal = async (
  id: number,
  data: CreateGoalData
): Promise<Goal> => {
  const response = await api.put(`/goals/${id}`, data);
  return response.data;
};

export const deleteGoal = async (id: number): Promise<void> => {
  await api.delete(`/goals/${id}`);
};

export const getGoalAlerts = async (
  year: number,
  month: number
): Promise<GoalAlert[]> => {
  const response = await api.get("/goals/alerts", {
    params: { year, month },
  });
  return response.data;
};
