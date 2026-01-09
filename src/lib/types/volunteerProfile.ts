import { JordanianCity, Gender } from "@/core/domain/enums";

export interface VolunteerProfile {
  id: string;
  userId: string;
  city: JordanianCity;
  dateOfBirth: string;
  profilePictureUrl?: string | null;
  gender?: Gender | null;
  bio?: string | null;
  skills: string[];
  interests: string[];
  hasVolunteerExperience: boolean;
}

export interface UpdateVolunteerProfileData {
  city?: JordanianCity;
  dateOfBirth?: string;
  gender?: Gender;
  bio?: string;
  skills?: string[];
  interests?: string[];
  hasVolunteerExperience?: boolean;
}