import type { VolunteerProfile } from "@/core/domain/entities";
import type { VolunteerProfileDto } from "@/core/application/dtos";

export const toVolunteerProfileDto = (entity: VolunteerProfile): VolunteerProfileDto => ({
  id: entity.id,
  userId: entity.userId,
  city: entity.city,
  dateOfBirth: entity.dateOfBirth.toISOString(),
  profilePictureUrl: entity.profilePictureUrl,
  gender: entity.gender,
  bio: entity.bio,
  skills: entity.skills,
  interests: entity.interests,
  hasVolunteerExperience: entity.hasVolunteerExperience,
});