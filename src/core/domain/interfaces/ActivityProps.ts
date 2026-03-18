import { BaseEntityProps } from "./BaseEntityProps";
import {
  ActivityStatus,
  ActivityType,
  DayOfWeek,
  DomainFeaturedPostCategory,
  JordanianCity,
  MeetingPlatform
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

  // IN_PERSON
  placeName: string | null;
  city: JordanianCity | null;
  latitude: number | null;
  longitude: number | null;

  // ONLINE
  meetingLink: string | null;
  meetingPlatform: MeetingPlatform | null;
  externalMeetingId: string | null;
}
