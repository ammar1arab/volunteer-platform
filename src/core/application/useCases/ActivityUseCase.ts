import { ActivityRepository, ActivityParticipationRepository } from "@/infrastructure/persistence/repositories";
import { InputSanitizer } from "@/infrastructure/security";
import { Activity } from "@/core/domain/entities";
import { R2StorageService } from "@/infrastructure/external";
import { serviceError, guard } from "@/core/application/common";
import { toActivityDto, toActivityDtoList } from "@/core/application/mappers";
import {
  ok,
  fail,
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
  ActivityVolunteerDto
} from "@/core/application/dtos";
import { logger } from "@/lib/utils";

class ActivityUseCase {
  private static readonly SCOPE = "ActivityUseCase";
  private storageService: R2StorageService;

  constructor(
    private activityRepository: ActivityRepository,
    private participationRepository: ActivityParticipationRepository
  ) {
    this.storageService = new R2StorageService();
  }

  private sanitize(dto: { title?: string; description?: string; placeName?: string }) {
    return {
      title: dto.title ? InputSanitizer.sanitizeString(dto.title) : undefined,
      description: dto.description ? InputSanitizer.sanitizeString(dto.description) : undefined,
      placeName: dto.placeName ? InputSanitizer.sanitizeString(dto.placeName) : undefined
    };
  }

  private async tryDeleteImage(imageUrl: string): Promise<void> {
    try {
      await this.storageService.delete(imageUrl);
      logger.info(ActivityUseCase.SCOPE, "tryDeleteImage", `Deleted: ${imageUrl}`);
    } catch {
      logger.warn(ActivityUseCase.SCOPE, "tryDeleteImage", `Failed to delete: ${imageUrl}`);
    }
  }

  private async findOrFail(id: string): Promise<Activity> {
    guard(id, "المعرف مطلوب");
    const activity = await this.activityRepository.findById(id);
    if (!activity)
      throw Object.assign(new Error(), {
        result: fail("NOT_FOUND", "النشاط غير موجود")
      });
    return activity;
  }

  async create(dto: CreateActivityRequest, userId: string): Promise<CreateActivityResponse> {
    try {
      const sanitized = this.sanitize(dto);

      guard(sanitized.title, "العنوان مطلوب");
      guard(sanitized.description, "الوصف مطلوب");
      guard(dto.imageUrl, "الصورة مطلوبة");
      guard(sanitized.placeName, "اسم المكان مطلوب");
      guard(dto.startTime, "وقت البدء مطلوب");
      guard(dto.endTime, "وقت الانتهاء مطلوب");

      const activity = Activity.create({
        title: sanitized.title!,
        description: sanitized.description!,
        imageUrl: dto.imageUrl,
        dayOfWeek: dto.dayOfWeek,
        date: new Date(dto.date),
        startTime: dto.startTime,
        endTime: dto.endTime,
        placeName: sanitized.placeName!,
        location: dto.location,
        targetAudience: dto.targetAudience,
        maxVolunteers: dto.maxVolunteers,
        createdBy: userId,
        isActive: true
      });

      const created = await this.activityRepository.create(activity);
      logger.info(ActivityUseCase.SCOPE, "create", `Activity created: ${created.id}`);

      return ok({ activity: toActivityDto(created) });
    } catch (error) {
      return serviceError(ActivityUseCase.SCOPE, "create", error, "حدث خطأ أثناء إنشاء الفرصة");
    }
  }

  async update(id: string, dto: UpdateActivityRequest): Promise<UpdateActivityResponse> {
    try {
      const existing = await this.findOrFail(id);

      if (dto.imageUrl && dto.imageUrl !== existing.imageUrl) {
        await this.tryDeleteImage(existing.imageUrl);
      }

      const sanitized = this.sanitize(dto);

      existing.update({
        ...(sanitized.title !== undefined && { title: sanitized.title }),
        ...(sanitized.description !== undefined && {
          description: sanitized.description
        }),
        ...(sanitized.placeName !== undefined && {
          placeName: sanitized.placeName
        }),
        ...(dto.imageUrl !== undefined && { imageUrl: dto.imageUrl }),
        ...(dto.dayOfWeek !== undefined && { dayOfWeek: dto.dayOfWeek }),
        ...(dto.date !== undefined && { date: new Date(dto.date) }),
        ...(dto.startTime !== undefined && { startTime: dto.startTime }),
        ...(dto.endTime !== undefined && { endTime: dto.endTime }),
        ...(dto.location !== undefined && { location: dto.location }),
        ...(dto.targetAudience !== undefined && {
          targetAudience: dto.targetAudience
        }),
        ...(dto.maxVolunteers !== undefined && {
          maxVolunteers: dto.maxVolunteers
        })
      });

      const updated = await this.activityRepository.update(existing);
      logger.info(ActivityUseCase.SCOPE, "update", `Activity updated: ${id}`);

      return ok({ activity: toActivityDto(updated) });
    } catch (error) {
      return serviceError(ActivityUseCase.SCOPE, "update", error, "حدث خطأ أثناء تحديث الفرصة");
    }
  }

  async delete(id: string): Promise<DeleteActivityResponse> {
    try {
      guard(id, "المعرف مطلوب");

      const existing = await this.activityRepository.findById(id);
      if (existing) await this.tryDeleteImage(existing.imageUrl);

      const deleted = await this.activityRepository.delete(id);
      if (!deleted) return fail("NOT_FOUND", "الفرصة غير موجود");

      logger.info(ActivityUseCase.SCOPE, "delete", `Activity deleted: ${id}`);
      return ok({ deleted: true });
    } catch (error) {
      return serviceError(ActivityUseCase.SCOPE, "delete", error, "حدث خطأ أثناء حذف الفرصة");
    }
  }

  async getOne(id: string): Promise<GetActivityResponse> {
    try {
      const activity = await this.findOrFail(id);
      return ok({ activity: toActivityDto(activity) });
    } catch (error) {
      return serviceError(ActivityUseCase.SCOPE, "getOne", error, "حدث خطأ أثناء جلب الفرصة");
    }
  }

  async getAll(): Promise<GetAllActivitiesResponse> {
    try {
      const activities = await this.activityRepository.findAll();
      return ok({ activities: toActivityDtoList(activities) });
    } catch (error) {
      return serviceError(ActivityUseCase.SCOPE, "getAll", error, "حدث خطأ أثناء جلب الفرص");
    }
  }

  async getPublished(): Promise<GetAllActivitiesResponse> {
    try {
      const activities = await this.activityRepository.findPublished();
      return ok({ activities: toActivityDtoList(activities) });
    } catch (error) {
      return serviceError(ActivityUseCase.SCOPE, "getPublished", error, "حدث خطأ أثناء جلب الفرص المنشورة");
    }
  }

  async getByCreator(creatorId: string): Promise<GetAllActivitiesResponse> {
    try {
      guard(creatorId, "معرف المنشئ مطلوب");
      const activities = await this.activityRepository.findByCreator(creatorId);
      return ok({ activities: toActivityDtoList(activities) });
    } catch (error) {
      return serviceError(ActivityUseCase.SCOPE, "getByCreator", error, "حدث خطأ أثناء جلب فرص المنشئ");
    }
  }

  async publish(id: string): Promise<PublishActivityResponse> {
    try {
      const activity = await this.findOrFail(id);
      activity.publish();
      const updated = await this.activityRepository.update(activity);
      logger.info(ActivityUseCase.SCOPE, "publish", `Activity published: ${id}`);
      return ok({ activity: toActivityDto(updated) });
    } catch (error) {
      return serviceError(ActivityUseCase.SCOPE, "publish", error, "حدث خطأ أثناء نشر الفرصة");
    }
  }

  async cancel(id: string): Promise<CancelActivityResponse> {
    try {
      const activity = await this.findOrFail(id);
      activity.cancel();
      const updated = await this.activityRepository.update(activity);
      logger.info(ActivityUseCase.SCOPE, "cancel", `Activity cancelled: ${id}`);
      return ok({ activity: toActivityDto(updated) });
    } catch (error) {
      return serviceError(ActivityUseCase.SCOPE, "cancel", error, "حدث خطأ أثناء إلغاء الفرصة");
    }
  }

  async restore(id: string): Promise<RestoreActivityResponse> {
    try {
      const activity = await this.findOrFail(id);
      if (activity.status !== "CANCELLED") return fail("INVALID_STATE", "يمكن استعادة الفرص الملغاة فقط");
      activity.restore();
      const updated = await this.activityRepository.update(activity);
      logger.info(ActivityUseCase.SCOPE, "restore", `Activity restored: ${id}`);
      return ok({ activity: toActivityDto(updated) });
    } catch (error) {
      return serviceError(ActivityUseCase.SCOPE, "restore", error, "حدث خطأ أثناء استعادة النشاط");
    }
  }

  async getVolunteers(activityId: string): Promise<GetActivityVolunteersResponse> {
    try {
      guard(activityId, "معرّف النشاط مطلوب");
      const volunteers = await this.participationRepository.findApprovedVolunteers(activityId);

      const items: ActivityVolunteerDto[] = volunteers.map((v) => ({
        id: v.id,
        fullName: v.fullName,
        email: v.email,
        phone: v.phone,
        profilePictureUrl: v.profilePictureUrl ?? undefined,
        city: v.city ?? undefined,
        dateOfBirth: v.dateOfBirth?.toISOString(),
        gender: v.gender ?? undefined
      }));

      logger.info(ActivityUseCase.SCOPE, "getVolunteers", `Found ${items.length} for: ${activityId}`);
      return ok({ volunteers: items });
    } catch (error) {
      return serviceError(ActivityUseCase.SCOPE, "getVolunteers", error, "حدث خطأ أثناء جلب المتطوعين");
    }
  }
}

export default ActivityUseCase;
