import { apiClient } from "./client.service";
import type {
  GetNotificationsResponse,
  GetBroadcastsResponse,
  GetNotificationPreviewResponse,
  GetBroadcastRecipientsResponse,
  MarkAsReadResponse,
  ClearNotificationsResponse,
  SendCustomNotificationResponse,
  DeleteBroadcastResponse,
  SendCustomNotificationInput
} from "@/core/application/dtos";

export const notificationApi = {
  getRecent: () => apiClient.get<GetNotificationsResponse>("/api/notifications"),
  markAsRead: (id: string) => apiClient.post<MarkAsReadResponse>(`/api/notifications/${id}/read`, {}),
  markAllAsRead: () => apiClient.post<MarkAsReadResponse>("/api/notifications/read-all", {}),
  clearHistory: () => apiClient.delete<ClearNotificationsResponse>("/api/notifications"),
  getBroadcasts: () => apiClient.get<GetBroadcastsResponse>("/api/notifications?broadcasts=1"),
  clearBroadcasts: () => apiClient.delete<ClearNotificationsResponse>("/api/notifications?clearBroadcasts=1"),
  previewTargets: (target: string, value?: string) =>
    apiClient.get<GetNotificationPreviewResponse>(
      `/api/notifications?preview=1&target=${target}${value ? `&targetValue=${encodeURIComponent(value)}` : ""}`
    ),
  sendCustom: (data: SendCustomNotificationInput) =>
    apiClient.post<SendCustomNotificationResponse>("/api/notifications", data),
  getBroadcastRecipients: (broadcastId: string) =>
    apiClient.get<GetBroadcastRecipientsResponse>(`/api/notifications/broadcasts/${broadcastId}`),
  deleteBroadcast: (broadcastId: string) =>
    apiClient.delete<DeleteBroadcastResponse>(`/api/notifications/broadcasts/${broadcastId}`)
};
