import { DayOfWeek } from "@/core/domain/enums";
import type { Result } from "./base.dto";
import type { UserSummaryDto } from "./shared.dto";

// ─── Activity ─────────────────────────────────────────────────

export interface ActivityDto {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  dayOfWeek: DayOfWeek;
  date: string;
  startTime: string;
  endTime: string;
  placeName: string;
  location: { latitude: number; longitude: number; address: string };
  targetAudience: string;
  maxVolunteers: number;
  currentVolunteers: number;
  status: string;
  isFull: boolean;
  createdBy: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// ─── Create / Update ──────────────────────────────────────────

export interface CreateActivityRequest {
  title: string;
  description: string;
  imageUrl: string;
  dayOfWeek: DayOfWeek;
  date: string;
  startTime: string;
  endTime: string;
  placeName: string;
  location: { latitude: number; longitude: number; address: string };
  targetAudience: string;
  maxVolunteers: number;
}

export type UpdateActivityRequest = Partial<CreateActivityRequest>;

// ─── Responses ────────────────────────────────────────────────

export type CreateActivityResponse = Result<{ activity: ActivityDto }>;
export type UpdateActivityResponse = Result<{ activity: ActivityDto }>;
export type GetActivityResponse = Result<{ activity: ActivityDto }>;
export type GetAllActivitiesResponse = Result<{ activities: ActivityDto[] }>;
export type DeleteActivityResponse = Result<{ deleted: boolean }>;
export type PublishActivityResponse = Result<{ activity: ActivityDto }>;
export type CancelActivityResponse = Result<{ activity: ActivityDto }>;
export type RestoreActivityResponse = Result<{ activity: ActivityDto }>;

// ─── Activity Volunteers ──────────────────────────────────────

export interface ActivityVolunteerDto extends UserSummaryDto {
  profilePictureUrl?: string;
  city?: string;
  dateOfBirth?: string;
  gender?: string;
}

export type GetActivityVolunteersResponse = Result<{
  volunteers: ActivityVolunteerDto[];
}>;