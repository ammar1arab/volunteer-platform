import { OtpType } from "@prisma/client";
import type { Result } from "./base.dto";

export interface SendOtpRequest {
  email: string;
  type: OtpType;
}

export interface VerifyOtpRequest {
  email: string;
  code: string;
  type: OtpType;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ResetPasswordRequest {
  email: string;
  code: string;
  newPassword: string;
}

export type SendOtpResponse = Result<{ cooldownSeconds: number }>;
export type VerifyOtpResponse = Result<{ verified: true }>;
export type ForgotPasswordResponse = Result<{ cooldownSeconds: number }>;
export type ResetPasswordResponse = Result<{ success: true }>;