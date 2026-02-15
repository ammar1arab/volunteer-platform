import { FeaturedPostCategory } from "@/core/domain/enums";
import type { Result } from "./base.dto";

// ─── Featured Post ────────────────────────────────────────────

export interface FeaturedPostDto {
  id: string;
  imageUrl: string;
  title: string;
  description: string;
  categories: FeaturedPostCategory[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// ─── Create / Update ──────────────────────────────────────────

export interface CreateFeaturedPostRequest {
  imageUrl: string;
  title: string;
  description: string;
  categories: FeaturedPostCategory[];
  isActive?: boolean;
}

export type UpdateFeaturedPostRequest = Partial<CreateFeaturedPostRequest>;

// ─── Responses ────────────────────────────────────────────────

export type CreateFeaturedPostResponse = Result<{ post: FeaturedPostDto }>;
export type UpdateFeaturedPostResponse = Result<{ post: FeaturedPostDto }>;
export type GetFeaturedPostResponse = Result<{ post: FeaturedPostDto }>;
export type GetAllFeaturedPostsResponse = Result<{ posts: FeaturedPostDto[] }>;
export type DeleteFeaturedPostResponse = Result<{ deleted: boolean }>;