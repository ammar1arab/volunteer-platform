import {
  ActivityRepository,
  ActivityParticipationRepository,
  ActivityPresenterRepository,
  MeetingSyncOperationRepository
} from "@/infrastructure/persistence/repositories";
import { InputSanitizer } from "@/infrastructure/security";
import { prisma } from "@/infrastructure/persistence/prisma";
import { Activity, ActivityPresenter } from "@/core/domain/entities";
import { R2StorageService } from "@/infrastructure/external";
import { serviceError, guard, guardRange } from "@/core/application/common";
import { toActivityDto, toActivityDtoList } from "@/core/application/mappers";
import {
  ActivityStatus,
  ActivityType,
  JordanianCity,
  MeetingLinkSource,
  MeetingSyncOperationType,
  MeetingSyncStatus,
  NotificationType,
  PresenterRole
} from "@/core/domain/enums";
import { dayOfWeekFromDate } from "@/lib/utils";
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
  CompleteActivityResponse,
  ActivityDto
} from "@/core/application/dtos";
import { logger } from "@/lib/utils";
import { ROUTES } from "@/presentation/constants";
import { sendPushToMany } from "@/lib/webpush";
import { inngest } from "@/lib/inngest/client";

class ActivityUseCase {
  private static readonly SCOPE = "ActivityUseCase";
  private storageService: R2StorageService;

  constructor(
    private activityRepository: ActivityRepository,
    private participationRepository: ActivityParticipationRepository,
    private syncOperationRepository: MeetingSyncOperationRepository = new MeetingSyncOperationRepository(),
    private presenterRepository: ActivityPresenterRepository = new ActivityPresenterRepository()
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

  private async enqueueMeetingSync(activityId: string, type: MeetingSyncOperationType): Promise<void> {
    try {
      const operation = await this.syncOperationRepository.enqueue({
        activityId,
        type,
        dedupeKey: `${activityId}:${type}`,
        payload: { activityId, type }
      });
      let processed = false;
      if (
        type === MeetingSyncOperationType.CREATE ||
        type === MeetingSyncOperationType.UPDATE
      ) {
        try {
          const { providers } = await import("@/lib/providers");
          const result = await providers.meeting().processSyncOperation(operation.id);
          processed = Boolean(result?.success);
        } catch (error) {
          logger.warn(ActivityUseCase.SCOPE, "processMeetingSyncNow", String(error));
        }
      }
      if (!processed) {
        try {
          await inngest.send({ name: "meeting/sync.requested", data: { operationId: operation.id } });
        } catch (error) {
          logger.warn(ActivityUseCase.SCOPE, "enqueueMeetingSync", String(error));
        }
      }
    } catch (error) {
      logger.warn(ActivityUseCase.SCOPE, "enqueueMeetingSync", String(error));
    }
  }

  private async toEnrichedDto(activityId: string, fallback: Activity) {
    const fresh = await this.activityRepository.findById(activityId);
    const [enriched] = await this.attachPrimaryPresenters([toActivityDto(fresh ?? fallback)]);
    return enriched;
  }

  /**
   * Upsert PRIMARY presenter for an activity.
   * - `undefined`: leave unchanged
   * - `null` / `""`: deactivate current primary
   * - string id: set as active PRIMARY
   */
  private async upsertPrimaryPresenter(
    activityId: string,
    primaryPresenterId: string | null | undefined
  ): Promise<boolean> {
    if (primaryPresenterId === undefined) return false;

    const normalized = primaryPresenterId?.trim() || null;
    const existing = await this.presenterRepository.findByActivity(activityId);
    const primary = existing.find((p) => p.role === PresenterRole.PRIMARY);

    if (!normalized) {
      if (primary?.isActive) {
        primary.update({ isActive: false });
        await this.presenterRepository.update(primary);
        return true;
      }
      return false;
    }

    if (primary?.presenterId === normalized && primary.isActive) return false;

    if (primary && primary.presenterId !== normalized) {
      primary.update({ isActive: false });
      await this.presenterRepository.update(primary);
    }

    const existingForUser = await this.presenterRepository.findByActivityAndPresenter(
      activityId,
      normalized
    );
    if (existingForUser) {
      existingForUser.update({ role: PresenterRole.PRIMARY, isActive: true });
      await this.presenterRepository.update(existingForUser);
    } else {
      await this.presenterRepository.create(
        ActivityPresenter.create({
          activityId,
          presenterId: normalized,
          role: PresenterRole.PRIMARY
        })
      );
    }
    return true;
  }

  private async attachPrimaryPresenters(dtos: ActivityDto[]): Promise<ActivityDto[]> {
    const onlineIds = dtos.filter((d) => d.activityType === ActivityType.ONLINE).map((d) => d.id);
    if (!onlineIds.length) {
      return dtos.map((d) => ({
        ...d,
        primaryPresenterId: d.primaryPresenterId ?? null,
        primaryPresenterName: d.primaryPresenterName ?? null
      }));
    }

    const map = await this.presenterRepository.findActivePrimaryByActivities(onlineIds);
    const presenterIds = [...new Set([...map.values()].map((p) => p.presenterId))];
    const namesById = new Map<string, string>();
    if (presenterIds.length) {
      const users = await prisma.user.findMany({
        where: { id: { in: presenterIds } },
        select: { id: true, fullName: true }
      });
      for (const user of users) {
        const name = user.fullName.trim();
        if (name) namesById.set(user.id, name);
      }
    }

    return dtos.map((d) => {
      const presenterId = map.get(d.id)?.presenterId ?? null;
      return {
        ...d,
        primaryPresenterId: presenterId,
        primaryPresenterName: presenterId ? namesById.get(presenterId) ?? null : null
      };
    });
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

      const meetingLinkSource = dto.meetingLinkSource ?? MeetingLinkSource.MANUAL;
      const isAutoMeet =
        dto.activityType === ActivityType.ONLINE &&
        meetingLinkSource === MeetingLinkSource.GOOGLE_MEET_AUTO;

      const activity = Activity.create({
        title: sanitized.title!,
        description: sanitized.description!,
        imageUrl: dto.imageUrl,
        date: new Date(dto.date),
        dayOfWeek: dayOfWeekFromDate(dto.date),
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
        meetingLink: isAutoMeet ? null : (dto.meetingLink ?? null),
        meetingPlatform: dto.meetingPlatform ?? null,
        externalMeetingId: dto.externalMeetingId ?? null,
        meetingLinkSource,
        meetingCode: dto.meetingCode ?? null,
        meetingSpaceName: dto.meetingSpaceName ?? null,
        meetingSyncStatus: MeetingSyncStatus.NONE,
        meetingSyncError: null,
        meetingSyncedAt: null,
        timeZone: dto.timeZone ?? Activity.DEFAULT_TIME_ZONE
      });

      if (isAutoMeet) {
        activity.enableAutomaticMeeting();
      }

      const created = await this.activityRepository.create(activity);

      if (created.activityType === ActivityType.ONLINE && dto.primaryPresenterId !== undefined) {
        await this.upsertPrimaryPresenter(created.id, dto.primaryPresenterId);
      }

      const [enriched] = await this.attachPrimaryPresenters([toActivityDto(created)]);
      logger.info(ActivityUseCase.SCOPE, "create", `Activity created: ${created.id}`);
      return ok({ activity: enriched });
    } catch (error) {
      return serviceError(ActivityUseCase.SCOPE, "create", error, "حدث خطأ أثناء إنشاء الفرصة");
    }
  }

  async update(id: string, dto: UpdateActivityRequest): Promise<UpdateActivityResponse> {
    try {
      const existing = await this.findOrFail(id);
      const before = existing.toObject();

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
        ...(dto.date !== undefined && {
          date: new Date(dto.date),
          dayOfWeek: dayOfWeekFromDate(dto.date)
        }),
        ...(dto.date === undefined && dto.dayOfWeek !== undefined && {
          dayOfWeek: dayOfWeekFromDate(before.date)
        }),
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
        ...(dto.externalMeetingId !== undefined && { externalMeetingId: dto.externalMeetingId }),
        ...(dto.meetingLinkSource !== undefined && { meetingLinkSource: dto.meetingLinkSource }),
        ...(dto.timeZone !== undefined && { timeZone: dto.timeZone })
      });

      if (
        dto.meetingLinkSource === MeetingLinkSource.GOOGLE_MEET_AUTO &&
        existing.activityType === ActivityType.ONLINE &&
        before.meetingLinkSource !== MeetingLinkSource.GOOGLE_MEET_AUTO
      ) {
        existing.enableAutomaticMeeting();
      }

      const after = existing.toObject();
      const scheduleOrTitleChanged =
        before.title !== after.title ||
        before.description !== after.description ||
        before.date.getTime() !== after.date.getTime() ||
        before.startTime !== after.startTime ||
        before.endTime !== after.endTime ||
        before.timeZone !== after.timeZone;

      const updated = await this.activityRepository.update(existing);

      if (updated.activityType === ActivityType.ONLINE && "primaryPresenterId" in dto) {
        const presenterChanged = await this.upsertPrimaryPresenter(updated.id, dto.primaryPresenterId ?? null);
        if (
          presenterChanged &&
          updated.usesAutomaticMeeting() &&
          updated.externalMeetingId
        ) {
          await this.enqueueMeetingSync(updated.id, MeetingSyncOperationType.SYNC_ATTENDEES);
        }
      } else if (updated.activityType !== ActivityType.ONLINE && "primaryPresenterId" in dto) {
        await this.upsertPrimaryPresenter(updated.id, null);
      }

      if (
        updated.usesAutomaticMeeting() &&
        after.externalMeetingId &&
        scheduleOrTitleChanged &&
        updated.status === ActivityStatus.PUBLISHED
      ) {
        await this.enqueueMeetingSync(updated.id, MeetingSyncOperationType.UPDATE);
      }

      logger.info(ActivityUseCase.SCOPE, "update", `Activity updated: ${id}`);
      return ok({ activity: await this.toEnrichedDto(updated.id, updated) });
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
      const [enriched] = await this.attachPrimaryPresenters([
        toActivityDto(activity, { includePrivateMeetingFields: false })
      ]);
      return ok({ activity: enriched });
    } catch (error) {
      return serviceError(ActivityUseCase.SCOPE, "getOne", error, "حدث خطأ أثناء جلب الفرصة");
    }
  }

  async getAll(): Promise<GetAllActivitiesResponse> {
    try {
      const activities = await this.activityRepository.findAll();
      const enriched = await this.attachPrimaryPresenters(toActivityDtoList(activities));
      return ok({ activities: enriched });
    } catch (error) {
      return serviceError(ActivityUseCase.SCOPE, "getAll", error, "حدث خطأ أثناء جلب الفرص");
    }
  }

  async getPublished(): Promise<GetAllActivitiesResponse> {
    try {
      const activities = await this.activityRepository.findPublished();
      const enriched = await this.attachPrimaryPresenters(
        toActivityDtoList(activities, { includePrivateMeetingFields: false })
      );
      return ok({ activities: enriched });
    } catch (error) {
      return serviceError(ActivityUseCase.SCOPE, "getPublished", error, "حدث خطأ أثناء جلب الفرص المنشورة");
    }
  }

  async getByCreator(creatorId: string): Promise<GetAllActivitiesResponse> {
    try {
      guard(creatorId, "معرف المنشئ مطلوب");
      const activities = await this.activityRepository.findByCreator(creatorId);
      const enriched = await this.attachPrimaryPresenters(toActivityDtoList(activities));
      return ok({ activities: enriched });
    } catch (error) {
      return serviceError(ActivityUseCase.SCOPE, "getByCreator", error, "حدث خطأ أثناء جلب فرص المنشئ");
    }
  }

  async publish(id: string): Promise<PublishActivityResponse> {
    try {
      const activity = await this.findOrFail(id);
      activity.publish();

      if (activity.usesAutomaticMeeting()) {
        activity.markMeetingSyncPending();
      }

      const updated = await this.activityRepository.update(activity);

      if (updated.usesAutomaticMeeting()) {
        await this.enqueueMeetingSync(updated.id, MeetingSyncOperationType.CREATE);
      }

      logger.info(ActivityUseCase.SCOPE, "publish", `Activity published: ${id}`);
      return ok({ activity: await this.toEnrichedDto(updated.id, updated) });
    } catch (error) {
      return serviceError(ActivityUseCase.SCOPE, "publish", error, "حدث خطأ أثناء نشر الفرصة");
    }
  }

  async cancel(id: string): Promise<CancelActivityResponse> {
    try {
      const activity = await this.findOrFail(id);
      const shouldCancelMeeting = activity.usesAutomaticMeeting() && !!activity.externalMeetingId;
      activity.cancel();
      const updated = await this.activityRepository.update(activity);

      if (shouldCancelMeeting) {
        await this.enqueueMeetingSync(id, MeetingSyncOperationType.CANCEL);
      }

      const approved = await this.participationRepository.findApprovedByActivity(id);
      if (approved.length) {
        await prisma.notification.createMany({
          data: approved.map((p) => ({
            userId: p.volunteerId,
            type: NotificationType.ACTIVITY_CANCELLED,
            title: "تم إلغاء نشاط كنت مسجلاً فيه",
            message: `للأسف تم إلغاء نشاط "${activity.title}". نأمل أن تجد فرصة أخرى تناسبك قريباً.`,
            metadata: { activityId: id, link: ROUTES.ACTIVITY_DETAILS(id) }
          }))
        });

        void sendPushToMany(
          approved.map((p) => p.volunteerId),
          {
            title: "تم إلغاء نشاط",
            body: `للأسف تم إلغاء نشاط "${activity.title}"`,
            url: ROUTES.ACTIVITIES,
            tag: `cancelled-${id}`
          }
        );
      }

      logger.info(ActivityUseCase.SCOPE, "cancel", `Activity cancelled: ${id} notified=${approved.length}`);
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
