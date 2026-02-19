import { apiClient } from "./client.service";
import { API_ENDPOINTS } from "@/lib/config";
import type { Result } from "@/core/application/dtos";

type UploadScope = "featured-posts" | "activities" | "profiles";
type UploadResponse = Result<{ imageUrl: string }>;

const upload = (scope: UploadScope, file: File): Promise<UploadResponse> => {
  const form = new FormData();
  form.append("file", file);
  return apiClient.post<UploadResponse>(API_ENDPOINTS.UPLOADS.BY_SCOPE(scope), form);
};

export const uploadApi = {
  upload,
  uploadFeaturedImage: (file: File) => upload("featured-posts", file),
  uploadActivityImage: (file: File) => upload("activities", file),
  uploadProfilePicture: (file: File) => upload("profiles", file)
};
