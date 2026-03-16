import { apiClient } from "./client.service";
import { API_ENDPOINTS } from "@/lib/config";
import type { GetUserCertificatesResponse, GetCertificateByIdResponse } from "@/core/application/dtos";

export const certificateApi = {
  getByUser: () => apiClient.get<GetUserCertificatesResponse>(API_ENDPOINTS.CERTIFICATES.BASE),
  getById: (id: string) => apiClient.get<GetCertificateByIdResponse>(API_ENDPOINTS.CERTIFICATES.BY_ID(id))
};
