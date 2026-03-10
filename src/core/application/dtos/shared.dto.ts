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
  durationHours: number;
  activityType: string;
  placeName: string | null;
  city: string | null;
  maxVolunteers: number;
  currentVolunteers: number;
  status: string;
}
