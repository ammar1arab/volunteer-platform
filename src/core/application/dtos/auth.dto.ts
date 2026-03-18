import { UserRole, JordanianCity, Gender } from "@/core/domain/enums";
import type { Result } from "./base.dto";

export interface SignInRequest {
  email: string;
  password: string;
}

export interface SignInUserDto {
  id: string;
  email: string;
  fullName: string;
  role: UserRole;
}

export type SignInResponse = Result<{ user: SignInUserDto }>;

export interface SignUpRequest {
  email: string;
  password: string;
  fullName: string;
  phone: string;
  city: JordanianCity;
  dateOfBirth: Date;
  gender: Gender;
}

export interface SignUpUserDto {
  id: string;
  email: string;
  fullName: string;
}

export type SignUpResponse = Result<{ user: SignUpUserDto }>;

export interface SignInTokenDto {
  token: string;
  user: SignInUserDto;
}

export type SignInTokenResponse = Result<SignInTokenDto>;
