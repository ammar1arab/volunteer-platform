import { apiClient, API_ENDPOINTS } from "@/lib";
import type {
  GetUserProfileResponse,
  GetAllUsersResponse,
  GetUserDetailsResponse,
  GetUserActivitiesResponse,
} from "@/core/application/dtos";

export const userApi = {
  updateBasicInfo: (data: {
    email?: string;
    phone?: string;
    fullName?: string;
  }) => {
    return apiClient.patch(API_ENDPOINTS.USERS.ME, data);
  },
  getProfile: (): Promise<GetUserProfileResponse> => {
    return apiClient.get<GetUserProfileResponse>(API_ENDPOINTS.USERS.ME);
  },

  getAll: (): Promise<GetAllUsersResponse> => {
    return apiClient.get<GetAllUsersResponse>(API_ENDPOINTS.USERS.BASE);
  },

  getById: (id: string): Promise<GetUserDetailsResponse> => {
    return apiClient.get<GetUserDetailsResponse>(API_ENDPOINTS.USERS.BY_ID(id));
  },

  getActivities: (id: string): Promise<GetUserActivitiesResponse> => {
    return apiClient.get<GetUserActivitiesResponse>(
      API_ENDPOINTS.USERS.ACTIVITIES(id)
    );
  },
};
