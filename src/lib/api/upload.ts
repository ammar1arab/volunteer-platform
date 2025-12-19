import { apiClient } from "./client";
import { API_ENDPOINTS } from "@/lib";

export interface UploadImageResponse {
  success: boolean;
  imageUrl?: string;
  error?: string;
}

export const uploadApi = {
  uploadFeaturedImage: async (file: File): Promise<UploadImageResponse> => {
    const form = new FormData();
    form.append("file", file);

    return apiClient.post<UploadImageResponse>(API_ENDPOINTS.UPLOADS.IMAGE, form);
  },
};
