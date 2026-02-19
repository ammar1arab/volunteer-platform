import type { VolunteerSpotlight } from "@/core/domain/entities";
import type { VolunteerSpotlightDto } from "@/core/application/dtos";

export const toVolunteerSpotlightDto = (
  entity: VolunteerSpotlight,
): VolunteerSpotlightDto => {
  const p = entity.toObject();
  return {
    id: p.id,
    imageUrl: p.imageUrl,
    name: p.name,
    description: p.description,
    spotlightDate: p.spotlightDate,
    city: p.city,
    isActive: p.isActive,
    createdAt: p.createdAt,
    updatedAt: p.updatedAt,
  };
};

export const toVolunteerSpotlightDtoList = (
  entities: VolunteerSpotlight[],
): VolunteerSpotlightDto[] => entities.map(toVolunteerSpotlightDto);
