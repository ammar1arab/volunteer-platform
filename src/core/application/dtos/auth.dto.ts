import { UserRole } from "@/core/domain/enums";

// ========== SIGN IN ==========
export interface SignInRequest {
  email: string;
  password: string;
}

export interface SignInResponse {
  success: boolean;
  user?: {
    id: string;
    email: string;
    fullName: string;
    role: UserRole;
  };
  error?: string;
}

// ========== SIGN UP ==========
export interface SignUpRequest {
  email: string;
  password: string;
  fullName: string;
  phone: string;
}

export interface SignUpResponse {
  success: boolean;
  user?: {
    id: string;
    email: string;
    fullName: string;
  };
  error?: string;
}