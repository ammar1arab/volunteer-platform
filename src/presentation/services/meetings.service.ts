import { apiClient } from "./client.service";
import { API_ENDPOINTS } from "@/lib/config";
import type { Result } from "@/core/application/dtos";
import type {
  MeetingIntegrationStatus,
  MeetingLinkSource,
  MeetingReportStatus,
  MeetingSyncStatus
} from "@/core/domain/enums";

export type MeetingsFilter = "upcoming" | "finished" | "all" | "failed";

export type GoogleIntegrationStatusDto = {
  connected: boolean;
  status: MeetingIntegrationStatus | string;
  organizerEmail: string;
  scopes: string[];
  lastError: string | null;
  lastCheckedAt: string | null;
  connectedAt?: string | null;
};

export type MeetingReportSummaryDto = {
  status: MeetingReportStatus | string;
  importedAt: string | null;
  attendeeCount: number;
  matchedCount: number;
  unmatchedCount: number;
};

export type MeetingListItemDto = {
  activityId: string;
  title: string;
  date: string;
  startTime: string;
  endTime: string;
  meetingLinkSource: MeetingLinkSource | string;
  meetingSyncStatus: MeetingSyncStatus | string;
  meetingSyncError: string | null;
  meetingLink: string | null;
  meetingPlatform?: string | null;
  approvedCount?: number | null;
  activityStatus?: string | null;
  meetingCode?: string | null;
  presenter?: {
    presenterId: string;
    fullName: string;
    email: string;
  } | null;
  reportSummary?: MeetingReportSummaryDto | null;
};

export type MeetingLaunchDto = {
  url: string;
  title?: string;
  date?: string;
  startTime?: string;
  endTime?: string;
};

export type MeetingReportAttendeeDto = {
  id: string;
  displayName: string;
  signedInEmail: string | null;
  matchedUserId: string | null;
  attendedSeconds: number;
  firstJoinedAt: string | null;
  lastLeftAt: string | null;
  matchStatus: string;
};

export type MeetingReportDto = {
  activityId: string;
  conferenceId: string | null;
  startedAt: string | null;
  endedAt: string | null;
  status: MeetingReportStatus | string;
  lastError: string | null;
  importedAt: string | null;
  attendeeCount: number;
  matchedCount: number;
  unmatchedCount: number;
  attendees: MeetingReportAttendeeDto[];
};

export type GetGoogleStatusResponse = Result<{ integration: GoogleIntegrationStatusDto }>;
export type GetGoogleConnectResponse = Result<{ url: string; state?: string }>;
export type DisconnectGoogleResponse = Result<{ disconnected: boolean }>;
export type GetMeetingsResponse = Result<{ meetings: MeetingListItemDto[] }>;
export type RetryMeetingSyncResponse = Result<{ operationId: string; activityId: string }>;
export type LaunchMeetingResponse = Result<MeetingLaunchDto>;
export type GetMeetingReportResponse = Result<{ report: MeetingReportDto | null }>;
export type ImportMeetingReportResponse = Result<{ report: MeetingReportDto }>;
export type MatchMeetingAttendeeResponse = Result<{
  attendee: MeetingReportAttendeeDto;
  report: MeetingReportDto;
}>;

export const meetingsApi = {
  getGoogleStatus: () =>
    apiClient.get<GetGoogleStatusResponse>(API_ENDPOINTS.INTEGRATIONS.GOOGLE.STATUS),

  getGoogleConnectUrl: () =>
    apiClient.get<GetGoogleConnectResponse>(API_ENDPOINTS.INTEGRATIONS.GOOGLE.CONNECT),

  disconnectGoogle: () =>
    apiClient.post<DisconnectGoogleResponse>(API_ENDPOINTS.INTEGRATIONS.GOOGLE.DISCONNECT),

  getMeetings: (filter: MeetingsFilter = "upcoming") =>
    apiClient.get<GetMeetingsResponse>(API_ENDPOINTS.MEETINGS.LIST(filter)),

  retrySync: (activityId: string) =>
    apiClient.post<RetryMeetingSyncResponse>(API_ENDPOINTS.MEETINGS.RETRY(activityId)),

  getLaunchUrl: (activityId: string) =>
    apiClient.get<LaunchMeetingResponse>(API_ENDPOINTS.MEETINGS.LAUNCH(activityId)),

  getReport: (activityId: string) =>
    apiClient.get<GetMeetingReportResponse>(API_ENDPOINTS.MEETINGS.REPORT(activityId)),

  importReport: (activityId: string) =>
    apiClient.post<ImportMeetingReportResponse>(API_ENDPOINTS.MEETINGS.IMPORT_REPORT(activityId)),

  matchAttendee: (activityId: string, attendeeId: string, userId: string | null) =>
    apiClient.patch<MatchMeetingAttendeeResponse>(
      API_ENDPOINTS.MEETINGS.MATCH_ATTENDEE(activityId, attendeeId),
      { userId }
    )
};
