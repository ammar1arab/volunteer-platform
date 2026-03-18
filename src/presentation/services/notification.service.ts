import { apiClient } from "./client.service";
import { API_ENDPOINTS } from "@/lib/config";
import type {
  GetNotificationsResponse,
  GetBroadcastsResponse,
  GetNotificationPreviewResponse,
  MarkAsReadResponse,
  ClearNotificationsResponse,
  SendCustomNotificationResponse,
  SendCustomNotificationInput,
} from "@/core/application/dtos";

export const notificationApi = {
  getRecent: () =>
    apiClient.get<GetNotificationsResponse>(API_ENDPOINTS.NOTIFICATIONS.BASE),

  getBroadcasts: () =>
    apiClient.get<GetBroadcastsResponse>(API_ENDPOINTS.NOTIFICATIONS.BROADCASTS),

  previewTargets: (target: string, targetValue?: string) => {
    const q = targetValue ? `&targetValue=${encodeURIComponent(targetValue)}` : "";
    return apiClient.get<GetNotificationPreviewResponse>(
      `${API_ENDPOINTS.NOTIFICATIONS.BASE}?preview=1&target=${target}${q}`
    );
  },

  markAsRead: (id: string) =>
    apiClient.post<MarkAsReadResponse>(API_ENDPOINTS.NOTIFICATIONS.MARK_AS_READ(id)),

  markAllAsRead: () =>
    apiClient.post<MarkAsReadResponse>(API_ENDPOINTS.NOTIFICATIONS.MARK_ALL_AS_READ),

  clearHistory: () =>
    apiClient.delete<ClearNotificationsResponse>(API_ENDPOINTS.NOTIFICATIONS.CLEAR),

  clearBroadcasts: () =>
    apiClient.delete<ClearNotificationsResponse>(`${API_ENDPOINTS.NOTIFICATIONS.BASE}?clearBroadcasts=1`),

  sendCustom: (body: SendCustomNotificationInput) =>
    apiClient.post<SendCustomNotificationResponse>(API_ENDPOINTS.NOTIFICATIONS.BASE, body),
};