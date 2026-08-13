import {
  ActivityStatus,
  ActivityType,
  MeetingIntegrationStatus,
  MeetingLinkSource,
  MeetingPlatform,
  MeetingReportStatus,
  MeetingSyncStatus
} from "@/core/domain/enums";
import type { Result } from "./base.dto";

export interface MeetingIntegrationStatusDto {
  connected: boolean;
  provider: string;
  organizerEmail: string | null;
  calendarId: string | null;
  status: MeetingIntegrationStatus | null;
  lastError: string | null;
  lastCheckedAt: string | null;
  connectedById: string | null;
  scopes: string[];
}

export type GetMeetingIntegrationStatusResponse = Result<{ integration: MeetingIntegrationStatusDto }>;
export type GetGoogleConnectUrlResponse = Result<{ url: string; state: string }>;
export type DisconnectGoogleMeetResponse = Result<{ disconnected: boolean }>;
export type HandleGoogleOAuthCallbackResponse = Result<{ connected: boolean; email: string }>;

export type OnlineMeetingFilter = "upcoming" | "finished" | "all" | "failed";

export interface MeetingReportSummaryDto {
  status: MeetingReportStatus | string;
  importedAt: string | null;
  attendeeCount: number;
  matchedCount: number;
  unmatchedCount: number;
}

export interface OnlineMeetingPresenterSummaryDto {
  presenterId: string;
  fullName: string;
  email: string;
}

export interface OnlineMeetingListItemDto {
  activityId: string;
  title: string;
  date: string;
  startTime: string;
  endTime: string;
  timeZone: string;
  status: ActivityStatus;
  activityType: ActivityType;
  meetingLink: string | null;
  meetingPlatform: MeetingPlatform | null;
  meetingLinkSource: MeetingLinkSource;
  meetingSyncStatus: MeetingSyncStatus;
  meetingSyncError: string | null;
  meetingSyncedAt: string | null;
  externalMeetingId: string | null;
  meetingCode: string | null;
  approvedCount?: number;
  presenter?: OnlineMeetingPresenterSummaryDto | null;
  reportSummary: MeetingReportSummaryDto | null;
}

export type ListOnlineMeetingsResponse = Result<{ meetings: OnlineMeetingListItemDto[] }>;
export type RetryMeetingSyncResponse = Result<{ operationId: string; activityId: string }>;
export type GetMeetingLaunchUrlResponse = Result<{
  url: string;
  title?: string;
  date?: string;
  startTime?: string;
  endTime?: string;
}>;
export type EnqueueMeetingSyncResponse = Result<{ operationId: string }>;

export interface MeetingReportAttendeeDto {
  id: string;
  displayName: string;
  signedInEmail: string | null;
  matchedUserId: string | null;
  attendedSeconds: number;
  firstJoinedAt: string | null;
  lastLeftAt: string | null;
  matchStatus: string;
}

export interface MeetingReportDto {
  activityId: string;
  conferenceId: string | null;
  startedAt: string | null;
  endedAt: string | null;
  status: MeetingReportStatus;
  lastError: string | null;
  importedAt: string | null;
  attendeeCount: number;
  matchedCount: number;
  unmatchedCount: number;
  attendees: MeetingReportAttendeeDto[];
}

export type GetMeetingReportResponse = Result<{ report: MeetingReportDto | null }>;
export type ImportMeetingReportResponse = Result<{ report: MeetingReportDto }>;
export type RequestMeetingReportImportResponse = Result<{ queued: boolean; activityId: string }>;
export type MatchMeetingAttendeeResponse = Result<{
  attendee: MeetingReportAttendeeDto;
  report: MeetingReportDto;
}>;
