import { apiClient } from "./client.service";
import { API_ENDPOINTS } from "@/lib/config";
import type {
  GetUserProfileResponse,
  GetAllUsersResponse,
  GetUserDetailsResponse,
  GetUserActivitiesResponse,
  UpdateUserRequest,
  UpdateUserResponse
} from "@/core/application/dtos";

export const userApi = {
  getProfile: () => apiClient.get<GetUserProfileResponse>(API_ENDPOINTS.USERS.ME),
  updateBasicInfo: (data: UpdateUserRequest) => apiClient.patch<UpdateUserResponse>(API_ENDPOINTS.USERS.ME, data),
  getAll: () => apiClient.get<GetAllUsersResponse>(API_ENDPOINTS.USERS.BASE),
  getById: (id: string) => apiClient.get<GetUserDetailsResponse>(API_ENDPOINTS.USERS.BY_ID(id)),
  getActivities: (id: string) => apiClient.get<GetUserActivitiesResponse>(API_ENDPOINTS.USERS.ACTIVITIES(id))
};
