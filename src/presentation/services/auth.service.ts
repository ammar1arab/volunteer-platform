import { apiClient } from "./client.service";
import { API_ENDPOINTS } from "@/lib/config";
import type {
  SignUpRequest,
  SignUpResponse,
  SendOtpRequest,
  SendOtpResponse,
  VerifyOtpRequest,
  VerifyOtpResponse,
  ForgotPasswordRequest,
  ForgotPasswordResponse,
  ResetPasswordResponse
} from "@/core/application/dtos";

export const authApi = {
  signUp: (data: SignUpRequest) => apiClient.post<SignUpResponse>(API_ENDPOINTS.AUTH.REGISTER, data),
  sendOtp: (data: SendOtpRequest) => apiClient.post<SendOtpResponse>(API_ENDPOINTS.AUTH.SEND_OTP, data),
  verifyOtp: (data: VerifyOtpRequest) => apiClient.post<VerifyOtpResponse>(API_ENDPOINTS.AUTH.VERIFY_OTP, data),
  checkOtp: (data: VerifyOtpRequest) => apiClient.post<VerifyOtpResponse>(API_ENDPOINTS.AUTH.CHECK_OTP, data),
  forgotPassword: (data: ForgotPasswordRequest) =>
    apiClient.post<ForgotPasswordResponse>(API_ENDPOINTS.AUTH.FORGOT_PASSWORD, data),
  resetPassword: (body: { resetToken: string; newPassword: string }) =>
    apiClient.post<ResetPasswordResponse>(API_ENDPOINTS.AUTH.RESET_PASSWORD, body),
  checkEmail: async (email: string): Promise<boolean> => {
    const res = await fetch("/api/auth/check-email", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: email.toLowerCase() })
    });
    const data = (await res.json()) as { taken?: boolean };
    return Boolean(data.taken);
  }
};
