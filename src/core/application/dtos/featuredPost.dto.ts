export interface FeaturedPostDto {
  id: string;
  imageUrl: string;
  title: string;
  description: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateFeaturedPostRequest {
  imageUrl: string;
  title: string;
  description: string;
  isActive?: boolean;
}

export interface CreateFeaturedPostResponse {
  success: boolean;
  post?: FeaturedPostDto;
  error?: string;
}

export interface UpdateFeaturedPostRequest {
  imageUrl: string;
  title: string;
  description: string;
  isActive?: boolean;
}

export interface UpdateFeaturedPostResponse {
  success: boolean;
  post?: FeaturedPostDto;
  error?: string;
}

export interface GetFeaturedPostResponse {
  success: boolean;
  post?: FeaturedPostDto;
  error?: string;
}

export interface GetAllFeaturedPostsResponse {
  success: boolean;
  posts?: FeaturedPostDto[];
  error?: string;
}

export interface DeleteFeaturedPostResponse {
  success: boolean;
  deleted?: boolean;
  error?: string;
}
