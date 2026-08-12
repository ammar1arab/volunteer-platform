import { BaseEntityProps } from "./BaseEntityProps";
import { MeetingIntegrationStatus } from "@/core/domain/enums";

export interface MeetingIntegrationProps extends BaseEntityProps {
  provider: string;
  organizerEmail: string;
  calendarId: string;
  encryptedRefreshToken: string;
  scopes: string[];
  status: MeetingIntegrationStatus;
  lastError: string | null;
  lastCheckedAt: Date | null;
  connectedById: string | null;
}
