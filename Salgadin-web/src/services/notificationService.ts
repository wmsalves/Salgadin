import { api } from "./api";
import type {
  NotificationPreference,
  GoalAlert,
  NotificationItem,
} from "../lib/types";

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

export const getNotifications = async (
  unreadOnly = false
): Promise<NotificationItem[]> => {
  const response = await api.get("/notifications", {
    params: { unreadOnly },
  });
  return response.data;
};

export const markNotificationRead = async (id: number): Promise<void> => {
  await api.patch(`/notifications/${id}/read`);
};

export const markAllNotificationsRead = async (): Promise<number> => {
  const response = await api.patch("/notifications/read-all");
  return response.data?.updated ?? 0;
};
