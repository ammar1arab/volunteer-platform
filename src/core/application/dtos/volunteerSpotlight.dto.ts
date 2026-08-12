import { JordanianCity } from "@/core/domain/enums";
import { Result } from "./base.dto";



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
