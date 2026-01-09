import { DayOfWeek } from "@/core/domain/enums";

export interface ActivityDto {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  dayOfWeek: DayOfWeek;
  date: string;
  startTime: string;
  endTime: string;
  placeName: string;
  location: {
    latitude: number;
    longitude: number;
    address: string;
  };
  targetAudience: string;
  maxVolunteers: number;
  currentVolunteers: number;
  status: string;
  isFull: boolean;
  createdBy: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateActivityRequest {
  title: string;
  description: string;
  imageUrl: string;
  dayOfWeek: DayOfWeek;
  date: string;
  startTime: string;
  endTime: string;
  placeName: string;
  location: {
    latitude: number;
    longitude: number;
    address: string;
  };
  targetAudience: string;
  maxVolunteers: number;
}

export interface CreateActivityResponse {
  success: boolean;
  activity?: ActivityDto;
  error?: string;
}

export interface UpdateActivityRequest {
  title?: string;
  description?: string;
  imageUrl?: string;
  dayOfWeek?: DayOfWeek;
  date?: string;
  startTime?: string;
  endTime?: string;
  placeName?: string;
  location?: {
    latitude: number;
    longitude: number;
    address: string;
  };
  targetAudience?: string;
  maxVolunteers?: number;
}

export interface UpdateActivityResponse {
  success: boolean;
  activity?: ActivityDto;
  error?: string;
}

export interface GetActivityResponse {
  success: boolean;
  activity?: ActivityDto;
  error?: string;
}

export interface GetAllActivitiesResponse {
  success: boolean;
  activities?: ActivityDto[];
  error?: string;
}

export interface DeleteActivityResponse {
  success: boolean;
  deleted?: boolean;
  error?: string;
}

export interface PublishActivityResponse {
  success: boolean;
  activity?: ActivityDto;
  error?: string;
}

export interface CancelActivityResponse {
  success: boolean;
  activity?: ActivityDto;
  error?: string;
}


// Volunteer info for activity
export interface ActivityVolunteerDto {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  profilePictureUrl?: string;
  city?: string;
  dateOfBirth?: string;
  gender?: string;
}

// Response for getting activity volunteers
export interface GetActivityVolunteersResponse {
  success: boolean;
  volunteers?: ActivityVolunteerDto[];
  error?: string;
}

// Response for restoring activity
export interface RestoreActivityResponse {
  success: boolean;
  activity?: ActivityDto;
  error?: string;
}