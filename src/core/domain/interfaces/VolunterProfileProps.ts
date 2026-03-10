import { Gender, JordanianCity } from "@/core/domain/enums";
import { BaseEntityProps } from "./BaseEntityProps";

export interface VolunteerProfileProps extends BaseEntityProps {
  userId: string;
  city: JordanianCity;
  dateOfBirth: Date;
  profilePictureUrl?: string | null;
  gender?: Gender | null;
  bio: string | null;
  skills: string[];
  interests?: string[];
  totalVolunteerHours: number;
  hasVolunteerExperience?: boolean;
}
