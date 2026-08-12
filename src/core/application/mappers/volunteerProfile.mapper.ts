import type { VolunteerProfile } from "@/core/domain/entities";
import type { VolunteerProfileDto } from "@/core/application/dtos";

export const toVolunteerProfileDto = (entity: VolunteerProfile): VolunteerProfileDto => ({
  id: entity.id,
  userId: entity.userId,
  city: entity.city,
  dateOfBirth: entity.dateOfBirth.toISOString(),
  profilePictureUrl: entity.profilePictureUrl,
  membershipNumber: entity.membershipNumber,
  gender: entity.gender,
  bio: entity.bio,
  skills: entity.skills,
  interests: entity.interests,
  educationLevel: entity.educationLevel,
  occupation: entity.occupation,
  languages: entity.languages,
  preferredVolunteerTypes: entity.preferredVolunteerTypes,
  hasVolunteerExperience: entity.hasVolunteerExperience,
  totalVolunteerHours: entity.totalVolunteerHours
});
