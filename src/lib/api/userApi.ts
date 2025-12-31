import { apiClient, API_ENDPOINTS } from "@/lib";
import type { GetUserProfileResponse } from "@/core/application/dtos";

export const userApi = {
  getProfile: () =>
    apiClient.get<GetUserProfileResponse>(API_ENDPOINTS.USERS.ME),
};