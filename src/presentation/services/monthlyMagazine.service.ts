import { apiClient } from "./client.service";
import { API_ENDPOINTS } from "@/lib/config";
import type {
  CreateMonthlyMagazineRequest,
  CreateMonthlyMagazineResponse,
  UpdateMonthlyMagazineRequest,
  UpdateMonthlyMagazineResponse,
  GetMonthlyMagazineResponse,
  GetAllMonthlyMagazinesResponse,
  DeleteMonthlyMagazineResponse
} from "@/core/application/dtos";

export const monthlyMagazineApi = {
  getAll: () => apiClient.get<GetAllMonthlyMagazinesResponse>(API_ENDPOINTS.MONTHLY_MAGAZINES.BASE),
  getOne: (id: string) => apiClient.get<GetMonthlyMagazineResponse>(API_ENDPOINTS.MONTHLY_MAGAZINES.BY_ID(id)),
  create: (data: CreateMonthlyMagazineRequest) =>
    apiClient.post<CreateMonthlyMagazineResponse>(API_ENDPOINTS.MONTHLY_MAGAZINES.BASE, data),
  update: (id: string, data: UpdateMonthlyMagazineRequest) =>
    apiClient.put<UpdateMonthlyMagazineResponse>(API_ENDPOINTS.MONTHLY_MAGAZINES.BY_ID(id), data),
  delete: (id: string) => apiClient.delete<DeleteMonthlyMagazineResponse>(API_ENDPOINTS.MONTHLY_MAGAZINES.BY_ID(id))
};
