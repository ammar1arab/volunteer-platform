export interface ActivityParticipationDto {
  id: string;
  activityId: string;
  volunteerId: string;
  status: string;
  requestedAt: string;
  respondedAt?: string;
  volunteer?: {
    id: string;
    fullName: string;
    email: string;
    phone: string;
  };
  activity?: {
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
  };
}

export interface CreateJoinRequestResponse {
  success: boolean;
  participation?: ActivityParticipationDto;
  error?: string;
}

export interface GetJoinRequestsResponse {
  success: boolean;
  requests?: ActivityParticipationDto[];
  error?: string;
}

export interface ApproveJoinRequestResponse {
  success: boolean;
  participation?: ActivityParticipationDto;
  error?: string;
}

export interface RejectJoinRequestResponse {
  success: boolean;
  participation?: ActivityParticipationDto;
  error?: string;
}
