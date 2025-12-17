import { signIn } from "next-auth/react";
import { apiClient } from "./client";
import { API_ENDPOINTS } from "@/lib/constants";
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

  signUp: async (data: SignUpRequest): Promise<SignUpResponse> => {
    return apiClient.post<SignUpResponse>(API_ENDPOINTS.AUTH.REGISTER, data);
  },
};
