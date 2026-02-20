import { apiClient } from "./client.service";
import { API_ENDPOINTS } from "@/lib/config";
import type {
  CreateVolunteerSpotlightRequest,
  CreateVolunteerSpotlightResponse,
  UpdateVolunteerSpotlightRequest,
  UpdateVolunteerSpotlightResponse,
  GetVolunteerSpotlightResponse,
  GetAllVolunteerSpotlightsResponse,
  DeleteVolunteerSpotlightResponse
} from "@/core/application/dtos";

export const volunteerSpotlightApi = {
  getAll: () => apiClient.get<GetAllVolunteerSpotlightsResponse>(API_ENDPOINTS.VOLUNTEER_SPOTLIGHT.BASE),

  getOne: (id: string) => apiClient.get<GetVolunteerSpotlightResponse>(API_ENDPOINTS.VOLUNTEER_SPOTLIGHT.BY_ID(id)),

  create: (data: CreateVolunteerSpotlightRequest) =>
    apiClient.post<CreateVolunteerSpotlightResponse>(API_ENDPOINTS.VOLUNTEER_SPOTLIGHT.BASE, data),

  update: (id: string, data: UpdateVolunteerSpotlightRequest) =>
    apiClient.put<UpdateVolunteerSpotlightResponse>(API_ENDPOINTS.VOLUNTEER_SPOTLIGHT.BY_ID(id), data),

  delete: (id: string) =>
    apiClient.delete<DeleteVolunteerSpotlightResponse>(API_ENDPOINTS.VOLUNTEER_SPOTLIGHT.BY_ID(id))
};
