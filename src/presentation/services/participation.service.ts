import { apiClient } from "./client.service";
import { API_ENDPOINTS } from "@/lib/config";
import type {
  CreateJoinRequestResponse,
  GetJoinRequestsResponse,
  ApproveJoinRequestResponse,
  RejectJoinRequestResponse,
  MarkAttendanceResponse,
  CancelJoinRequestResponse
} from "@/core/application/dtos";

export const participationApi = {
  create: (activityId: string) =>
    apiClient.post<CreateJoinRequestResponse>(API_ENDPOINTS.ACTIVITY_PARTICIPATIONS.BASE, { activityId }),
  getMyRequests: () => apiClient.get<GetJoinRequestsResponse>(API_ENDPOINTS.ACTIVITY_PARTICIPATIONS.MY_REQUESTS),
  getPending: () => apiClient.get<GetJoinRequestsResponse>(API_ENDPOINTS.ACTIVITY_PARTICIPATIONS.PENDING),
  approve: (id: string) =>
    apiClient.post<ApproveJoinRequestResponse>(API_ENDPOINTS.ACTIVITY_PARTICIPATIONS.APPROVE(id)),
  reject: (id: string) => apiClient.post<RejectJoinRequestResponse>(API_ENDPOINTS.ACTIVITY_PARTICIPATIONS.REJECT(id)),
  cancel: (id: string) => apiClient.post<CancelJoinRequestResponse>(API_ENDPOINTS.ACTIVITY_PARTICIPATIONS.CANCEL(id)),

  markAttendance: (id: string, attended: boolean) =>
    apiClient.post<MarkAttendanceResponse>(API_ENDPOINTS.ACTIVITY_PARTICIPATIONS.MARK_ATTENDANCE(id), {
      attended
    })
};
