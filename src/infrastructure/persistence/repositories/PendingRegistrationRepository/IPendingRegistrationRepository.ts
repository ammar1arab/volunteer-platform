import { JordanianCity, Gender } from "@prisma/client";

export interface PendingRegistrationData {
  email: string;
  password: string;
  fullName: string;
  phone: string;
  city: JordanianCity;
  dateOfBirth: Date;
  gender: Gender | null;
  membershipNumber?: string | null;
  educationLevel?: string | null;
  occupation?: string | null;
  languages?: string[];
  preferredVolunteerTypes?: string[];
  skills?: string[];
  interests?: string[];
  hasVolunteerExperience?: boolean;
}

interface IPendingRegistrationRepository {
  upsert(data: PendingRegistrationData, expiresAt: Date): Promise<void>;
  findByEmail(email: string): Promise<PendingRegistrationData | null>;
  deleteByEmail(email: string): Promise<void>;
  deleteExpired(): Promise<void>;
}

export default IPendingRegistrationRepository;
