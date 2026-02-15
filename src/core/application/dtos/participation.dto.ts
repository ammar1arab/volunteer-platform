import type { Result } from "./base.dto";
import type { UserSummaryDto, ActivitySummaryDto } from "./shared.dto";

// ─── Participation ────────────────────────────────────────────

export interface ActivityParticipationDto {
  id: string;
  activityId: string;
  volunteerId: string;
  status: string;
  requestedAt: string;
  respondedAt?: string;
  volunteer?: UserSummaryDto;
  activity?: ActivitySummaryDto;
}

// ─── Responses ────────────────────────────────────────────────

export type CreateJoinRequestResponse = Result<{ participation: ActivityParticipationDto }>;
export type GetJoinRequestsResponse = Result<{ requests: ActivityParticipationDto[] }>;
export type ApproveJoinRequestResponse = Result<{ participation: ActivityParticipationDto }>;
export type RejectJoinRequestResponse = Result<{ participation: ActivityParticipationDto }>;