import { apiClient } from "./client.service";
import { API_ENDPOINTS } from "@/lib/config";
import type { SignUpRequest, SignUpResponse } from "@/core/application/dtos";

export const authApi = {
  signUp: (data: SignUpRequest) => apiClient.post<SignUpResponse>(API_ENDPOINTS.AUTH.REGISTER, data)
};
