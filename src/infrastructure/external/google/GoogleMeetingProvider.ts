import { google } from "googleapis";
import type {
  IMeetingProvider,
  MeetingAttendeeInput,
  MeetingReportResult,
  ProvisionMeetingInput,
  ProvisionMeetingResult
} from "@/core/domain/interfaces";
import { logger } from "@/lib/utils";

const SCOPE = "GoogleMeetingProvider";

const SCOPES = [
  "https://www.googleapis.com/auth/userinfo.email",
  "https://www.googleapis.com/auth/calendar.events",
  "https://www.googleapis.com/auth/meetings.space.created",
  "https://www.googleapis.com/auth/meetings.space.readonly"
];

function describeGoogleError(error: unknown): string {
  if (!error || typeof error !== "object") return String(error);
  const err = error as {
    message?: string;
    response?: { status?: number; data?: { error?: string; error_description?: string } };
  };
  const data = err.response?.data;
  return [
    err.message,
    data?.error && `google=${data.error}`,
    data?.error_description,
    err.response?.status != null && `status=${err.response.status}`
  ]
    .filter(Boolean)
    .join(" | ");
}

class GoogleMeetingProvider implements IMeetingProvider {
  private resolveRedirectUri(explicit?: string): string {
    if (explicit?.trim()) return explicit.replace(/\/$/, "");
    const configured = process.env.GOOGLE_OAUTH_REDIRECT_URI?.trim();
    if (configured) return configured.replace(/\/$/, "");
    const base = (process.env.NEXTAUTH_URL || "http://localhost:3000").replace(/\/$/, "");
    return `${base}/api/integrations/google/callback`;
  }

  private createOAuthClient(redirectUri?: string) {
    const clientId = process.env.GOOGLE_CLIENT_ID;
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
    if (!clientId || !clientSecret) {
      throw new Error("GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET are required");
    }
    return new google.auth.OAuth2(clientId, clientSecret, this.resolveRedirectUri(redirectUri));
  }

  private async authWithRefreshToken(refreshToken: string) {
    const client = this.createOAuthClient();
    client.setCredentials({ refresh_token: refreshToken });
    return client;
  }

  getAuthUrl(state: string, redirectUri?: string): string {
    const resolved = this.resolveRedirectUri(redirectUri);
    const clientId = process.env.GOOGLE_CLIENT_ID ?? "";
    logger.info(SCOPE, "getAuthUrl", {
      redirectUri: resolved,
      clientIdSuffix: clientId.slice(-12) || "missing",
      hasSecret: Boolean(process.env.GOOGLE_CLIENT_SECRET)
    });
    const client = this.createOAuthClient(redirectUri);
    return client.generateAuthUrl({
      access_type: "offline",
      prompt: "consent",
      scope: SCOPES,
      state
    });
  }

  async exchangeCode(
    code: string,
    redirectUri?: string
  ): Promise<{ refreshToken: string; email: string; scopes: string[] }> {
    const resolved = this.resolveRedirectUri(redirectUri);
    const clientId = process.env.GOOGLE_CLIENT_ID ?? "";
    logger.info(SCOPE, "exchangeCode.start", {
      redirectUri: resolved,
      clientIdSuffix: clientId.slice(-12) || "missing",
      hasCode: Boolean(code)
    });

    const client = this.createOAuthClient(redirectUri);
    let tokens;
    try {
      ({ tokens } = await client.getToken(code));
    } catch (error) {
      const detail = describeGoogleError(error);
      logger.error(SCOPE, "exchangeCode.getToken", detail);
      throw new Error(`Google token exchange failed: ${detail}`);
    }

    logger.info(SCOPE, "exchangeCode.tokens", {
      hasRefreshToken: Boolean(tokens.refresh_token),
      hasAccessToken: Boolean(tokens.access_token),
      tokenKeys: Object.keys(tokens),
      scope: tokens.scope ?? null
    });

    if (!tokens.refresh_token) {
      throw new Error("Google did not return a refresh token. Reconnect with consent prompt.");
    }

    client.setCredentials(tokens);
    try {
      const oauth2 = google.oauth2({ version: "v2", auth: client });
      const me = await oauth2.userinfo.get();
      const email = me.data.email;
      if (!email) throw new Error("Unable to resolve Google account email");

      const scopes =
        typeof tokens.scope === "string"
          ? tokens.scope.split(" ").filter(Boolean)
          : SCOPES;

      logger.info(SCOPE, "exchangeCode.success", { email, scopes });
      return { refreshToken: tokens.refresh_token, email, scopes };
    } catch (error) {
      const detail = describeGoogleError(error);
      logger.error(SCOPE, "exchangeCode.userinfo", detail);
      throw new Error(`Google userinfo failed: ${detail}`);
    }
  }

  async refreshAccessToken(refreshToken: string): Promise<{ accessToken: string; expiresAt: Date }> {
    const client = await this.authWithRefreshToken(refreshToken);
    const { credentials } = await client.refreshAccessToken();
    if (!credentials.access_token) throw new Error("Failed to refresh Google access token");
    return {
      accessToken: credentials.access_token,
      expiresAt: credentials.expiry_date ? new Date(credentials.expiry_date) : new Date(Date.now() + 3600_000)
    };
  }

  private extractMeetingResult(event: {
    id?: string | null;
    hangoutLink?: string | null;
    conferenceData?: {
      conferenceId?: string | null;
      entryPoints?: Array<{ entryPointType?: string | null; uri?: string | null }> | null;
      conferenceSolution?: { name?: string | null } | null;
    } | null;
  }): ProvisionMeetingResult {
    const externalMeetingId = event.id;
    if (!externalMeetingId) throw new Error("Google Calendar event missing id");

    const videoEntry = event.conferenceData?.entryPoints?.find((e) => e.entryPointType === "video");
    const meetingLink = event.hangoutLink || videoEntry?.uri || null;
    if (!meetingLink) throw new Error("Google Meet link was not provisioned on the calendar event");

    const meetingCode = event.conferenceData?.conferenceId ?? null;
    const meetingSpaceName = meetingCode ? `spaces/${meetingCode}` : null;

    return {
      externalMeetingId,
      meetingLink,
      meetingCode,
      meetingSpaceName
    };
  }

  private toEventBody(input: ProvisionMeetingInput) {
    return {
      summary: input.title,
      description: input.description,
      start: { dateTime: input.startDateTime, timeZone: input.timeZone },
      end: { dateTime: input.endDateTime, timeZone: input.timeZone },
      attendees: (input.attendees ?? []).map((a) => ({
        email: a.email,
        displayName: a.displayName
      })),
      conferenceData: {
        createRequest: {
          requestId: input.requestId,
          conferenceSolutionKey: { type: "hangoutsMeet" }
        }
      }
    };
  }

  async createMeeting(
    refreshToken: string,
    calendarId: string,
    input: ProvisionMeetingInput
  ): Promise<ProvisionMeetingResult> {
    const auth = await this.authWithRefreshToken(refreshToken);
    const calendar = google.calendar({ version: "v3", auth });
    const response = await calendar.events.insert({
      calendarId,
      conferenceDataVersion: 1,
      requestBody: this.toEventBody(input)
    });
    return this.extractMeetingResult(response.data);
  }

  async updateMeeting(
    refreshToken: string,
    calendarId: string,
    externalMeetingId: string,
    input: ProvisionMeetingInput
  ): Promise<ProvisionMeetingResult> {
    const auth = await this.authWithRefreshToken(refreshToken);
    const calendar = google.calendar({ version: "v3", auth });
    const response = await calendar.events.patch({
      calendarId,
      eventId: externalMeetingId,
      conferenceDataVersion: 1,
      requestBody: {
        summary: input.title,
        description: input.description,
        start: { dateTime: input.startDateTime, timeZone: input.timeZone },
        end: { dateTime: input.endDateTime, timeZone: input.timeZone },
        attendees: (input.attendees ?? []).map((a) => ({
          email: a.email,
          displayName: a.displayName
        }))
      }
    });
    return this.extractMeetingResult(response.data);
  }

  async cancelMeeting(refreshToken: string, calendarId: string, externalMeetingId: string): Promise<void> {
    const auth = await this.authWithRefreshToken(refreshToken);
    const calendar = google.calendar({ version: "v3", auth });
    try {
      await calendar.events.delete({ calendarId, eventId: externalMeetingId });
    } catch {
      await calendar.events.patch({
        calendarId,
        eventId: externalMeetingId,
        requestBody: { status: "cancelled" }
      });
    }
  }

  async syncAttendees(
    refreshToken: string,
    calendarId: string,
    externalMeetingId: string,
    attendees: MeetingAttendeeInput[]
  ): Promise<void> {
    const auth = await this.authWithRefreshToken(refreshToken);
    const calendar = google.calendar({ version: "v3", auth });
    await calendar.events.patch({
      calendarId,
      eventId: externalMeetingId,
      requestBody: {
        attendees: attendees.map((a) => ({
          email: a.email,
          displayName: a.displayName
        }))
      }
    });
  }

  async importReport(
    refreshToken: string,
    meetingCode: string,
    windowStart: string,
    windowEnd: string
  ): Promise<MeetingReportResult> {
    try {
      const auth = await this.authWithRefreshToken(refreshToken);
      const meet = google.meet({ version: "v2", auth });
      const list = await meet.conferenceRecords.list({
        filter: `space.meeting_code = "${meetingCode}" AND start_time >= "${windowStart}" AND start_time <= "${windowEnd}"`
      });

      const record = list.data.conferenceRecords?.[0];
      if (!record?.name) {
        return { conferenceId: null, startedAt: null, endedAt: null, participants: [] };
      }

      const participantsResp = await meet.conferenceRecords.participants.list({
        parent: record.name,
        pageSize: 100
      });

      const participants = [];
      for (const participant of participantsResp.data.participants ?? []) {
        if (!participant.name) continue;
        let attendedSeconds = 0;
        let firstJoinedAt: string | null = null;
        let lastLeftAt: string | null = null;

        try {
          const sessions = await meet.conferenceRecords.participants.participantSessions.list({
            parent: participant.name,
            pageSize: 100
          });
          for (const session of sessions.data.participantSessions ?? []) {
            const start = session.startTime ? new Date(session.startTime).getTime() : null;
            const end = session.endTime ? new Date(session.endTime).getTime() : null;
            if (start && end && end > start) attendedSeconds += Math.round((end - start) / 1000);
            if (session.startTime && (!firstJoinedAt || session.startTime < firstJoinedAt)) {
              firstJoinedAt = session.startTime;
            }
            if (session.endTime && (!lastLeftAt || session.endTime > lastLeftAt)) {
              lastLeftAt = session.endTime;
            }
          }
        } catch (sessionError) {
          logger.warn(SCOPE, "importReport", `session fetch failed: ${String(sessionError)}`);
        }

        const displayName =
          participant.signedinUser?.displayName ||
          participant.anonymousUser?.displayName ||
          participant.phoneUser?.displayName ||
          "Unknown";

        // Meet REST API does not reliably return emails; capture if present or if displayName is an email.
        const raw = participant as {
          signedinUser?: { displayName?: string | null; email?: string | null; user?: string | null };
        };
        const emailCandidate =
          raw.signedinUser?.email?.trim() ||
          (displayName.includes("@") ? displayName.trim() : null) ||
          null;

        participants.push({
          displayName,
          signedInEmail: emailCandidate ? emailCandidate.toLowerCase() : null,
          attendedSeconds,
          firstJoinedAt,
          lastLeftAt
        });
      }

      return {
        conferenceId: record.name,
        startedAt: record.startTime ?? null,
        endedAt: record.endTime ?? null,
        participants
      };
    } catch (error) {
      logger.warn(SCOPE, "importReport", `Meet report API failed gracefully: ${String(error)}`);
      return { conferenceId: null, startedAt: null, endedAt: null, participants: [] };
    }
  }
}

export default GoogleMeetingProvider;
