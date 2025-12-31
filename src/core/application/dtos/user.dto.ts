import { UserRole } from "@/core/domain/enums";

export interface UserProfileDto {
  id: string;
  email: string;
  fullName: string;
  phone: string;
  role: UserRole;
  isActive: boolean;
  createdAt: string;
}

export interface GetUserProfileResponse {
  success: boolean;
  user?: UserProfileDto;
  error?: string;
}