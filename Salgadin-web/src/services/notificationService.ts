import { api } from "./api";
import type { NotificationPreference, GoalAlert } from "../lib/types";

export const getNotificationPreferences =
  async (): Promise<NotificationPreference> => {
    const response = await api.get("/notifications/preferences");
    return response.data;
  };

export const updateNotificationPreferences = async (
  data: NotificationPreference
): Promise<NotificationPreference> => {
  const response = await api.put("/notifications/preferences", data);
  return response.data;
};

export const getNotificationAlerts = async (
  year: number,
  month: number
): Promise<GoalAlert[]> => {
  const response = await api.get("/notifications/alerts", {
    params: { year, month },
  });
  return response.data;
};
