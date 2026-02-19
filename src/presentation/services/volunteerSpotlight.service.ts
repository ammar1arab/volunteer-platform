import { apiClient } from "./client.service";
import { API_ENDPOINTS } from "@/lib/config";
import { GetAllVolunteerSpotlightsResponse } from "@/core/application/dtos";

export const VolunteerSpotlight = {
  getVolunteerSpotlights: () => apiClient.get<GetAllVolunteerSpotlightsResponse>(API_ENDPOINTS.VOLUNTEER_SPOTLIGHT.BASE)
};
