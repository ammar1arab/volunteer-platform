import { apiClient, API_ENDPOINTS } from "@/lib";

export type UploadImageResponse = {
  success: boolean;
  imageUrl?: string;
  error?: string;
};

export const uploadApi = {
  uploadFeaturedImage: (file: File) => {
    const form = new FormData();
    form.append("file", file);

    return apiClient.post<UploadImageResponse>(API_ENDPOINTS.UPLOADS.FEATURED_IMAGE, form);
  },
};
