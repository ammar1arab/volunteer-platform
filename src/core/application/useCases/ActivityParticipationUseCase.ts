import {
  ActivityParticipationRepository,
  ActivityRepository,
  UserRepository,
  VolunteerProfileRepository
} from "@/infrastructure/persistence/repositories";
import { ActivityParticipation } from "@/core/domain/entities";
import { serviceError, guard } from "@/core/application/common";
import { toParticipationDto, toUserSummaryDto, toActivitySummaryDto } from "@/core/application/mappers";
import { ActivityStatus, ParticipationStatus } from "@/core/domain/enums";
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

class ActivityParticipationUseCase {
  private static readonly SCOPE = "ActivityParticipationUseCase";

  constructor(
    private participationRepository: ActivityParticipationRepository,
    private activityRepository: ActivityRepository,
    private userRepository: UserRepository,
    private volunteerProfileRepository: VolunteerProfileRepository
  ) {}

  private async findOrFail(id: string) {
    guard(id, "معرّف الطلب مطلوب");
    const participation = await this.participationRepository.findById(id);
    if (!participation)
      throw Object.assign(new Error(), {
        result: fail("NOT_FOUND", "الطلب غير موجود")
      });
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
        ? { ...toUserSummaryDto(volunteerUser), city: volunteerProfile?.city ?? undefined }
        : undefined,
      activity: activity ? toActivitySummaryDto(activity) : undefined
    });
  }

  private async mapListWithRelations(entities: ActivityParticipation[]) {
    return Promise.all(entities.map((e) => this.mapWithRelations(e)));
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

      logger.info(ActivityParticipationUseCase.SCOPE, "approve", `Approved: ${id}`);
      return ok({ participation: await this.mapWithRelations(participation) });
    } catch (error) {
      return serviceError(ActivityParticipationUseCase.SCOPE, "approve", error, "حدث خطأ أثناء الموافقة على الطلب");
    }
  }

  async reject(id: string): Promise<RejectJoinRequestResponse> {
    try {
      const participation = await this.findOrFail(id);
      const wasApproved = participation.status === ParticipationStatus.APPROVED;

      participation.reject();

      if (wasApproved) {
        const activity = await this.activityRepository.findById(participation.activityId);
        if (activity) {
          activity.removeVolunteer();
          await this.activityRepository.update(activity);
        }
      }

      await this.participationRepository.update(participation);
      logger.info(ActivityParticipationUseCase.SCOPE, "reject", `Rejected: ${id}`);
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

      if (dto.attended) {
        participation.markAttended(durationHours);
      } else {
        participation.markAbsent();
      }

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

      // 1 — fetch all participations at once
      const participations = await prisma.activityParticipation.findMany({
        where: { id: { in: ids } }
      });

      // 2 — fetch unique activities at once
      const activityIds = [...new Set(participations.map((p) => p.activityId))];
      const activities = await prisma.activity.findMany({
        where: { id: { in: activityIds } },
        select: { id: true, durationHours: true }
      });
      const activityMap = new Map(activities.map((a) => [a.id, a.durationHours]));

      // 3 — fetch all volunteer profiles at once
      const volunteerIds = [...new Set(participations.map((p) => p.volunteerId))];
      const profiles = await prisma.volunteerProfile.findMany({
        where: { userId: { in: volunteerIds } },
        select: { userId: true, totalVolunteerHours: true }
      });
      const profileHoursMap = new Map(profiles.map((p) => [p.userId, p.totalVolunteerHours]));

      // 4 — compute all updates in memory
      const participationUpdates: {
        id: string;
        attendanceStatus: string;
        volunteerHours: number | null;
      }[] = [];

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

        let currentHours = profileHoursMap.get(p.volunteerId) ?? 0;
        if (attended) {
          if (wasAttended) currentHours = Math.max(0, Math.round((currentHours - oldHours) * 100) / 100);
          currentHours = Math.round((currentHours + durationHours) * 100) / 100;
        } else if (wasAttended) {
          currentHours = Math.max(0, Math.round((currentHours - oldHours) * 100) / 100);
        }
        profileHoursMap.set(p.volunteerId, currentHours);
      }

      // 5 — one transaction, all updates in parallel inside it
      await prisma.$transaction(async (tx) => {
        await Promise.all([
          ...participationUpdates.map((u) =>
            tx.activityParticipation.update({
              where: { id: u.id },
              data: {
                attendanceStatus: u.attendanceStatus,
                volunteerHours: u.volunteerHours,
                markedAt: now,
                updatedAt: now
              }
            })
          ),
          ...volunteerIds.map((userId) =>
            tx.volunteerProfile.update({
              where: { userId },
              data: { totalVolunteerHours: profileHoursMap.get(userId) ?? 0, updatedAt: now }
            })
          )
        ]);
      });

      logger.info(ActivityParticipationUseCase.SCOPE, "bulkMarkAttendance", `count=${dto.items.length}`);
      return ok({ count: dto.items.length });
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
