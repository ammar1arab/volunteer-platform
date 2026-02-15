import { FeaturedPostRepository } from "@/infrastructure/persistence/repositories";
import { R2StorageService } from "@/infrastructure/external";
import { InputSanitizer } from "@/infrastructure/security";
import FeaturedPost from "@/core/domain/entities/FeaturedPost";
import {
  ok,
  fail,
  serviceError,
  logger,
  guard,
} from "@/core/application/helpers";
import {
  toFeaturedPostDto,
  toFeaturedPostDtoList,
} from "@/core/application/mappers";
import type {
  CreateFeaturedPostRequest,
  CreateFeaturedPostResponse,
  UpdateFeaturedPostRequest,
  UpdateFeaturedPostResponse,
  GetFeaturedPostResponse,
  GetAllFeaturedPostsResponse,
  DeleteFeaturedPostResponse,
} from "@/core/application/dtos";

class FeaturedPostService {
  private static readonly SCOPE = "FeaturedPostService";
  private storageService: R2StorageService;

  constructor(private featuredPostRepository: FeaturedPostRepository) {
    this.storageService = new R2StorageService();
  }

private sanitize(input: Partial<CreateFeaturedPostRequest>) {
  return {
    imageUrl: input.imageUrl
      ? InputSanitizer.sanitizeString(input.imageUrl)
      : undefined,
    title: input.title
      ? InputSanitizer.sanitizeString(input.title)
      : undefined,
    description: input.description
      ? input.description.trim()
      : undefined,
    categories: input.categories,
    isActive: input.isActive,
  };
}

  private async tryDeleteImage(imageUrl: string): Promise<void> {
    try {
      await this.storageService.delete(imageUrl);
    } catch {
      logger.warn(
        FeaturedPostService.SCOPE,
        "tryDeleteImage",
        `Failed to delete: ${imageUrl}`,
      );
    }
  }

  private async findOrFail(id: string): Promise<FeaturedPost> {
    guard(id, "المعرف مطلوب");
    const post = await this.featuredPostRepository.findById(id);
    if (!post)
      throw Object.assign(new Error(), {
        result: fail("NOT_FOUND", "المنشور المميز غير موجود"),
      });
    return post;
  }

  async create(
    dto: CreateFeaturedPostRequest,
  ): Promise<CreateFeaturedPostResponse> {
    try {
      const payload = this.sanitize(dto);

      const post = FeaturedPost.create({
        imageUrl: payload.imageUrl!,
        title: payload.title!,
        description: payload.description!,
        categories: payload.categories!,
        isActive: payload.isActive ?? true,
      });

      const created = await this.featuredPostRepository.create(post);
      logger.info(
        FeaturedPostService.SCOPE,
        "create",
        `Post created: ${created.toObject().id}`,
      );

      return ok({ post: toFeaturedPostDto(created) });
    } catch (error) {
      return serviceError(
        FeaturedPostService.SCOPE,
        "create",
        error,
        "حدث خطأ أثناء إنشاء المنشور المميز",
      );
    }
  }

  async update(
    id: string,
    dto: Partial<UpdateFeaturedPostRequest>,
  ): Promise<UpdateFeaturedPostResponse> {
    try {
      const existing = await this.findOrFail(id);
      const payload = this.sanitize(dto);

      if (payload.imageUrl && payload.imageUrl !== existing.imageUrl) {
        await this.tryDeleteImage(existing.imageUrl);
      }

      existing.update(payload);
      const updated = await this.featuredPostRepository.update(existing);

      return ok({ post: toFeaturedPostDto(updated) });
    } catch (error) {
      return serviceError(
        FeaturedPostService.SCOPE,
        "update",
        error,
        "حدث خطأ أثناء تحديث المنشور المميز",
      );
    }
  }

  async delete(id: string): Promise<DeleteFeaturedPostResponse> {
    try {
      guard(id, "المعرف مطلوب");

      const existing = await this.featuredPostRepository.findById(id);
      if (existing) await this.tryDeleteImage(existing.imageUrl);

      const deleted = await this.featuredPostRepository.delete(id);
      if (!deleted) return fail("NOT_FOUND", "المنشور المميز غير موجود");

      logger.info(FeaturedPostService.SCOPE, "delete", `Post deleted: ${id}`);
      return ok({ deleted: true });
    } catch (error) {
      return serviceError(
        FeaturedPostService.SCOPE,
        "delete",
        error,
        "حدث خطأ أثناء حذف المنشور المميز",
      );
    }
  }

  async getOne(id: string): Promise<GetFeaturedPostResponse> {
    try {
      const post = await this.findOrFail(id);
      return ok({ post: toFeaturedPostDto(post) });
    } catch (error) {
      return serviceError(
        FeaturedPostService.SCOPE,
        "getOne",
        error,
        "حدث خطأ أثناء جلب المنشور المميز",
      );
    }
  }

  async getAll(): Promise<GetAllFeaturedPostsResponse> {
    try {
      const posts = await this.featuredPostRepository.findAll();
      const items = toFeaturedPostDtoList(posts);
      items.sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      );
      return ok({ posts: items });
    } catch (error) {
      return serviceError(
        FeaturedPostService.SCOPE,
        "getAll",
        error,
        "حدث خطأ أثناء جلب المنشورات المميزة",
      );
    }
  }
}

export default FeaturedPostService;
