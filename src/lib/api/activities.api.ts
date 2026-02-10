import { apiClient, API_ENDPOINTS } from "@/lib";
import type {
  CreateActivityRequest,
  CreateActivityResponse,
  UpdateActivityRequest,
  UpdateActivityResponse,
  GetActivityResponse,
  GetAllActivitiesResponse,
  DeleteActivityResponse,
  PublishActivityResponse,
  CancelActivityResponse,
  RestoreActivityResponse,
  GetActivityVolunteersResponse,
} from "@/core/application/dtos";

export const activityApi = {
  getAll: () =>
    apiClient.get<GetAllActivitiesResponse>(API_ENDPOINTS.ACTIVITIES.BASE),

  getPublished: () =>
    apiClient.get<GetAllActivitiesResponse>(API_ENDPOINTS.ACTIVITIES.PUBLISHED),

  getOne: (id: string) =>
    apiClient.get<GetActivityResponse>(API_ENDPOINTS.ACTIVITIES.BY_ID(id)),

  create: (payload: CreateActivityRequest) =>
    apiClient.post<CreateActivityResponse>(
      API_ENDPOINTS.ACTIVITIES.BASE,
      payload
    ),

  update: (id: string, payload: UpdateActivityRequest) =>
    apiClient.put<UpdateActivityResponse>(
      API_ENDPOINTS.ACTIVITIES.BY_ID(id),
      payload
    ),

  delete: (id: string) =>
    apiClient.delete<DeleteActivityResponse>(
      API_ENDPOINTS.ACTIVITIES.BY_ID(id)
    ),

  publish: (id: string) =>
    apiClient.post<PublishActivityResponse>(
      API_ENDPOINTS.ACTIVITIES.PUBLISH(id)
    ),

  cancel: (id: string) =>
    apiClient.post<CancelActivityResponse>(API_ENDPOINTS.ACTIVITIES.CANCEL(id)),
  restore: (id: string) =>
    apiClient.post<RestoreActivityResponse>(`/api/activities/${id}/restore`),

  getVolunteers: (id: string) =>
    apiClient.get<GetActivityVolunteersResponse>(
      `/api/activities/${id}/volunteers`
    ),
};
