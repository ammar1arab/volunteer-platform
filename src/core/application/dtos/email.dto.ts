import type { Result } from "./base.dto";

export type EmailAlias =
  | "contact@youthprints.online"
  | "support@youthprints.online"
  | "noreply@youthprints.online"
  | "certificates@youthprints.online";

export type EmailTarget = "ALL" | "CITY" | "GENDER";

export interface EmailRecipientFilters {
  target:        EmailTarget;
  targetValue?:  string;
  minHours?:     number;
  skillFilter?:  string;
}

export interface EmailRecipientDto {
  id:     string;
  name:   string;
  email:  string;
  city:   string | null;
  gender: string | null;
  hours:  number;
}

export interface EmailRecipientsDto {
  recipients: EmailRecipientDto[];
}

export interface SendBulkEmailInput {
  fromAlias:     EmailAlias;
  subject:       string;
  body:          string;
  filters:       EmailRecipientFilters;
  recipientIds?: string[];
}

export type GetEmailRecipientsResponse = Result<EmailRecipientsDto>;
export type SendBulkEmailApiResponse   = Result<{ sent: number }>;