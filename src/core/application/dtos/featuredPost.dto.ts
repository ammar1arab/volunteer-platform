import { DomainFeaturedPostCategory } from "@/core/domain/enums";
import type { Result } from "./base.dto";



export interface FeaturedPostDto {
  id: string;
  imageUrl: string;
  title: string;
  description: string;
  categories: DomainFeaturedPostCategory[];
  publishedAt: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}



export interface CreateFeaturedPostRequest {
  imageUrl: string;
  title: string;
  description: string;
  categories: DomainFeaturedPostCategory[];
  publishedAt?: Date;
  isActive?: boolean;
}

export type UpdateFeaturedPostRequest = Partial<CreateFeaturedPostRequest>;



export type CreateFeaturedPostResponse = Result<{ post: FeaturedPostDto }>;
export type UpdateFeaturedPostResponse = Result<{ post: FeaturedPostDto }>;
export type GetFeaturedPostResponse = Result<{ post: FeaturedPostDto }>;
export type GetAllFeaturedPostsResponse = Result<{ posts: FeaturedPostDto[] }>;
export type DeleteFeaturedPostResponse = Result<{ deleted: boolean }>;
