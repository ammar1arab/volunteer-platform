import { BaseEntityProps } from "./BaseEntityProps";

export interface ActivityParticipationProps extends BaseEntityProps {
  activityId: string;
  volunteerId: string;
  status: string;
  requestedAt: Date;
  respondedAt?: Date;
}