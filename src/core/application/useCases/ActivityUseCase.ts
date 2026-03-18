import { ActivityRepository, ActivityParticipationRepository } from "@/infrastructure/persistence/repositories";
import { InputSanitizer } from "@/infrastructure/security";
import { Activity } from "@/core/domain/entities";
import { R2StorageService } from "@/infrastructure/external";
import { serviceError, guard, guardRange } from "@/core/application/common";
import { toActivityDto, toActivityDtoList } from "@/core/application/mappers";
import { ActivityStatus, ActivityType, JordanianCity } from "@/core/domain/enums";
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
  ActivityVolunteerDto,
  CompleteActivityResponse
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
      description: dto.description?.trim(),
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
      guard(dto.startTime, "وقت البدء مطلوب");
      guard(dto.endTime, "وقت الانتهاء مطلوب");
      guardRange(dto.durationHours, 1, 24, "مدة النشاط مطلوبة");

      const activity = Activity.create({
        title: sanitized.title!,
        description: sanitized.description!,
        imageUrl: dto.imageUrl,
        dayOfWeek: dto.dayOfWeek,
        date: new Date(dto.date),
        startTime: dto.startTime,
        endTime: dto.endTime,
        durationHours: dto.durationHours,
        activityType: dto.activityType as ActivityType,
        categories: dto.categories ?? [],
        maxVolunteers: dto.maxVolunteers,
        createdBy: userId,
        isActive: true,
        deletedAt: null,
        placeName: sanitized.placeName ?? null,
        city: (dto.city as JordanianCity) ?? null,
        latitude: dto.latitude ?? null,
        longitude: dto.longitude ?? null,
        meetingLink: dto.meetingLink ?? null,
        meetingPlatform: dto.meetingPlatform ?? null,
        externalMeetingId: dto.externalMeetingId ?? null
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
        ...(dto.activityType !== undefined && { activityType: dto.activityType as ActivityType }),
        ...(sanitized.title !== undefined && { title: sanitized.title }),
        ...(sanitized.description !== undefined && { description: sanitized.description }),
        ...(sanitized.placeName !== undefined && { placeName: sanitized.placeName }),
        ...(dto.imageUrl !== undefined && { imageUrl: dto.imageUrl }),
        ...(dto.dayOfWeek !== undefined && { dayOfWeek: dto.dayOfWeek }),
        ...(dto.date !== undefined && { date: new Date(dto.date) }),
        ...(dto.startTime !== undefined && { startTime: dto.startTime }),
        ...(dto.endTime !== undefined && { endTime: dto.endTime }),
        ...(dto.durationHours !== undefined && { durationHours: dto.durationHours }),
        ...(dto.maxVolunteers !== undefined && { maxVolunteers: dto.maxVolunteers }),
        ...(dto.categories !== undefined && { categories: dto.categories }),
        ...(dto.city !== undefined && { city: dto.city as JordanianCity }),
        ...(dto.latitude !== undefined && { latitude: dto.latitude }),
        ...(dto.longitude !== undefined && { longitude: dto.longitude }),
        ...(dto.meetingLink !== undefined && { meetingLink: dto.meetingLink }),
        ...(dto.meetingPlatform !== undefined && { meetingPlatform: dto.meetingPlatform }),
        ...(dto.externalMeetingId !== undefined && { externalMeetingId: dto.externalMeetingId })
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
      const activity = await this.findOrFail(id);
      activity.softDelete();
      await this.activityRepository.update(activity);
      logger.info(ActivityUseCase.SCOPE, "delete", `Activity soft-deleted: ${id}`);
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
      if (activity.status !== ActivityStatus.CANCELLED) return fail("INVALID_STATE", "يمكن استعادة الفرص الملغاة فقط");
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
        participationId: v.participationId,
        id: v.id,
        fullName: v.fullName,
        email: v.email,
        phone: v.phone,
        profilePictureUrl: v.profilePictureUrl,
        city: v.city,
        dateOfBirth: v.dateOfBirth?.toISOString() ?? null,
        gender: v.gender,
        attendanceStatus: v.attendanceStatus,
        volunteerHours: v.volunteerHours
      }));

      logger.info(ActivityUseCase.SCOPE, "getVolunteers", `Found ${items.length} for: ${activityId}`);
      return ok({ volunteers: items });
    } catch (error) {
      return serviceError(ActivityUseCase.SCOPE, "getVolunteers", error, "حدث خطأ أثناء جلب المتطوعين");
    }
  }

  async complete(id: string): Promise<CompleteActivityResponse> {
    try {
      const activity = await this.findOrFail(id);

      const notMarkedCount = await this.participationRepository.countNotMarked(id);
      if (notMarkedCount > 0)
        return fail("INVALID_STATE", `لا يمكن إكمال النشاط — يوجد ${notMarkedCount} متطوع لم يُسجَّل حضوره`);

      activity.complete();
      const updated = await this.activityRepository.update(activity);
      logger.info(ActivityUseCase.SCOPE, "complete", `Activity completed: ${id}`);
      return ok({ activity: toActivityDto(updated) });
    } catch (error) {
      return serviceError(ActivityUseCase.SCOPE, "complete", error, "حدث خطأ أثناء إكمال النشاط");
    }
  }
}

export default ActivityUseCase;
