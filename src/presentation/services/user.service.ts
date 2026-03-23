import { apiClient } from "./client.service";
import { API_ENDPOINTS } from "@/lib/config";
import type {
  GetUserProfileResponse,
  GetAllUsersResponse,
  GetUserDetailsResponse,
  GetUserActivitiesResponse,
  UpdateUserRequest,
  UpdateUserResponse,
  UpdatePermissionsResponse,
  CreateAdminRequest,
  CreateAdminResponse,
  ToggleUserActiveResponse,
  Result,
} from "@/core/application/dtos";

export interface UpdateAdminInfoRequest extends UpdateUserRequest {
  password?: string;
}

export const userApi = {
  getProfile: () => apiClient.get<GetUserProfileResponse>(API_ENDPOINTS.USERS.ME),
  updateBasicInfo: (data: UpdateUserRequest) => apiClient.patch<UpdateUserResponse>(API_ENDPOINTS.USERS.ME, data),
  updateUserById: (id: string, data: UpdateAdminInfoRequest) =>
    apiClient.patch<UpdateUserResponse>(API_ENDPOINTS.USERS.BY_ID(id), data),
  getAll: () => apiClient.get<GetAllUsersResponse>(API_ENDPOINTS.USERS.BASE),
  getById: (id: string) => apiClient.get<GetUserDetailsResponse>(API_ENDPOINTS.USERS.BY_ID(id)),
  getActivities: (id: string) => apiClient.get<GetUserActivitiesResponse>(API_ENDPOINTS.USERS.ACTIVITIES(id)),
  updatePermissions: (id: string, permissions: string[]) =>
    apiClient.patch<UpdatePermissionsResponse>(API_ENDPOINTS.USERS.BY_ID(id), { permissions }),
  createAdmin: (data: CreateAdminRequest) => apiClient.post<CreateAdminResponse>(API_ENDPOINTS.USERS.BASE, data),
  deleteAdmin: (id: string) => apiClient.delete<Result<{ success: boolean }>>(API_ENDPOINTS.USERS.BY_ID(id)),
  toggleActive: (id: string, isActive: boolean) =>
    apiClient.patch<ToggleUserActiveResponse>(API_ENDPOINTS.USERS.BY_ID(id), { isActive })
};
