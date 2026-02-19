import { apiClient } from "./client.service";
import { API_ENDPOINTS } from "@/lib/config";
import type {
  GetVolunteerProfileResponse,
  UpdateVolunteerProfileRequest,
  UpdateVolunteerProfileResponse,
  UploadProfilePictureResponse
} from "@/core/application/dtos";

export const volunteerProfileApi = {
  getProfile: () => apiClient.get<GetVolunteerProfileResponse>(API_ENDPOINTS.VOLUNTEER_PROFILE.BASE),
  update: (data: Omit<UpdateVolunteerProfileRequest, "userId">) =>
    apiClient.patch<UpdateVolunteerProfileResponse>(API_ENDPOINTS.VOLUNTEER_PROFILE.BASE, data),
  uploadPicture: (file: File) => {
    const form = new FormData();
    form.append("file", file);
    return apiClient.post<UploadProfilePictureResponse>(API_ENDPOINTS.VOLUNTEER_PROFILE.PICTURE, form);
  }
};
