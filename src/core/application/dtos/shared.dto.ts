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
  status: string;
  maxVolunteers: number;
  currentVolunteers: number;
  // IN_PERSON
  placeName: string | null;
  city: string | null;
  latitude: number | null;
  longitude: number | null;
  // ONLINE
  meetingLink: string | null;
  meetingPlatform: string | null;
  externalMeetingId: string | null;
}
