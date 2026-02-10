import { apiClient, API_ENDPOINTS } from "@/lib";

export type UploadImageResponse = {
  imageUrl: string;
};

export type ApiResponse<T> = {
  success: boolean;
  data?: T;
  error?: string;
};


export const uploadApi = {
  upload: (
    scope: "featured-posts" | "activities" | "profiles",
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
  uploadProfilePicture: (file: File) => uploadApi.upload("profiles", file),
};