export interface UserSummaryDto {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  city?: string;
}

export interface VolunteerProfileSummaryDto {
  profilePictureUrl?: string;
  membershipNumber?: string;
  city?: string;
  dateOfBirth?: string;
  gender?: string;
  bio?: string;
  skills?: string[];
  interests?: string[];
  educationLevel?: string;
  occupation?: string;
  languages?: string[];
  preferredVolunteerTypes?: string[];
  hasVolunteerExperience?: boolean;
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
