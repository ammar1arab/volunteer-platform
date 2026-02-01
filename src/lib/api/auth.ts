import { apiClient } from "./client";
import { API_ENDPOINTS } from "@/lib";
import type { SignUpRequest, SignUpResponse } from "@/core/application/dtos";

export const authApi = {
  signUp: async (data: SignUpRequest): Promise<SignUpResponse> => {
    try {
      const response = await apiClient.post<SignUpResponse>(
        API_ENDPOINTS.AUTH.REGISTER,
        data,
      );
      return response;
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "حدث خطأ أثناء إنشاء الحساب",
      };
    }
  },
};