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

export interface UserDto {
  id: string;
  email: string;
  fullName: string;
  phone: string;
  role: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface UserAnalyticsDto extends UserDto {
  stats: {
    totalActivities: number;
    pendingRequests: number;
    approvedActivities: number;
    rejectedRequests: number;
  };
}

export interface UserActivityDto {
  id: string;
  activityId: string;
  activityTitle: string;
  activityDate: string;
  status: string;
  requestedAt: string;
  respondedAt: string | null;
}

export interface GetAllUsersResponse {
  success: boolean;
  users?: UserAnalyticsDto[];
  error?: string;
}

export interface GetUserDetailsResponse {
  success: boolean;
  user?: UserAnalyticsDto;
  error?: string;
}

export interface GetUserActivitiesResponse {
  success: boolean;
  activities?: UserActivityDto[];
  error?: string;
}