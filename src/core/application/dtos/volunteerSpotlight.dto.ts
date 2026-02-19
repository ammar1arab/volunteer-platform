import { JordanianCity } from "@/core/domain/enums";
import { Result } from "./base.dto";

// ─── Volunteer Spotlight ────────────────────────────────────────────

export interface VolunteerSpotlightDto {
  id: string;
  imageUrl: string;
  name: string;
  description: string;
  spotlightDate: Date;
  city: JordanianCity;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// ─── Create / Update ──────────────────────────────────────────

export interface CreateVolunteerSpotlightRequest {
  imageUrl: string;
  name: string;
  description: string;
  spotlightDate: Date;
  city: JordanianCity;
  isActive?: boolean;
}

export type UpdateVolunteerSpotlightRequest =
  Partial<CreateVolunteerSpotlightRequest>;

// ─── Responses ────────────────────────────────────────────────

export type CreateVolunteerSpotlightResponse = Result<{
  volunteerSpotlight: VolunteerSpotlightDto;
}>;

export type UpdateVolunteerSpotlightResponse = Result<{
  volunteerSpotlight: VolunteerSpotlightDto;
}>;

export type GetVolunteerSpotlightResponse = Result<{
  volunteerSpotlight: VolunteerSpotlightDto;
}>;

export type GetAllVolunteerSpotlightsResponse = Result<{
  volunteerSpotlights: VolunteerSpotlightDto[];
}>;

export type DeleteVolunteerSpotlightResponse = Result<{
  deleted: boolean;
}>;
