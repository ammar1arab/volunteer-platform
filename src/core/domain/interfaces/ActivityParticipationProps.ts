import { BaseEntityProps } from "./BaseEntityProps";
import { AttendanceStatus, ParticipationStatus } from "@/core/domain/enums";

export interface ActivityParticipationProps extends BaseEntityProps {
  activityId: string;
  volunteerId: string;
  requestedAt: Date;
  respondedAt?: Date;
  
  status: ParticipationStatus;
  attendanceStatus: AttendanceStatus;
  volunteerHours: number | null;
  markedAt: Date | null;
}
