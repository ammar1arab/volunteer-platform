import { apiClient, API_ENDPOINTS } from "@/lib";
import type { ApiResponse } from "@/lib/types/api.types";

export type UploadImageResponse = {
  imageUrl: string;
};

export const uploadApi = {
  upload: (
    scope: "featured-posts" | "activities",
    file: File
  ): Promise<ApiResponse<UploadImageResponse>> => {
    const form = new FormData();
    form.append("file", file);

    return apiClient.post<ApiResponse<UploadImageResponse>>(
      API_ENDPOINTS.UPLOADS.BY_SCOPE(scope),
      form
    );
  },

  uploadFeaturedImage: (file: File) => uploadApi.upload("featured-posts", file),
  uploadActivityImage: (file: File) => uploadApi.upload("activities", file),
};
