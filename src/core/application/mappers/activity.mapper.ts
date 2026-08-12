import type { Activity } from "@/core/domain/entities";
import type { ActivityDto } from "@/core/application/dtos";

type ToActivityDtoOptions = {
  includePrivateMeetingFields?: boolean;
};

export const toActivityDto = (
  entity: Activity,
  options: ToActivityDtoOptions = {}
): ActivityDto => {
  const includePrivateMeetingFields = options.includePrivateMeetingFields ?? true;
  const p = entity.toObject();
  return {
    id: p.id,
    title: p.title,
    description: p.description,
    imageUrl: p.imageUrl,
    dayOfWeek: p.dayOfWeek,
    date: p.date.toISOString(),
    startTime: p.startTime,
    endTime: p.endTime,
    durationHours: p.durationHours,
    activityType: p.activityType,
    categories: p.categories,
    maxVolunteers: p.maxVolunteers,
    currentVolunteers: p.currentVolunteers,
    status: p.status,
    isFull: entity.isFull(),
    createdBy: p.createdBy,
    isActive: p.isActive,
    createdAt: p.createdAt.toISOString(),
    updatedAt: p.updatedAt.toISOString(),
    placeName: p.placeName,
    city: p.city,
    latitude: p.latitude,
    longitude: p.longitude,
    meetingLink: includePrivateMeetingFields ? p.meetingLink : null,
    meetingPlatform: p.meetingPlatform,
    externalMeetingId: includePrivateMeetingFields ? p.externalMeetingId : null,
    meetingLinkSource: p.meetingLinkSource,
    meetingCode: includePrivateMeetingFields ? p.meetingCode : null,
    meetingSpaceName: includePrivateMeetingFields ? p.meetingSpaceName : null,
    meetingSyncStatus: p.meetingSyncStatus,
    meetingSyncError: includePrivateMeetingFields ? p.meetingSyncError : null,
    meetingSyncedAt: p.meetingSyncedAt?.toISOString() ?? null,
    timeZone: p.timeZone
  };
};

export const toActivityDtoList = (
  entities: Activity[],
  options?: ToActivityDtoOptions
): ActivityDto[] => entities.map((entity) => toActivityDto(entity, options));

