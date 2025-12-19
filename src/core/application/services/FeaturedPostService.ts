import { FeaturedPostRepository } from "@/infrastructure/persistence/repositories";
import { InputSanitizer } from "@/infrastructure/security";
import { FeaturedPost } from "@/core/domain/entities";
import { serviceError } from "@/core/application/helpers";

import type {
  CreateFeaturedPostRequest,
  CreateFeaturedPostResponse,
  UpdateFeaturedPostRequest,
  UpdateFeaturedPostResponse,
  GetFeaturedPostResponse,
  GetAllFeaturedPostsResponse,
  DeleteFeaturedPostResponse,
  FeaturedPostDto,
} from "@/core/application/dtos";

class FeaturedPostService {
  private static readonly SCOPE = "FeaturedPostService";

  constructor(private featuredPostRepository: FeaturedPostRepository) {}

  private toDto(entity: FeaturedPost): FeaturedPostDto {
    const props = entity.toObject();
    return {
      id: props.id,
      imageUrl: props.imageUrl,
      title: props.title,
      description: props.description,
      isActive: props.isActive,
      createdAt: props.createdAt.toISOString(),
      updatedAt: props.updatedAt.toISOString(),
    };
  }

  private sanitize(dto: { imageUrl: string; title: string; description: string }) {
    return {
      imageUrl: InputSanitizer.sanitizeString(dto.imageUrl),
      title: InputSanitizer.sanitizeString(dto.title),
      description: InputSanitizer.sanitizeString(dto.description),
    };
  }

  private validateRequiredStrings(payload: {
    imageUrl: string;
    title: string;
    description: string;
  }): string | null {
    if (!payload.imageUrl?.trim()) return "Image is required";
    if (!payload.title?.trim()) return "Title is required";
    if (!payload.description?.trim()) return "Description is required";
    return null;
  }

  async create(dto: CreateFeaturedPostRequest): Promise<CreateFeaturedPostResponse> {
    try {
      const payload = this.sanitize(dto);
      const err = this.validateRequiredStrings(payload);
      if (err) return { success: false, error: err };

      const post = FeaturedPost.create({
        ...payload,
        isActive: dto.isActive ?? true,
      });

      const created = await this.featuredPostRepository.create(post);
      return { success: true, post: this.toDto(created) };
    } catch (error) {
      return serviceError<CreateFeaturedPostResponse>(
        FeaturedPostService.SCOPE,
        "create",
        error,
        error instanceof Error ? error.message : "An error occurred while creating featured post"
      );
    }
  }

  async update(id: string, dto: UpdateFeaturedPostRequest): Promise<UpdateFeaturedPostResponse> {
    try {
      if (!id?.trim()) return { success: false, error: "Id is required" };

      const existing = await this.featuredPostRepository.findById(id);
      if (!existing) return { success: false, error: "Featured post not found" };

      const payload = this.sanitize(dto);
      const err = this.validateRequiredStrings(payload);
      if (err) return { success: false, error: err };

      existing.update({
        ...payload,
        isActive: dto.isActive ?? existing.isActive,
      });

      const updated = await this.featuredPostRepository.update(existing);
      return { success: true, post: this.toDto(updated) };
    } catch (error) {
      return serviceError<UpdateFeaturedPostResponse>(
        FeaturedPostService.SCOPE,
        "update",
        error,
        error instanceof Error ? error.message : "An error occurred while updating featured post"
      );
    }
  }

  async delete(id: string): Promise<DeleteFeaturedPostResponse> {
    try {
      if (!id?.trim()) return { success: false, error: "Id is required" };

      const deleted = await this.featuredPostRepository.delete(id);
      if (!deleted) return { success: false, error: "Featured post not found", deleted: false };

      return { success: true, deleted: true };
    } catch (error) {
      return serviceError<DeleteFeaturedPostResponse>(
        FeaturedPostService.SCOPE,
        "delete",
        error,
        "An error occurred while deleting featured post"
      );
    }
  }

  async getOne(id: string): Promise<GetFeaturedPostResponse> {
    try {
      if (!id?.trim()) return { success: false, error: "Id is required" };

      const post = await this.featuredPostRepository.findById(id);
      if (!post) return { success: false, error: "Featured post not found" };

      return { success: true, post: this.toDto(post) };
    } catch (error) {
      return serviceError<GetFeaturedPostResponse>(
        FeaturedPostService.SCOPE,
        "getOne",
        error,
        "An error occurred while fetching featured post"
      );
    }
  }

  async getAll(): Promise<GetAllFeaturedPostsResponse> {
    try {
      const posts = await this.featuredPostRepository.findAll();
      const items = posts.map((x) => this.toDto(x));

      const collator = new Intl.Collator("en", { sensitivity: "base" });
      items.sort((a, b) => collator.compare(a.title, b.title));

      return { success: true, posts: items };
    } catch (error) {
      return serviceError<GetAllFeaturedPostsResponse>(
        FeaturedPostService.SCOPE,
        "getAll",
        error,
        "An error occurred while fetching featured posts"
      );
    }
  }
}

export default FeaturedPostService;