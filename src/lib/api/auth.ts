import { signIn } from "next-auth/react";
import { apiClient } from "./client";
import { API_ENDPOINTS } from "@/lib";
import { JordanianCity } from "@/core/domain/enums";
import type {
  SignInRequest,
  SignInResponse,
  SignUpRequest,
  SignUpResponse,
} from "@/core/application/dtos";

export const authApi = {
  signIn: async (credentials: SignInRequest): Promise<SignInResponse> => {
    const res = await signIn("credentials", {
      redirect: false,
      email: credentials.email,
      password: credentials.password,
    });

    if (res?.error) return { success: false, error: res.error };
    return { success: true };
  },

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