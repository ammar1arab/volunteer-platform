import { JordanianCity, Gender, EducationLevel } from "@/core/domain/enums";
import type { Result } from "./base.dto";

export interface VolunteerProfileDto {
  id: string;
  userId: string;
  city: JordanianCity;
  dateOfBirth: string;
  profilePictureUrl?: string | null;
  membershipNumber?: string | null;
  gender?: string | null;
  bio?: string | null;
  skills: string[];
  interests: string[];
  educationLevel?: string | null;
  occupation?: string | null;
  languages: string[];
  preferredVolunteerTypes: string[];
  hasVolunteerExperience: boolean;
  totalVolunteerHours: number;
}

export interface UpdateVolunteerProfileRequest {
  userId: string;
  city?: JordanianCity;
  dateOfBirth?: Date;
  profilePictureUrl?: string;
  membershipNumber?: string | null;
  gender?: Gender;
  bio?: string;
  skills?: string[];
  interests?: string[];
  educationLevel?: EducationLevel | null;
  occupation?: string | null;
  languages?: string[];
  preferredVolunteerTypes?: string[];
  hasVolunteerExperience?: boolean;
}

export interface UploadProfilePictureRequest {
  userId: string;
  file: File;
}

export type GetVolunteerProfileResponse = Result<{ profile: VolunteerProfileDto }>;
export type UpdateVolunteerProfileResponse = Result<{ profile: VolunteerProfileDto }>;
export type UploadProfilePictureResponse = Result<{ imageUrl: string }>;
