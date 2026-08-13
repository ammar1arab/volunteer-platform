import { ActivityStatus, ActivityType, ParticipationStatus } from "@/core/domain/enums";

export type OnlineMeetingJoinState = "join" | "pending" | "hidden";

type MeetingJoinInput = {
  activityType?: string | null;
  activityStatus?: string | null;
  participationStatus?: string | null;
  meetingLink?: string | null;
};

export const canOpenMeetingLobby = ({
  activityType,
  activityStatus,
  participationStatus
}: MeetingJoinInput): boolean =>
  activityType === ActivityType.ONLINE &&
  participationStatus === ParticipationStatus.APPROVED &&
  activityStatus === ActivityStatus.PUBLISHED;

export const getOnlineMeetingJoinState = (input: MeetingJoinInput): OnlineMeetingJoinState => {
  if (!canOpenMeetingLobby(input)) return "hidden";
  return input.meetingLink?.trim() ? "join" : "pending";
};
