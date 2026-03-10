import { JordanianCity, Gender } from "@/core/domain/enums";
import type { Result } from "./base.dto";

export interface VolunteerProfileDto {
  id: string;
  userId: string;
  city: string;
  dateOfBirth: string;
  profilePictureUrl?: string | null;
  gender?: string | null;
  bio?: string | null;
  skills: string[];
  interests: string[];
  hasVolunteerExperience: boolean;
  totalVolunteerHours: number;
}

export interface UpdateVolunteerProfileRequest {
  userId: string;
  city?: JordanianCity;
  dateOfBirth?: Date;
  profilePictureUrl?: string;
  gender?: Gender;
  bio?: string;
  skills?: string[];
  interests?: string[];
  hasVolunteerExperience?: boolean;
}

export interface UploadProfilePictureRequest {
  userId: string;
  file: File;
}

export type GetVolunteerProfileResponse = Result<{ profile: VolunteerProfileDto }>;
export type UpdateVolunteerProfileResponse = Result<{ profile: VolunteerProfileDto }>;
export type UploadProfilePictureResponse = Result<{ imageUrl: string }>;