import { apiClient } from "./client";
import { API_ENDPOINTS } from "@/lib";
import type { SignUpRequest, SignUpResponse } from "@/core/application/dtos";

export const authApi = {
  signUp: async (data: {
    email: string;
    password: string;
    fullName: string;
    phone: string;
    city: string;
    dateOfBirth: string;
  }): Promise<SignUpResponse> => {
    try {
      const response = await apiClient.post<SignUpResponse>(
        API_ENDPOINTS.AUTH.REGISTER,
        {
          email: data.email,
          password: data.password,
          fullName: data.fullName,
          phone: data.phone,
          city: data.city,
          dateOfBirth: data.dateOfBirth,
        }
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