import { apiClient } from "./client.api";
import { API_ENDPOINTS } from "@/lib";
import type {
  CreateFeaturedPostRequest,
  CreateFeaturedPostResponse,
  UpdateFeaturedPostRequest,
  UpdateFeaturedPostResponse,
  GetFeaturedPostResponse,
  GetAllFeaturedPostsResponse,
  DeleteFeaturedPostResponse,
} from "@/core/application/dtos";

export const featuredPostApi = {
  getAll: () =>
    apiClient.get<GetAllFeaturedPostsResponse>(
      API_ENDPOINTS.FEATURED_POSTS.BASE
    ),

  getOne: (id: string) =>
    apiClient.get<GetFeaturedPostResponse>(
      API_ENDPOINTS.FEATURED_POSTS.BY_ID(id)
    ),

  create: (payload: CreateFeaturedPostRequest) =>
    apiClient.post<CreateFeaturedPostResponse>(
      API_ENDPOINTS.FEATURED_POSTS.BASE,
      payload
    ),

  update: (id: string, payload: UpdateFeaturedPostRequest) =>
    apiClient.put<UpdateFeaturedPostResponse>(
      API_ENDPOINTS.FEATURED_POSTS.BY_ID(id),
      payload
    ),

  delete: (id: string) =>
    apiClient.delete<DeleteFeaturedPostResponse>(
      API_ENDPOINTS.FEATURED_POSTS.BY_ID(id)
    ),
};
