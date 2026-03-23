import { ParticipationStatus, UserRole } from "@/core/domain/enums";
import type { Result } from "./base.dto";
import type { UserSummaryDto, VolunteerProfileSummaryDto } from "./shared.dto";
import { VolunteerProfileDto } from "./volunteerProfile.dto";

export interface UserProfileDto extends UserSummaryDto {
  role: UserRole;
  isActive: boolean;
  createdAt: string;
  volunteerProfile?: VolunteerProfileDto;
  participations?: Array<{ id: string; status: string }>;
}

export type GetUserProfileResponse = Result<{ user: UserProfileDto }>;

export interface UserDto extends UserSummaryDto {
  role: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  volunteerProfile?: VolunteerProfileSummaryDto;
}

export interface UserAnalyticsDto extends UserDto {
  permissions: string[];
  stats: {
    totalActivities: number;
    pendingRequests: number;
    approvedActivities: number;
    rejectedRequests: number;
    certificatesCount: number;
    totalHours: number;
  };
}

export interface UserActivityDto {
  id: string;
  status: ParticipationStatus;
  requestedAt: string;
  respondedAt: string | null;
  volunteerHours: number;
  activity: {
    id: string;
    title: string;
    description: string;
    date: string;
    startTime: string;
    endTime: string;
    placeName: string;
  };
}

export interface CreateAdminRequest {
  email: string;
  fullName: string;
  phone: string;
  password: string;
  permissions: string[];
}

export type GetAllUsersResponse = Result<{ users: UserAnalyticsDto[] }>;
export type GetUserDetailsResponse = Result<{ user: UserAnalyticsDto }>;
export type GetUserActivitiesResponse = Result<{ activities: UserActivityDto[] }>;

export interface UpdateUserRequest {
  email?: string;
  phone?: string;
  fullName?: string;
  password?: string;
}

export type UpdateUserResponse = Result<{
  user: Pick<UserSummaryDto, "id" | "email" | "fullName" | "phone">;
}>;

export type UpdatePermissionsResponse = Result<{ permissions: string[] }>;
export type CreateAdminResponse = Result<{
  user: Pick<UserSummaryDto, "id" | "email" | "fullName">;
}>;
export type ToggleUserActiveResponse = Result<{ isActive: boolean }>;