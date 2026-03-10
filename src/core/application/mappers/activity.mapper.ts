import type { Activity } from "@/core/domain/entities";
import type { ActivityDto } from "@/core/application/dtos";

export const toActivityDto = (entity: Activity): ActivityDto => {
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
    meetingLink: p.meetingLink,
    meetingPlatform: p.meetingPlatform,
    externalMeetingId: p.externalMeetingId
  };
};

export const toActivityDtoList = (entities: Activity[]): ActivityDto[] =>
  entities.map(toActivityDto);