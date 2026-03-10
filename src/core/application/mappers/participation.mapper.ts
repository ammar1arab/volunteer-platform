import type { ActivityParticipation } from "@/core/domain/entities";
import type { ActivityParticipationDto } from "@/core/application/dtos";
import type { UserSummaryDto, ActivitySummaryDto } from "@/core/application/dtos";

interface ParticipationMapOptions {
  volunteer?: UserSummaryDto;
  activity?: ActivitySummaryDto;
}

export const toParticipationDto = (
  entity: ActivityParticipation,
  relations?: ParticipationMapOptions
): ActivityParticipationDto => {
  const p = entity.toObject();
  return {
    id: p.id,
    activityId: p.activityId,
    volunteerId: p.volunteerId,
    status: p.status,
    requestedAt: p.requestedAt.toISOString(),
    respondedAt: p.respondedAt?.toISOString(),
    attendanceStatus: p.attendanceStatus,
    volunteerHours: p.volunteerHours,
    markedAt: p.markedAt?.toISOString() ?? null,
    ...(relations?.volunteer && { volunteer: relations.volunteer }),
    ...(relations?.activity && { activity: relations.activity })
  };
};