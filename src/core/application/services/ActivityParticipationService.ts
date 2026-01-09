import {
  ActivityParticipationRepository,
  ActivityRepository,
  UserRepository,
} from "@/infrastructure/persistence/repositories";
import { ActivityParticipation } from "@/core/domain/entities";
import { serviceError } from "@/core/application/helpers";
import type {
  CreateJoinRequestResponse,
  GetJoinRequestsResponse,
  ApproveJoinRequestResponse,
  RejectJoinRequestResponse,
  ActivityParticipationDto,
} from "@/core/application/dtos";

class ActivityParticipationService {
  private static readonly SCOPE = "ActivityParticipationService";

  constructor(
    private participationRepository: ActivityParticipationRepository,
    private activityRepository: ActivityRepository,
    private userRepository: UserRepository
  ) {}

  private async toDto(
    entity: ActivityParticipation,
    includeRelations = false
  ): Promise<ActivityParticipationDto> {
    const props = entity.toObject();

    const dto: ActivityParticipationDto = {
      id: props.id,
      activityId: props.activityId,
      volunteerId: props.volunteerId,
      status: props.status,
      requestedAt: props.requestedAt.toISOString(),
      respondedAt: props.respondedAt?.toISOString(),
    };

    if (includeRelations) {
      const volunteer = await this.userRepository.findById(props.volunteerId);
      const activity = await this.activityRepository.findById(props.activityId);

      if (volunteer) {
        dto.volunteer = {
          id: volunteer.id,
          fullName: volunteer.fullName,
          email: volunteer.email,
          phone: volunteer.phone,
        };
      }

      if (activity) {
        const activityProps = activity.toObject();
        dto.activity = {
          id: activityProps.id,
          title: activityProps.title,
          description: activityProps.description,
          date: activityProps.date.toISOString(),
          startTime: activityProps.startTime,
          endTime: activityProps.endTime,
          placeName: activityProps.placeName,
          address: activityProps.location.address,
          targetAudience: activityProps.targetAudience,
          maxVolunteers: activityProps.maxVolunteers,
          currentVolunteers: activityProps.currentVolunteers,
          status: activityProps.status,
        };
      }
    }

    return dto;
  }

  async createJoinRequest(
    activityId: string,
    volunteerId: string
  ): Promise<CreateJoinRequestResponse> {
    try {
      if (!activityId?.trim()) {
        return { success: false, error: "Activity ID is required" };
      }

      const activity = await this.activityRepository.findById(activityId);
      if (!activity) {
        return { success: false, error: "Activity not found" };
      }

      if (activity.status !== "PUBLISHED") {
        return { success: false, error: "Activity is not published" };
      }

      if (activity.isFull()) {
        return { success: false, error: "Activity is full" };
      }

      const existing =
        await this.participationRepository.findByActivityAndVolunteer(
          activityId,
          volunteerId
        );

      if (existing) {
        if (existing.status === "PENDING") {
          return {
            success: false,
            error: "You already have a pending request",
          };
        }
        if (existing.status === "APPROVED") {
          return { success: false, error: "You are already a participant" };
        }
      }

      const participation = ActivityParticipation.create({
        activityId,
        volunteerId,
      });

      const created = await this.participationRepository.create(participation);
      const dtoResult = await this.toDto(created, true);

      return { success: true, participation: dtoResult };
    } catch (error) {
      return serviceError<CreateJoinRequestResponse>(
        ActivityParticipationService.SCOPE,
        "createJoinRequest",
        error,
        error instanceof Error ? error.message : "An error occurred"
      );
    }
  }

  async getAllPending(): Promise<GetJoinRequestsResponse> {
    try {
      const participations =
        await this.participationRepository.findAllPending();
      const requests = await Promise.all(
        participations.map((p) => this.toDto(p, true))
      );

      return { success: true, requests };
    } catch (error) {
      return serviceError<GetJoinRequestsResponse>(
        ActivityParticipationService.SCOPE,
        "getAllPending",
        error,
        "An error occurred"
      );
    }
  }

  async getByVolunteer(volunteerId: string): Promise<GetJoinRequestsResponse> {
    try {
      if (!volunteerId?.trim()) {
        return { success: false, error: "Volunteer ID is required" };
      }

      const participations = await this.participationRepository.findByVolunteer(
        volunteerId
      );
      const requests = await Promise.all(
        participations.map((p) => this.toDto(p, true))
      );

      return { success: true, requests };
    } catch (error) {
      return serviceError<GetJoinRequestsResponse>(
        ActivityParticipationService.SCOPE,
        "getByVolunteer",
        error,
        "An error occurred"
      );
    }
  }

  async approve(id: string): Promise<ApproveJoinRequestResponse> {
    try {
      if (!id?.trim()) {
        return { success: false, error: "Request ID is required" };
      }

      const participation = await this.participationRepository.findById(id);
      if (!participation) {
        return { success: false, error: "Request not found" };
      }

      const activity = await this.activityRepository.findById(
        participation.activityId
      );
      if (!activity) {
        return { success: false, error: "Activity not found" };
      }

      if (activity.isFull()) {
        return { success: false, error: "Activity is full" };
      }

      participation.approve();
      activity.addVolunteer();

      await this.participationRepository.update(participation);
      await this.activityRepository.update(activity);

      const dtoResult = await this.toDto(participation, true);
      return { success: true, participation: dtoResult };
    } catch (error) {
      return serviceError<ApproveJoinRequestResponse>(
        ActivityParticipationService.SCOPE,
        "approve",
        error,
        error instanceof Error ? error.message : "An error occurred"
      );
    }
  }

  async reject(id: string): Promise<RejectJoinRequestResponse> {
    try {
      if (!id?.trim()) {
        return { success: false, error: "Request ID is required" };
      }

      const participation = await this.participationRepository.findById(id);
      if (!participation) {
        return { success: false, error: "Request not found" };
      }

      participation.reject();
      await this.participationRepository.update(participation);

      const dtoResult = await this.toDto(participation, true);
      return { success: true, participation: dtoResult };
    } catch (error) {
      return serviceError<RejectJoinRequestResponse>(
        ActivityParticipationService.SCOPE,
        "reject",
        error,
        error instanceof Error ? error.message : "An error occurred"
      );
    }
  }
}

export default ActivityParticipationService;
