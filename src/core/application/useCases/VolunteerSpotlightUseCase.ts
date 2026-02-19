import { R2StorageService } from "@/infrastructure/external";
import { InputSanitizer } from "@/infrastructure/security";
import { VolunteerSpotlightRepository } from "@/infrastructure/persistence/repositories";

import { VolunteerSpotlight } from "@/core/domain/entities";
import { toVolunteerSpotlightDto, toVolunteerSpotlightDtoList } from "@/core/application/mappers";
import { guard, serviceError, GuardError } from "@/core/application/common";
import {
  ok,
  fail,
  CreateVolunteerSpotlightRequest,
  CreateVolunteerSpotlightResponse,
  DeleteVolunteerSpotlightResponse,
  GetAllVolunteerSpotlightsResponse,
  GetVolunteerSpotlightResponse,
  UpdateVolunteerSpotlightRequest,
  UpdateVolunteerSpotlightResponse
} from "@/core/application/dtos";
import { logger } from "@/lib/utils";

class VolunteerSpotlightUseCase {
  private static readonly SCOPE = "VolunteerSpotlightUseCase";
  private storageService: R2StorageService;

  constructor(private volunteeSpotlightRepository: VolunteerSpotlightRepository) {
    this.storageService = new R2StorageService();
  }

  private sanitize(input: Partial<CreateVolunteerSpotlightRequest>) {
    return {
      imageUrl: input.imageUrl ? InputSanitizer.sanitizeString(input.imageUrl) : undefined,
      name: input.name ? InputSanitizer.sanitizeString(input.name) : undefined,
      description: input.description ? input.description.trim() : undefined,
      spotlightDate: input.spotlightDate,
      city: input.city,
      isActive: input.isActive
    };
  }

  private async tryDeleteImage(imageUrl: string): Promise<void> {
    try {
      await this.storageService.delete(imageUrl);
      logger.info(VolunteerSpotlightUseCase.SCOPE, "tryDeleteImage", `Deleted: ${imageUrl}`);
    } catch {
      logger.warn(VolunteerSpotlightUseCase.SCOPE, "tryDeleteImage", `Failed to delete: ${imageUrl}`);
    }
  }

  private async findOrFail(id: string): Promise<VolunteerSpotlight> {
    guard(id, "المعرف المطلوب");
    const volunteerSpotlight = await this.volunteeSpotlightRepository.findById(id);
    if (!volunteerSpotlight) {
      throw Object.assign(new Error(), {
        result: fail("NOT_FOUND", "المنشور غير موجود")
      });
    }
    return volunteerSpotlight;
  }

  async create(dto: CreateVolunteerSpotlightRequest): Promise<CreateVolunteerSpotlightResponse> {
    try {
      const sanitized = this.sanitize(dto);

      guard(sanitized.imageUrl, "الصورة مطلوبة");
      guard(sanitized.name, "الأسم مطلوب");
      guard(sanitized.description, "الوصف مطلوب");

      if (!sanitized.spotlightDate) {
        throw new GuardError(fail("VALIDATION_ERROR", "تاريخ التكريم مطلوب"));
      }
      if (!sanitized.city) {
        throw new GuardError(fail("VALIDATION_ERROR", "المدينة مطلوبة"));
      }

      const volunteerSpotlight = VolunteerSpotlight.create({
        imageUrl: sanitized.imageUrl,
        name: sanitized.name,
        description: sanitized.description,
        spotlightDate: sanitized.spotlightDate,
        city: sanitized.city,
        isActive: sanitized.isActive ?? true
      });

      const created = await this.volunteeSpotlightRepository.create(volunteerSpotlight);
      logger.info(VolunteerSpotlightUseCase.SCOPE, "create", `Created: ${created.id}`);
      return ok({ volunteerSpotlight: toVolunteerSpotlightDto(created) });
    } catch (error) {
      return serviceError(VolunteerSpotlightUseCase.SCOPE, "create", error, "حدث خطأ أثناء إنشاء منشور المتطوع المميز");
    }
  }

  async update(id: string, dto: Partial<UpdateVolunteerSpotlightRequest>): Promise<UpdateVolunteerSpotlightResponse> {
    try {
      const existing = await this.findOrFail(id);
      const sanitized = this.sanitize(dto);

      if (sanitized.imageUrl && sanitized.imageUrl !== existing.imageUrl) {
        await this.tryDeleteImage(existing.imageUrl);
      }

      existing.update(sanitized);
      const updated = await this.volunteeSpotlightRepository.update(existing);

      return ok({ volunteerSpotlight: toVolunteerSpotlightDto(updated) });
    } catch (error) {
      return serviceError(VolunteerSpotlightUseCase.SCOPE, "update", error, "حدث خطأ أثناء تحديث المنشور");
    }
  }

  async delete(id: string): Promise<DeleteVolunteerSpotlightResponse> {
    try {
      guard(id, "المعرف مطلوب");

      const existing = await this.findOrFail(id);
      if (existing) await this.tryDeleteImage(existing.imageUrl);

      const deleted = await this.volunteeSpotlightRepository.delete(id);
      if (!deleted) return fail("NOT_FOUND", "المنشور غير موجود");

      logger.info(VolunteerSpotlightUseCase.SCOPE, "delete", `Deleted: ${id}`);
      return ok({ deleted: true });
    } catch (error) {
      return serviceError(VolunteerSpotlightUseCase.SCOPE, "delete", error, "حدث خطأ أثناء حذف المنشور");
    }
  }

  async getOne(id: string): Promise<GetVolunteerSpotlightResponse> {
    try {
      const volunteerSpotlight = await this.findOrFail(id);
      return ok({ volunteerSpotlight: toVolunteerSpotlightDto(volunteerSpotlight) });
    } catch (error) {
      return serviceError(VolunteerSpotlightUseCase.SCOPE, "getOne", error, "حدث خطأ أثناء جلب المنشور");
    }
  }

  async getAll(): Promise<GetAllVolunteerSpotlightsResponse> {
    try {
      const volunteerSpotlights = await this.volunteeSpotlightRepository.findAll();
      const items = toVolunteerSpotlightDtoList(volunteerSpotlights);
      items.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      return ok({ volunteerSpotlights: items });
    } catch (error) {
      return serviceError(VolunteerSpotlightUseCase.SCOPE, "getAll", error, "حدث خطأ أثناء جلب المنشورات");
    }
  }
}

export default VolunteerSpotlightUseCase;
