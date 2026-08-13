export interface MeetingAttendeeInput {
  email: string;
  displayName?: string;
}

export interface ProvisionMeetingInput {
  activityId: string;
  title: string;
  description: string;
  startDateTime: string; // ISO
  endDateTime: string;
  timeZone: string;
  requestId: string;
  attendees?: MeetingAttendeeInput[];
}

export interface ProvisionMeetingResult {
  externalMeetingId: string;
  meetingLink: string;
  meetingCode: string | null;
  meetingSpaceName: string | null;
}

export interface MeetingReportParticipant {
  displayName: string;
  signedInEmail: string | null;
  attendedSeconds: number;
  firstJoinedAt: string | null;
  lastLeftAt: string | null;
}

export interface MeetingReportResult {
  conferenceId: string | null;
  startedAt: string | null;
  endedAt: string | null;
  participants: MeetingReportParticipant[];
}

export interface IMeetingProvider {
  getAuthUrl(state: string, redirectUri?: string): string;
  exchangeCode(
    code: string,
    redirectUri?: string
  ): Promise<{ refreshToken: string | null; email: string; scopes: string[] }>;
  revokeToken(refreshToken: string): Promise<void>;
  refreshAccessToken(refreshToken: string): Promise<{ accessToken: string; expiresAt: Date }>;
  createMeeting(
    refreshToken: string,
    calendarId: string,
    input: ProvisionMeetingInput
  ): Promise<ProvisionMeetingResult>;
  updateMeeting(
    refreshToken: string,
    calendarId: string,
    externalMeetingId: string,
    input: ProvisionMeetingInput
  ): Promise<ProvisionMeetingResult>;
  cancelMeeting(refreshToken: string, calendarId: string, externalMeetingId: string): Promise<void>;
  syncAttendees(
    refreshToken: string,
    calendarId: string,
    externalMeetingId: string,
    attendees: MeetingAttendeeInput[]
  ): Promise<void>;
  importReport(
    refreshToken: string,
    meetingCode: string,
    windowStart: string,
    windowEnd: string
  ): Promise<MeetingReportResult>;
}
