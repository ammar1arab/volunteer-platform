import { UserRole, JordanianCity } from "@/core/domain/enums";

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

export interface SignUpRequest {
  email: string;
  password: string;
  fullName: string;
  phone: string;
  city: JordanianCity;
  dateOfBirth: Date;
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