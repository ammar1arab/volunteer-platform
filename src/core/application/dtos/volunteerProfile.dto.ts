import { JordanianCity, Gender } from "@/core/domain/enums";

// ========== GET PROFILE ==========
export interface GetVolunteerProfileRequest {
  userId: string;
}

export interface GetVolunteerProfileResponse {
  success: boolean;
  profile?: {
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
  };
  error?: string;
}

// ========== UPDATE PROFILE ==========
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

export interface UpdateVolunteerProfileResponse {
  success: boolean;
  profile?: {
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
  };
  error?: string;
}

// ========== UPLOAD PROFILE PICTURE ==========
export interface UploadProfilePictureRequest {
  userId: string;
  file: File;
}

export interface UploadProfilePictureResponse {
  success: boolean;
  imageUrl?: string;
  error?: string;
}