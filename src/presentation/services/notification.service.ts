import { apiClient } from "./client.service";
import { API_ENDPOINTS } from "@/lib/config";
import type { GetUnreadNotificationsResponse, MarkAsReadResponse } from "@/core/application/dtos";

export const notificationApi = {
  getUnread: () => apiClient.get<GetUnreadNotificationsResponse>(API_ENDPOINTS.NOTIFICATIONS.BASE),
  markAsRead: (id: string) => apiClient.patch<MarkAsReadResponse>(API_ENDPOINTS.NOTIFICATIONS.MARK_AS_READ(id)),
  markAllAsRead: () => apiClient.patch<MarkAsReadResponse>(API_ENDPOINTS.NOTIFICATIONS.MARK_ALL_AS_READ)
};
