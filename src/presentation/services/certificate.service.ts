import { apiClient } from "./client.service";
import { API_ENDPOINTS } from "@/lib/config";
import type {
  GetUserCertificatesResponse,
  GetCertificateByIdResponse,
} from "@/core/application/dtos";

export const certificateApi = {
  getByUser: () =>
    apiClient.get<GetUserCertificatesResponse>(API_ENDPOINTS.CERTIFICATES.BASE),

  getById: (id: string) =>
    apiClient.get<GetCertificateByIdResponse>(API_ENDPOINTS.CERTIFICATES.BY_ID(id)),

  getDownloadUrl: (pngUrl: string): string | null => {
    try {
      const key = new URL(pngUrl).pathname.substring(1);
      if (!key) return null;
      return API_ENDPOINTS.DOWNLOAD.PRESIGN(key);
    } catch {
      return null;
    }
  },
};