import type { User, Activity } from "@/core/domain/entities";
import type { UserSummaryDto, ActivitySummaryDto } from "@/core/application/dtos";

export const toUserSummaryDto = (user: User): UserSummaryDto => ({
  id: user.id,
  fullName: user.fullName,
  email: user.email,
  phone: user.phone
});

export function toActivitySummaryDto(activity: Activity): ActivitySummaryDto {
  return {
    id: activity.id,
    title: activity.title,
    description: activity.description,
    date: activity.date.toISOString(),
    startTime: activity.startTime,
    endTime: activity.endTime,
    durationHours: activity.durationHours,
    activityType: activity.activityType,
    status: activity.status,
    maxVolunteers: activity.maxVolunteers,
    currentVolunteers: activity.currentVolunteers,
    placeName: activity.placeName ?? null,
    city: activity.city ?? null,
    latitude: activity.latitude ?? null,
    longitude: activity.longitude ?? null,
    meetingLink: activity.meetingLink ?? null,
    meetingPlatform: activity.meetingPlatform ?? null,
    externalMeetingId: activity.externalMeetingId ?? null,
  };
}
