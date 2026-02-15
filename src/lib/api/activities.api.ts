import { apiClient } from "./client.api";
import { API_ENDPOINTS } from "@/lib";
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
  create: (data: CreateActivityRequest) =>
    apiClient.post<CreateActivityResponse>(API_ENDPOINTS.ACTIVITIES.BASE, data),
  update: (id: string, data: UpdateActivityRequest) =>
    apiClient.put<UpdateActivityResponse>(
      API_ENDPOINTS.ACTIVITIES.BY_ID(id),
      data,
    ),
  delete: (id: string) =>
    apiClient.delete<DeleteActivityResponse>(
      API_ENDPOINTS.ACTIVITIES.BY_ID(id),
    ),
  publish: (id: string) =>
    apiClient.post<PublishActivityResponse>(
      API_ENDPOINTS.ACTIVITIES.PUBLISH(id),
    ),
  cancel: (id: string) =>
    apiClient.post<CancelActivityResponse>(API_ENDPOINTS.ACTIVITIES.CANCEL(id)),
  restore: (id: string) =>
    apiClient.post<RestoreActivityResponse>(
      API_ENDPOINTS.ACTIVITIES.RESTORE(id),
    ),
  getVolunteers: (id: string) =>
    apiClient.get<GetActivityVolunteersResponse>(
      API_ENDPOINTS.ACTIVITIES.VOLUNTEERS(id),
    ),
};
