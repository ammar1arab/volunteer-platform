import { JordanianCity, Gender } from "@/core/domain/enums";
import type { Result } from "./base.dto";

// ─── Volunteer Profile ────────────────────────────────────────

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
}

export type GetVolunteerProfileResponse = Result<{ profile: VolunteerProfileDto }>;

// ─── Update Profile ───────────────────────────────────────────

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

export type UpdateVolunteerProfileResponse = Result<{ profile: VolunteerProfileDto }>;

// ─── Upload Picture ───────────────────────────────────────────

export interface UploadProfilePictureRequest {
  userId: string;
  file: File;
}

export type UploadProfilePictureResponse = Result<{ imageUrl: string }>;