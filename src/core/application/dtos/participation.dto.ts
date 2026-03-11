import { AttendanceStatus, JordanianCity, ParticipationStatus } from "@/core/domain/enums";
import type { Result } from "./base.dto";
import type { UserSummaryDto, ActivitySummaryDto } from "./shared.dto";

export interface ActivityParticipationDto {
  id: string;
  activityId: string;
  volunteerId: string;
  status: ParticipationStatus;
  requestedAt: string;
  respondedAt?: string;
  attendanceStatus: string;
  volunteerHours: number | null;
  markedAt: string | null;
  volunteer?: UserSummaryDto;
  activity?: ActivitySummaryDto;
}

export interface ApprovedVolunteerRow {
  participationId: string;
  id: string;
  fullName: string;
  email: string;
  phone: string;
  profilePictureUrl: string | null;
  city: JordanianCity | null;
  dateOfBirth: Date | null;
  gender: string | null;
  attendanceStatus: AttendanceStatus;
  volunteerHours: number | null;
}

export interface MarkAttendanceRequest {
  participationId: string;
  attended: boolean;
}
export interface BulkMarkAttendanceRequest {
  items: { participationId: string; attended: boolean }[];
}

export type BulkMarkAttendanceResponse = Result<{ count: number }>;
export type CreateJoinRequestResponse = Result<{ participation: ActivityParticipationDto }>;
export type GetJoinRequestsResponse = Result<{ requests: ActivityParticipationDto[] }>;
export type ApproveJoinRequestResponse = Result<{ participation: ActivityParticipationDto }>;
export type RejectJoinRequestResponse = Result<{ participation: ActivityParticipationDto }>;
export type CancelJoinRequestResponse = Result<{ participation: ActivityParticipationDto }>;
export type MarkAttendanceResponse = Result<{ participation: ActivityParticipationDto }>;