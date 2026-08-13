import {
  ActivityParticipationRepository,
  ActivityRepository,
  UserRepository,
  VolunteerProfileRepository,
  MeetingSyncOperationRepository
} from "@/infrastructure/persistence/repositories";
import type { Prisma } from "@prisma/client";
import { Activity, ActivityParticipation } from "@/core/domain/entities";
import { serviceError, guard } from "@/core/application/common";
import { toParticipationDto, toUserSummaryDto, toActivitySummaryDto } from "@/core/application/mappers";
import { ActivityStatus, MeetingSyncOperationType, ParticipationStatus, NotificationType, isJordanianCity } from "@/core/domain/enums";
import {
  ok,
  fail,
  CreateJoinRequestResponse,
  GetJoinRequestsResponse,
  ApproveJoinRequestResponse,
  RejectJoinRequestResponse,
  CancelJoinRequestResponse,
  MarkAttendanceRequest,
  MarkAttendanceResponse,
  BulkMarkAttendanceResponse,
  BulkMarkAttendanceRequest
} from "@/core/application/dtos";
import { logger } from "@/lib/utils";
import { prisma } from "@/infrastructure/persistence/prisma";
import { ROUTES } from "@/presentation/constants";
import { sendPushToMany, sendPushToUser } from "@/lib/webpush";
import { inngest } from "@/lib/inngest/client";

class ActivityParticipationUseCase {
  private static readonly SCOPE = "ActivityParticipationUseCase";

  constructor(
    private participationRepository: ActivityParticipationRepository,
    private activityRepository: ActivityRepository,
    private userRepository: UserRepository,
    private volunteerProfileRepository: VolunteerProfileRepository,
    private syncOperationRepository: MeetingSyncOperationRepository = new MeetingSyncOperationRepository()
  ) {}

  private async maybeEnqueueAttendeeSync(activity: Activity | null): Promise<void> {
    try {
      if (!activity?.usesAutomaticMeeting() || !activity.externalMeetingId) return;

      const type = MeetingSyncOperationType.SYNC_ATTENDEES;
      const operation = await this.syncOperationRepository.enqueue({
        activityId: activity.id,
        type,
        dedupeKey: `${activity.id}:${type}`,
        payload: { activityId: activity.id, type }
      });
      try {
        await inngest.send({ name: "meeting/sync.requested", data: { operationId: operation.id } });
      } catch (error) {
        logger.warn(ActivityParticipationUseCase.SCOPE, "maybeEnqueueAttendeeSync", String(error));
      }
    } catch (error) {
      logger.warn(ActivityParticipationUseCase.SCOPE, "maybeEnqueueAttendeeSync", String(error));
    }
  }

  private async findOrFail(id: string) {
    guard(id, "معرّف الطلب مطلوب");
    const participation = await this.participationRepository.findById(id);
    if (!participation) throw Object.assign(new Error(), { result: fail("NOT_FOUND", "الطلب غير موجود") });
    return participation;
  }

  private async mapWithRelations(entity: ActivityParticipation) {
    const props = entity.toObject();
    const [volunteerUser, volunteerProfile, activity] = await Promise.all([
      this.userRepository.findById(props.volunteerId),
      prisma.volunteerProfile.findUnique({
        where: { userId: props.volunteerId },
        select: { city: true }
      }),
      this.activityRepository.findById(props.activityId)
    ]);
    return toParticipationDto(entity, {
      volunteer: volunteerUser
        ? {
            ...toUserSummaryDto(volunteerUser),
            city:
              volunteerProfile?.city && isJordanianCity(volunteerProfile.city)
                ? volunteerProfile.city
                : undefined
          }
        : undefined,
      activity: activity ? toActivitySummaryDto(activity) : undefined
    });
  }

  private async mapListWithRelations(entities: ActivityParticipation[]) {
    return Promise.all(entities.map((e) => this.mapWithRelations(e)));
  }

  private getMilestone(
    oldHours: number,
    newHours: number
  ): { hours: number; title: string; message: string; icon: string } | null {
    const MILESTONES = [
      {
        hours: 25,
        title: "وصلت إلى 25 ساعة تطوعية",
        message: "خطواتك الأولى رسمت أثراً حقيقياً. 25 ساعة من العطاء تستحق الاحتفال!",
        icon: "Sprout"
      },
      {
        hours: 100,
        title: "100 ساعة تطوعية — مرحباً بك في نادي المئة",
        message: "وصلت إلى 100 ساعة! هذا الرقم يعني عشرات الأشخاص تأثروا بعملك. استمر.",
        icon: "Award"
      },
      {
        hours: 250,
        title: "250 ساعة — أثرك يتجاوز الأرقام",
        message: "ربع الألف ساعة! أنت لم تعد متطوعاً عادياً — أنت نموذج يُحتذى به.",
        icon: "Flame"
      },
      {
        hours: 500,
        title: "500 ساعة من العطاء المتواصل",
        message: "نصف الألف وصلت. مسيرتك التطوعية أصبحت قصة إلهام حقيقية تستحق أن تُروى.",
        icon: "Crown"
      },
      {
        hours: 1000,
        title: "ألف ساعة — أنت أسطورة التطوع",
        message: "1000 ساعة! رحلة استثنائية من الإنسانية والعطاء. شكراً لأنك تجعل العالم أجمل.",
        icon: "Rocket"
      }
    ];

    return MILESTONES.find((m) => oldHours < m.hours && newHours >= m.hours) ?? null;
  }

  async createJoinRequest(activityId: string, volunteerId: string): Promise<CreateJoinRequestResponse> {
    try {
      guard(activityId, "معرّف النشاط مطلوب");

      const activity = await this.activityRepository.findById(activityId);
      if (!activity) return fail("NOT_FOUND", "النشاط غير موجود");
      if (activity.status !== ActivityStatus.PUBLISHED) return fail("INVALID_STATE", "النشاط غير منشور");
      if (activity.isFull()) return fail("INVALID_STATE", "النشاط مكتمل");

      const existing = await this.participationRepository.findByActivityAndVolunteer(activityId, volunteerId);
      if (existing) {
        if (existing.status === ParticipationStatus.PENDING) return fail("CONFLICT", "لديك طلب قيد المراجعة بالفعل");
        if (existing.status === ParticipationStatus.APPROVED) return fail("CONFLICT", "أنت مشارك بالفعل في هذا النشاط");
        existing.reactivate();
        const updated = await this.participationRepository.update(existing);
        logger.info(ActivityParticipationUseCase.SCOPE, "createJoinRequest", `Reactivated for activity: ${activityId}`);
        return ok({ participation: await this.mapWithRelations(updated) });
      }

      const participation = ActivityParticipation.create({ activityId, volunteerId });
      const created = await this.participationRepository.create(participation);
      logger.info(ActivityParticipationUseCase.SCOPE, "createJoinRequest", `Created for activity: ${activityId}`);
      return ok({ participation: await this.mapWithRelations(created) });
    } catch (error) {
      return serviceError(
        ActivityParticipationUseCase.SCOPE,
        "createJoinRequest",
        error,
        "حدث خطأ أثناء إنشاء طلب الانضمام"
      );
    }
  }

  async approve(id: string): Promise<ApproveJoinRequestResponse> {
    try {
      const participation = await this.findOrFail(id);

      const activity = await this.activityRepository.findById(participation.activityId);
      if (!activity) return fail("NOT_FOUND", "النشاط غير موجود");
      if (activity.isFull()) return fail("INVALID_STATE", "النشاط مكتمل");

      participation.approve();
      activity.addVolunteer();

      await this.participationRepository.update(participation);
      await this.activityRepository.update(activity);

      const notifications: Prisma.NotificationCreateManyInput[] = [
        {
          userId: participation.volunteerId,
          type: NotificationType.PARTICIPATION_APPROVED,
          title: "تمت الموافقة على طلبك",
          message: `يسعدنا إبلاغك بقبول مشاركتك في نشاط "${activity.title}". نتطلع لرؤيتك!`,
          metadata: { activityId: activity.id, link: ROUTES.ACTIVITY_DETAILS(activity.id) }
        }
      ];

      if (activity.isFull()) {
        const pending = await this.participationRepository.findPendingByActivity(activity.id);
        pending.forEach((p) => {
          notifications.push({
            userId: p.volunteerId,
            type: NotificationType.ACTIVITY_FULL,
            title: "اكتملت أماكن النشاط",
            message: `اكتملت جميع أماكن نشاط "${activity.title}". تابع الفرص الجديدة — هناك دائماً فرصة قادمة لك.`,
            metadata: { activityId: activity.id, link: ROUTES.ACTIVITY_DETAILS(activity.id) }
          });
        });
      }

      await prisma.notification.createMany({ data: notifications });

      void sendPushToUser(participation.volunteerId, {
        title: "تمت الموافقة على طلبك",
        body: `قُبلت مشاركتك في نشاط "${activity.title}"`,
        url: ROUTES.ACTIVITY_DETAILS(activity.id),
        tag: `approved-${activity.id}`
      });

      if (activity.isFull()) {
        const pendingVolunteerIds = (await this.participationRepository.findPendingByActivity(activity.id)).map(
          (p) => p.volunteerId
        );
        if (pendingVolunteerIds.length) {
          void sendPushToMany(pendingVolunteerIds, {
            title: "اكتملت أماكن النشاط",
            body: `اكتملت جميع أماكن نشاط "${activity.title}"`,
            url: ROUTES.ACTIVITIES,
            tag: `full-${activity.id}`
          });
        }
      }

      logger.info(ActivityParticipationUseCase.SCOPE, "approve", `Approved: ${id}`);
      await this.maybeEnqueueAttendeeSync(activity);
      return ok({ participation: await this.mapWithRelations(participation) });
    } catch (error) {
      return serviceError(ActivityParticipationUseCase.SCOPE, "approve", error, "حدث خطأ أثناء الموافقة على الطلب");
    }
  }

  async reject(id: string): Promise<RejectJoinRequestResponse> {
    try {
      const participation = await this.findOrFail(id);
      const wasApproved = participation.status === ParticipationStatus.APPROVED;

      const activity = await this.activityRepository.findById(participation.activityId);

      participation.reject();

      if (wasApproved && activity) {
        activity.removeVolunteer();
        await this.activityRepository.update(activity);
      }

      await this.participationRepository.update(participation);

      if (activity) {
        await prisma.notification.create({
          data: {
            userId: participation.volunteerId,
            type: NotificationType.PARTICIPATION_REJECTED,
            title: "تحديث حول طلب مشاركتك",
            message: `شكراً لاهتمامك بنشاط "${activity.title}". للأسف لم تتوفر مقعد هذه المرة، لكن هناك فرص قادمة بانتظارك.`,
            metadata: { activityId: activity.id, link: ROUTES.ACTIVITY_DETAILS(activity.id) }
          }
        });

        void sendPushToUser(participation.volunteerId, {
          title: "تحديث حول طلب مشاركتك",
          body: `شكراً لاهتمامك بنشاط "${activity.title}". هناك فرص أخرى بانتظارك.`,
          url: ROUTES.ACTIVITIES,
          tag: `rejected-${activity.id}`
        });
      }

      logger.info(ActivityParticipationUseCase.SCOPE, "reject", `Rejected: ${id}`);
      await this.maybeEnqueueAttendeeSync(activity);
      return ok({ participation: await this.mapWithRelations(participation) });
    } catch (error) {
      return serviceError(ActivityParticipationUseCase.SCOPE, "reject", error, "حدث خطأ أثناء رفض الطلب");
    }
  }

  async cancelRequest(id: string, volunteerId: string): Promise<CancelJoinRequestResponse> {
    try {
      const participation = await this.findOrFail(id);
      if (participation.volunteerId !== volunteerId) return fail("FORBIDDEN", "لا يمكنك إلغاء طلب شخص آخر");

      const activity = await this.activityRepository.findById(participation.activityId);
      if (!activity) return fail("NOT_FOUND", "النشاط غير موجود");

      const hoursUntilActivity = (activity.date.getTime() - Date.now()) / (1000 * 60 * 60);
      if (hoursUntilActivity < 24)
        return fail("INVALID_STATE", "لا يمكن إلغاء الطلب قبل أقل من 24 ساعة من موعد النشاط");

      const wasApproved = participation.status === ParticipationStatus.APPROVED;
      participation.cancelRequest();

      if (wasApproved) {
        activity.removeVolunteer();
        await this.activityRepository.update(activity);
      }

      await this.participationRepository.update(participation);
      await this.maybeEnqueueAttendeeSync(activity);
      logger.info(ActivityParticipationUseCase.SCOPE, "cancelRequest", `Cancelled: ${id}`);
      return ok({ participation: await this.mapWithRelations(participation) });
    } catch (error) {
      return serviceError(ActivityParticipationUseCase.SCOPE, "cancelRequest", error, "حدث خطأ أثناء إلغاء الطلب");
    }
  }

  async markAttendance(dto: MarkAttendanceRequest): Promise<MarkAttendanceResponse> {
    try {
      guard(dto.participationId, "معرّف المشاركة مطلوب");

      const participation = await this.findOrFail(dto.participationId);
      const wasAttended = participation.wasAttended();
      const oldHours = participation.volunteerHours ?? 0;

      const activity = await this.activityRepository.findById(participation.activityId);
      if (!activity) return fail("NOT_FOUND", "النشاط غير موجود");

      const durationHours = activity.durationHours;
      if (dto.attended) participation.markAttended(durationHours);
      else participation.markAbsent();

      await prisma.$transaction(async (tx) => {
        await tx.activityParticipation.update({
          where: { id: participation.id },
          data: {
            attendanceStatus: participation.attendanceStatus,
            volunteerHours: participation.volunteerHours,
            markedAt: participation.markedAt,
            updatedAt: new Date()
          }
        });

        const profile = await this.volunteerProfileRepository.findByUserId(participation.volunteerId);
        if (profile) {
          let newHours = profile.totalVolunteerHours;
          if (dto.attended) {
            if (wasAttended) newHours = Math.max(0, Math.round((newHours - oldHours) * 100) / 100);
            newHours = Math.round((newHours + durationHours) * 100) / 100;
          } else if (wasAttended) {
            newHours = Math.max(0, Math.round((newHours - oldHours) * 100) / 100);
          }
          await tx.volunteerProfile.update({
            where: { userId: participation.volunteerId },
            data: { totalVolunteerHours: newHours, updatedAt: new Date() }
          });
        }
      });

      logger.info(ActivityParticipationUseCase.SCOPE, "markAttendance", {
        id: dto.participationId,
        attended: dto.attended
      });
      return ok({ participation: await this.mapWithRelations(participation) });
    } catch (error) {
      return serviceError(ActivityParticipationUseCase.SCOPE, "markAttendance", error, "حدث خطأ أثناء تسجيل الحضور");
    }
  }

  async bulkMarkAttendance(dto: BulkMarkAttendanceRequest): Promise<BulkMarkAttendanceResponse> {
    try {
      if (!dto.items?.length) return fail("VALIDATION_ERROR", "لا توجد عناصر للتحديث");

      const ids = dto.items.map((i) => i.participationId);
      const attendedMap = new Map(dto.items.map((i) => [i.participationId, i.attended]));
      const now = new Date();

      const participations = await prisma.activityParticipation.findMany({ where: { id: { in: ids } } });
      if (!participations.length) return ok({ count: 0 });

      const activityIds = [...new Set(participations.map((p) => p.activityId))];
      const activities = await prisma.activity.findMany({
        where: { id: { in: activityIds } },
        select: { id: true, durationHours: true }
      });
      const activityMap = new Map(activities.map((a) => [a.id, a.durationHours]));

      const volunteerIds = [...new Set(participations.map((p) => p.volunteerId))];
      const profiles = await prisma.volunteerProfile.findMany({
        where: { userId: { in: volunteerIds } },
        select: { userId: true, totalVolunteerHours: true }
      });
      const profileHoursMap = new Map(profiles.map((p) => [p.userId, p.totalVolunteerHours]));
      const profileOldHoursMap = new Map(profiles.map((p) => [p.userId, p.totalVolunteerHours]));
      const existingProfileIds = new Set(profiles.map((p) => p.userId));

      const participationUpdates: { id: string; attendanceStatus: string; volunteerHours: number | null }[] = [];

      for (const p of participations) {
        const attended = attendedMap.get(p.id) ?? false;
        const durationHours = activityMap.get(p.activityId) ?? 0;
        const wasAttended = p.attendanceStatus === "ATTENDED";
        const oldHours = p.volunteerHours ?? 0;

        participationUpdates.push({
          id: p.id,
          attendanceStatus: attended ? "ATTENDED" : "ABSENT",
          volunteerHours: attended ? durationHours : null
        });

        if (!existingProfileIds.has(p.volunteerId)) continue;

        let currentHours = profileHoursMap.get(p.volunteerId) ?? 0;
        if (attended) {
          if (wasAttended) currentHours = Math.max(0, Math.round((currentHours - oldHours) * 100) / 100);
          currentHours = Math.round((currentHours + durationHours) * 100) / 100;
        } else if (wasAttended) {
          currentHours = Math.max(0, Math.round((currentHours - oldHours) * 100) / 100);
        }
        profileHoursMap.set(p.volunteerId, currentHours);
      }

      const safeVolunteerIds = volunteerIds.filter((id) => existingProfileIds.has(id));

      const milestoneNotifications: Prisma.NotificationCreateManyInput[] = [];

      for (const userId of safeVolunteerIds) {
        const oldTotal = profileOldHoursMap.get(userId) ?? 0;
        const newTotal = profileHoursMap.get(userId) ?? 0;
        const milestone = this.getMilestone(oldTotal, newTotal);
        if (milestone) {
          milestoneNotifications.push({
            userId,
            type: NotificationType.HOURS_MILESTONE,
            title: milestone.title,
            message: milestone.message,
            metadata: { hours: milestone.hours, icon: milestone.icon }
          });
        }
      }

      await prisma.$transaction(async (tx) => {
        await Promise.all([
          ...participationUpdates.map((u) =>
            tx.activityParticipation.updateMany({
              where: { id: u.id },
              data: {
                attendanceStatus: u.attendanceStatus,
                volunteerHours: u.volunteerHours,
                markedAt: now,
                updatedAt: now
              }
            })
          ),
          ...safeVolunteerIds.map((userId) =>
            tx.volunteerProfile.updateMany({
              where: { userId },
              data: { totalVolunteerHours: profileHoursMap.get(userId) ?? 0, updatedAt: now }
            })
          )
        ]);
      });

      if (milestoneNotifications.length) {
        await prisma.notification.createMany({ data: milestoneNotifications });
        logger.info(
          ActivityParticipationUseCase.SCOPE,
          "bulkMarkAttendance",
          `Milestones fired=${milestoneNotifications.length}`
        );
      }

      logger.info(ActivityParticipationUseCase.SCOPE, "bulkMarkAttendance", `count=${participations.length}`);
      return ok({ count: participations.length });
    } catch (error) {
      return serviceError(
        ActivityParticipationUseCase.SCOPE,
        "bulkMarkAttendance",
        error,
        "حدث خطأ أثناء تسجيل الحضور"
      );
    }
  }

  async getAllPending(): Promise<GetJoinRequestsResponse> {
    try {
      const participations = await this.participationRepository.findAllPending();
      logger.info(ActivityParticipationUseCase.SCOPE, "getAllPending", `Found ${participations.length} pending`);
      return ok({ requests: await this.mapListWithRelations(participations) });
    } catch (error) {
      return serviceError(
        ActivityParticipationUseCase.SCOPE,
        "getAllPending",
        error,
        "حدث خطأ أثناء جلب الطلبات المعلقة"
      );
    }
  }

  async getByVolunteer(volunteerId: string): Promise<GetJoinRequestsResponse> {
    try {
      guard(volunteerId, "معرّف المتطوع مطلوب");
      const participations = await this.participationRepository.findByVolunteer(volunteerId);
      logger.info(
        ActivityParticipationUseCase.SCOPE,
        "getByVolunteer",
        `Found ${participations.length} for: ${volunteerId}`
      );
      return ok({ requests: await this.mapListWithRelations(participations) });
    } catch (error) {
      return serviceError(
        ActivityParticipationUseCase.SCOPE,
        "getByVolunteer",
        error,
        "حدث خطأ أثناء جلب طلبات المتطوع"
      );
    }
  }
}

export default ActivityParticipationUseCase;
