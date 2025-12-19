import { apiClient, API_ENDPOINTS } from "@/lib";

type ApiResponse<T> = {
  success: boolean;
  data?: T;
  error?: string;
};

export type UploadImageResponse = {
  imageUrl: string;
};

export const uploadApi = {
  uploadFeaturedImage: (
    file: File
  ): Promise<ApiResponse<UploadImageResponse>> => {
    const form = new FormData();
    form.append("file", file);

    return apiClient.post<ApiResponse<UploadImageResponse>>(
      API_ENDPOINTS.UPLOADS.FEATURED_IMAGE,
      form
    );
  },
};
