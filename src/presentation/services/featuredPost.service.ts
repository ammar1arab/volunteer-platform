import { apiClient } from "./client.service";
import { API_ENDPOINTS } from "@/lib/config";
import type {
  CreateFeaturedPostRequest,
  CreateFeaturedPostResponse,
  UpdateFeaturedPostRequest,
  UpdateFeaturedPostResponse,
  GetFeaturedPostResponse,
  GetAllFeaturedPostsResponse,
  DeleteFeaturedPostResponse
} from "@/core/application/dtos";

export const featuredPostApi = {
  getAll: () => apiClient.get<GetAllFeaturedPostsResponse>(API_ENDPOINTS.FEATURED_POSTS.BASE),

  getOne: (id: string) => apiClient.get<GetFeaturedPostResponse>(API_ENDPOINTS.FEATURED_POSTS.BY_ID(id)),

  create: (data: CreateFeaturedPostRequest) =>
    apiClient.post<CreateFeaturedPostResponse>(API_ENDPOINTS.FEATURED_POSTS.BASE, data),

  update: (id: string, data: UpdateFeaturedPostRequest) =>
    apiClient.put<UpdateFeaturedPostResponse>(API_ENDPOINTS.FEATURED_POSTS.BY_ID(id), data),

  delete: (id: string) => apiClient.delete<DeleteFeaturedPostResponse>(API_ENDPOINTS.FEATURED_POSTS.BY_ID(id))
};
