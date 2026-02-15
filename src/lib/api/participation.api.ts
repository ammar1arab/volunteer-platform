import { apiClient } from "./client.api";
import { API_ENDPOINTS } from "@/lib";
import type {
  CreateJoinRequestResponse,
  GetJoinRequestsResponse,
  ApproveJoinRequestResponse,
  RejectJoinRequestResponse,
} from "@/core/application/dtos";

export const participationApi = {
  create: (activityId: string) =>
    apiClient.post<CreateJoinRequestResponse>(
      API_ENDPOINTS.ACTIVITY_PARTICIPATIONS.BASE,
      { activityId },
    ),
  getMyRequests: () =>
    apiClient.get<GetJoinRequestsResponse>(
      API_ENDPOINTS.ACTIVITY_PARTICIPATIONS.MY_REQUESTS,
    ),
  getPending: () =>
    apiClient.get<GetJoinRequestsResponse>(
      API_ENDPOINTS.ACTIVITY_PARTICIPATIONS.PENDING,
    ),
  approve: (id: string) =>
    apiClient.post<ApproveJoinRequestResponse>(
      API_ENDPOINTS.ACTIVITY_PARTICIPATIONS.APPROVE(id),
    ),
  reject: (id: string) =>
    apiClient.post<RejectJoinRequestResponse>(
      API_ENDPOINTS.ACTIVITY_PARTICIPATIONS.REJECT(id),
    ),
};
