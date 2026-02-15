import type { User, Activity } from "@/core/domain/entities";
import type { UserSummaryDto, ActivitySummaryDto } from "@/core/application/dtos";

export const toUserSummaryDto = (user: User): UserSummaryDto => ({
  id: user.id,
  fullName: user.fullName,
  email: user.email,
  phone: user.phone,
});

export const toActivitySummaryDto = (entity: Activity): ActivitySummaryDto => {
  const p = entity.toObject();
  return {
    id: p.id,
    title: p.title,
    description: p.description,
    date: p.date.toISOString(),
    startTime: p.startTime,
    endTime: p.endTime,
    placeName: p.placeName,
    address: p.location.address,
    targetAudience: p.targetAudience,
    maxVolunteers: p.maxVolunteers,
    currentVolunteers: p.currentVolunteers,
    status: p.status,
  };
};