import { apiClient } from "./client";
import { API_ENDPOINTS } from "@/lib";
import type { VolunteerProfile, UpdateVolunteerProfileData } from "@/lib/types";

interface GetProfileResponse {
  success: boolean;
  profile?: VolunteerProfile;
  error?: string;
}

interface UpdateProfileResponse {
  success: boolean;
  profile?: VolunteerProfile;
  error?: string;
}

interface UploadPictureResponse {
  success: boolean;
  imageUrl?: string;
  error?: string;
}

export const volunteerProfileApi = {
  getProfile: async (): Promise<GetProfileResponse> => {
    try {
      const response = await apiClient.get<GetProfileResponse>(
        API_ENDPOINTS.VOLUNTEER_PROFILE.BASE
      );
      return response;
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "فشل جلب الملف الشخصي",
      };
    }
  },

  updateProfile: async (
    data: UpdateVolunteerProfileData
  ): Promise<UpdateProfileResponse> => {
    try {
      const response = await apiClient.patch<UpdateProfileResponse>(
        API_ENDPOINTS.VOLUNTEER_PROFILE.BASE,
        data
      );
      return response;
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "فشل تحديث الملف الشخصي",
      };
    }
  },

  uploadProfilePicture: async (file: File): Promise<UploadPictureResponse> => {
    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await apiClient.post<UploadPictureResponse>(
        API_ENDPOINTS.VOLUNTEER_PROFILE.PICTURE,
        formData
      );
      return response;
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "فشل رفع الصورة",
      };
    }
  },
};