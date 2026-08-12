import { BaseEntityProps } from "./BaseEntityProps";
import {
  ActivityStatus,
  ActivityType,
  DayOfWeek,
  DomainFeaturedPostCategory,
  JordanianCity,
  MeetingPlatform,
  MeetingLinkSource,
  MeetingSyncStatus
} from "@/core/domain/enums";

export interface ActivityProps extends BaseEntityProps {
  title: string;
  description: string;
  imageUrl: string;
  dayOfWeek: DayOfWeek;
  date: Date;
  startTime: string;
  endTime: string;
  durationHours: number;
  maxVolunteers: number;
  currentVolunteers: number;
  status: ActivityStatus;
  activityType: ActivityType;
  categories: DomainFeaturedPostCategory[];
  createdBy: string;
  deletedAt: Date | null;


  placeName: string | null;
  city: JordanianCity | null;
  latitude: number | null;
  longitude: number | null;


  meetingLink: string | null;
  meetingPlatform: MeetingPlatform | null;
  externalMeetingId: string | null;
  meetingLinkSource: MeetingLinkSource;
  meetingCode: string | null;
  meetingSpaceName: string | null;
  meetingSyncStatus: MeetingSyncStatus;
  meetingSyncError: string | null;
  meetingSyncedAt: Date | null;
  timeZone: string;
}
