import {
  ActivityParticipationRepository,
  ActivityRepository,
  UserRepository,
} from "@/infrastructure/persistence/repositories";
import { ActivityParticipation } from "@/core/domain/entities";
import {
  ok,
  fail,
  serviceError,
  logger,
  guard,
} from "@/core/application/helpers";
import {
  toParticipationDto,
  toUserSummaryDto,
  toActivitySummaryDto,
} from "@/core/application/mappers";
import type {
  CreateJoinRequestResponse,
  GetJoinRequestsResponse,
  ApproveJoinRequestResponse,
  RejectJoinRequestResponse,
} from "@/core/application/dtos";

class ActivityParticipationService {
  private static readonly SCOPE = "ActivityParticipationService";

  constructor(
    private participationRepository: ActivityParticipationRepository,
    private activityRepository: ActivityRepository,
    private userRepository: UserRepository,
  ) {}

  private async findOrFail(id: string) {
    guard(id, "معرّف الطلب مطلوب");
    const participation = await this.participationRepository.findById(id);
    if (!participation)
      throw Object.assign(new Error(), {
        result: fail("NOT_FOUND", "الطلب غير موجود"),
      });
    return participation;
  }

  private async mapWithRelations(entity: ActivityParticipation) {
    const props = entity.toObject();
    const [volunteer, activity] = await Promise.all([
      this.userRepository.findById(props.volunteerId),
      this.activityRepository.findById(props.activityId),
    ]);

    return toParticipationDto(entity, {
      volunteer: volunteer ? toUserSummaryDto(volunteer) : undefined,
      activity: activity ? toActivitySummaryDto(activity) : undefined,
    });
  }

  private async mapListWithRelations(entities: ActivityParticipation[]) {
    return Promise.all(entities.map((e) => this.mapWithRelations(e)));
  }

  async createJoinRequest(
    activityId: string,
    volunteerId: string,
  ): Promise<CreateJoinRequestResponse> {
    try {
      guard(activityId, "معرّف النشاط مطلوب");

      const activity = await this.activityRepository.findById(activityId);
      if (!activity) return fail("NOT_FOUND", "النشاط غير موجود");
      if (activity.status !== "PUBLISHED")
        return fail("INVALID_STATE", "النشاط غير منشور");
      if (activity.isFull()) return fail("INVALID_STATE", "النشاط مكتمل");

      const existing =
        await this.participationRepository.findByActivityAndVolunteer(
          activityId,
          volunteerId,
        );
      if (existing) {
        if (existing.status === "PENDING")
          return fail("CONFLICT", "لديك طلب قيد المراجعة بالفعل");
        if (existing.status === "APPROVED")
          return fail("CONFLICT", "أنت مشارك بالفعل في هذا النشاط");
      }

      const participation = ActivityParticipation.create({
        activityId,
        volunteerId,
      });
      const created = await this.participationRepository.create(participation);

      logger.info(
        ActivityParticipationService.SCOPE,
        "createJoinRequest",
        `Created for activity: ${activityId}`,
      );
      return ok({ participation: await this.mapWithRelations(created) });
    } catch (error) {
      return serviceError(
        ActivityParticipationService.SCOPE,
        "createJoinRequest",
        error,
        "حدث خطأ أثناء إنشاء طلب الانضمام",
      );
    }
  }

  async approve(id: string): Promise<ApproveJoinRequestResponse> {
    try {
      const participation = await this.findOrFail(id);

      const activity = await this.activityRepository.findById(
        participation.activityId,
      );
      if (!activity) return fail("NOT_FOUND", "النشاط غير موجود");
      if (activity.isFull()) return fail("INVALID_STATE", "النشاط مكتمل");

      participation.approve();
      activity.addVolunteer();

      await this.participationRepository.update(participation);
      await this.activityRepository.update(activity);

      logger.info(
        ActivityParticipationService.SCOPE,
        "approve",
        `Approved: ${id}`,
      );
      return ok({ participation: await this.mapWithRelations(participation) });
    } catch (error) {
      return serviceError(
        ActivityParticipationService.SCOPE,
        "approve",
        error,
        "حدث خطأ أثناء الموافقة على الطلب",
      );
    }
  }

  async reject(id: string): Promise<RejectJoinRequestResponse> {
    try {
      const participation = await this.findOrFail(id);

      participation.reject();
      await this.participationRepository.update(participation);

      logger.info(
        ActivityParticipationService.SCOPE,
        "reject",
        `Rejected: ${id}`,
      );
      return ok({ participation: await this.mapWithRelations(participation) });
    } catch (error) {
      return serviceError(
        ActivityParticipationService.SCOPE,
        "reject",
        error,
        "حدث خطأ أثناء رفض الطلب",
      );
    }
  }

  async getAllPending(): Promise<GetJoinRequestsResponse> {
    try {
      const participations =
        await this.participationRepository.findAllPending();
      logger.info(
        ActivityParticipationService.SCOPE,
        "getAllPending",
        `Found ${participations.length} pending`,
      );
      return ok({ requests: await this.mapListWithRelations(participations) });
    } catch (error) {
      return serviceError(
        ActivityParticipationService.SCOPE,
        "getAllPending",
        error,
        "حدث خطأ أثناء جلب الطلبات المعلقة",
      );
    }
  }

  async getByVolunteer(volunteerId: string): Promise<GetJoinRequestsResponse> {
    try {
      guard(volunteerId, "معرّف المتطوع مطلوب");
      const participations =
        await this.participationRepository.findByVolunteer(volunteerId);
      logger.info(
        ActivityParticipationService.SCOPE,
        "getByVolunteer",
        `Found ${participations.length} for: ${volunteerId}`,
      );
      return ok({ requests: await this.mapListWithRelations(participations) });
    } catch (error) {
      return serviceError(
        ActivityParticipationService.SCOPE,
        "getByVolunteer",
        error,
        "حدث خطأ أثناء جلب طلبات المتطوع",
      );
    }
  }
}

export default ActivityParticipationService;
