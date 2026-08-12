import { BaseEntity } from "@/core/domain/entities";
import { MeetingIntegrationProps } from "@/core/domain/interfaces";
import { MeetingIntegrationStatus } from "@/core/domain/enums";

class MeetingIntegration extends BaseEntity {
  private props: MeetingIntegrationProps;

  constructor(props: MeetingIntegrationProps) {
    super(props.id, props.createdAt, props.updatedAt, props.isActive ?? true);

    if (!props.organizerEmail?.trim()) throw new Error("Organizer email is required");
    if (!props.encryptedRefreshToken?.trim()) throw new Error("Refresh token is required");

    this.props = {
      ...props,
      provider: props.provider?.trim() || "GOOGLE_MEET",
      organizerEmail: props.organizerEmail.trim(),
      calendarId: props.calendarId?.trim() || "primary",
      encryptedRefreshToken: props.encryptedRefreshToken.trim(),
      scopes: props.scopes ?? [],
      status: props.status ?? MeetingIntegrationStatus.CONNECTED,
      lastError: props.lastError ?? null,
      lastCheckedAt: props.lastCheckedAt ?? null,
      connectedById: props.connectedById ?? null
    };
  }

  static create(input: {
    organizerEmail: string;
    encryptedRefreshToken: string;
    scopes?: string[];
    calendarId?: string;
    connectedById?: string | null;
    provider?: string;
  }): MeetingIntegration {
    return new MeetingIntegration({
      id: crypto.randomUUID(),
      provider: input.provider ?? "GOOGLE_MEET",
      organizerEmail: input.organizerEmail,
      calendarId: input.calendarId ?? "primary",
      encryptedRefreshToken: input.encryptedRefreshToken,
      scopes: input.scopes ?? [],
      status: MeetingIntegrationStatus.CONNECTED,
      lastError: null,
      lastCheckedAt: new Date(),
      connectedById: input.connectedById ?? null,
      createdAt: new Date(),
      updatedAt: new Date(),
      isActive: true
    });
  }

  static reconstitute(props: MeetingIntegrationProps): MeetingIntegration {
    return new MeetingIntegration(props);
  }

  markConnected(input: {
    organizerEmail: string;
    encryptedRefreshToken: string;
    scopes: string[];
    connectedById?: string | null;
  }): void {
    this.props.organizerEmail = input.organizerEmail.trim();
    this.props.encryptedRefreshToken = input.encryptedRefreshToken.trim();
    this.props.scopes = input.scopes;
    this.props.status = MeetingIntegrationStatus.CONNECTED;
    this.props.lastError = null;
    this.props.lastCheckedAt = new Date();
    if (input.connectedById !== undefined) this.props.connectedById = input.connectedById;
    this.touch();
  }

  markDisconnected(): void {
    this.props.status = MeetingIntegrationStatus.DISCONNECTED;
    this.props.encryptedRefreshToken = "";
    this.props.lastError = null;
    this.props.lastCheckedAt = new Date();
    this.touch();
  }

  markError(reason: string): void {
    this.props.status = MeetingIntegrationStatus.ERROR;
    this.props.lastError = reason.slice(0, 500);
    this.props.lastCheckedAt = new Date();
    this.touch();
  }

  markNeedsReauth(reason?: string): void {
    this.props.status = MeetingIntegrationStatus.NEEDS_REAUTH;
    this.props.lastError = reason?.slice(0, 500) ?? null;
    this.props.lastCheckedAt = new Date();
    this.touch();
  }

  get provider(): string {
    return this.props.provider;
  }
  get organizerEmail(): string {
    return this.props.organizerEmail;
  }
  get calendarId(): string {
    return this.props.calendarId;
  }
  get encryptedRefreshToken(): string {
    return this.props.encryptedRefreshToken;
  }
  get scopes(): string[] {
    return this.props.scopes;
  }
  get status(): MeetingIntegrationStatus {
    return this.props.status;
  }
  get lastError(): string | null {
    return this.props.lastError;
  }
  get lastCheckedAt(): Date | null {
    return this.props.lastCheckedAt;
  }
  get connectedById(): string | null {
    return this.props.connectedById;
  }

  toObject(): MeetingIntegrationProps {
    return {
      ...this.props,
      id: this.id,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
      isActive: this.isActive
    };
  }
}

export default MeetingIntegration;
