import {
  DayOfWeek,
  ActivityType,
  DomainFeaturedPostCategory,
  JordanianCity,
  AttendanceStatus,
  MeetingPlatform,
  ActivityStatus,
  MeetingLinkSource,
  MeetingSyncStatus
} from "@/core/domain/enums";
import type { Result } from "./base.dto";

export interface ActivityDto {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  dayOfWeek: DayOfWeek;
  date: string;
  startTime: string;
  endTime: string;
  durationHours: number;
  activityType: ActivityType;
  categories: DomainFeaturedPostCategory[];
  maxVolunteers: number;
  currentVolunteers: number;
  status: ActivityStatus;
  isFull: boolean;
  createdBy: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;

  placeName: string | null;
  city: JordanianCity | null;
  latitude: number | null;
  longitude: number | null;

  meetingLink: string | null;
  meetingPlatform: MeetingPlatform | null;
  externalMeetingId: string | null;
  meetingLinkSource?: MeetingLinkSource;
  meetingCode?: string | null;
  meetingSpaceName?: string | null;
  meetingSyncStatus?: MeetingSyncStatus;
  meetingSyncError?: string | null;
  meetingSyncedAt?: string | null;
  timeZone?: string;
  /** Primary presenter volunteer user id (online activities). */
  primaryPresenterId?: string | null;
}

export interface CreateActivityRequest {
  title: string;
  description: string;
  imageUrl: string;
  dayOfWeek: DayOfWeek;
  date: string;
  startTime: string;
  endTime: string;
  durationHours: number;
  activityType: ActivityType;
  categories: DomainFeaturedPostCategory[];
  maxVolunteers: number;

  placeName?: string;
  city: JordanianCity | null;
  latitude?: number;
  longitude?: number;

  meetingLink?: string;
  meetingPlatform?: MeetingPlatform;
  externalMeetingId?: string;
  meetingLinkSource?: MeetingLinkSource;
  meetingCode?: string | null;
  meetingSpaceName?: string | null;
  meetingSyncStatus?: MeetingSyncStatus;
  meetingSyncError?: string | null;
  meetingSyncedAt?: string | null;
  timeZone?: string;
  /** Assign primary presenter (volunteer) for online activities. */
  primaryPresenterId?: string | null;
}

export type UpdateActivityRequest = Partial<CreateActivityRequest>;

export type CreateActivityResponse = Result<{ activity: ActivityDto }>;
export type UpdateActivityResponse = Result<{ activity: ActivityDto }>;
export type GetActivityResponse = Result<{ activity: ActivityDto }>;
export type GetAllActivitiesResponse = Result<{ activities: ActivityDto[] }>;
export type DeleteActivityResponse = Result<{ deleted: boolean }>;
export type PublishActivityResponse = Result<{ activity: ActivityDto }>;
export type CancelActivityResponse = Result<{ activity: ActivityDto }>;
export type RestoreActivityResponse = Result<{ activity: ActivityDto }>;
export type CompleteActivityResponse = Result<{ activity: ActivityDto }>;

export interface ActivityVolunteerDto {
  participationId: string;
  id: string;
  fullName: string;
  email: string;
  phone: string;
  profilePictureUrl?: string | null;
  city?: JordanianCity | null;
  dateOfBirth?: string | null;
  gender?: string | null;
  attendanceStatus: AttendanceStatus;
  volunteerHours: number | null;
}

export type GetActivityVolunteersResponse = Result<{ volunteers: ActivityVolunteerDto[] }>;
