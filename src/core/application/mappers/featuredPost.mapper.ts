import type FeaturedPost from "@/core/domain/entities/FeaturedPost";
import type { FeaturedPostDto } from "@/core/application/dtos";

export const toFeaturedPostDto = (entity: FeaturedPost): FeaturedPostDto => {
  const p = entity.toObject();
  return {
    id: p.id,
    imageUrl: p.imageUrl,
    title: p.title,
    description: p.description,
    categories: p.categories,
    isActive: p.isActive,
    createdAt: p.createdAt.toISOString(),
    updatedAt: p.updatedAt.toISOString(),
  };
};

export const toFeaturedPostDtoList = (entities: FeaturedPost[]): FeaturedPostDto[] =>
  entities.map(toFeaturedPostDto);