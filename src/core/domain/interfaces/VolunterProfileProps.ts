import { Gender, JordanianCity, EducationLevel } from "@/core/domain/enums";
import { BaseEntityProps } from "./BaseEntityProps";

export interface VolunteerProfileProps extends BaseEntityProps {
  userId: string;
  city: JordanianCity;
  dateOfBirth: Date;
  profilePictureUrl?: string | null;
  membershipNumber?: string | null;
  gender?: Gender | null;
  bio: string | null;
  skills: string[];
  interests?: string[];
  educationLevel?: EducationLevel | null;
  occupation?: string | null;
  languages?: string[];
  preferredVolunteerTypes?: string[];
  totalVolunteerHours: number;
  hasVolunteerExperience?: boolean;
}
