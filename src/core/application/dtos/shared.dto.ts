export interface UserSummaryDto {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  city?: string;
}

export interface VolunteerProfileSummaryDto {
  profilePictureUrl?: string;
  city?: string;
  dateOfBirth?: string;
  gender?: string;
  bio?: string;
  skills?: string[];
  interests?: string[];
}

export interface ActivitySummaryDto {
  id: string;
  title: string;
  description: string;
  date: string;
  startTime: string;
  endTime: string;
  placeName: string;
  address: string;
  targetAudience: string;
  maxVolunteers: number;
  currentVolunteers: number;
  status: string;
}

export interface ApprovedVolunteerRow {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  profilePictureUrl: string | null;
  city: string | null;
  dateOfBirth: Date | null;
  gender: string | null;
}