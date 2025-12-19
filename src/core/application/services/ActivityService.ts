import { ActivityRepository } from "@/infrastructure/persistence/repositories";
import { InputSanitizer } from "@/infrastructure/security";
import { Activity } from "@/core/domain/entities";
import { serviceError } from "@/core/application/helpers";

import type {
  CreateActivityRequest,
  CreateActivityResponse,
  UpdateActivityRequest,
  UpdateActivityResponse,
  GetActivityResponse,
  GetAllActivitiesResponse,
  DeleteActivityResponse,
  PublishActivityResponse,
  CancelActivityResponse,
  JoinActivityResponse,
  LeaveActivityResponse,
  ActivityDto,
} from "@/core/application/dtos";

class ActivityService {
  private static readonly SCOPE = "ActivityService";

  constructor(private activityRepository: ActivityRepository) {}

  private toDto(entity: Activity): ActivityDto {
    const props = entity.toObject();
    return {
      id: props.id,
      title: props.title,
      description: props.description,
      imageUrl: props.imageUrl,
      dayOfWeek: props.dayOfWeek,
      date: props.date.toISOString(),
      startTime: props.startTime,
      endTime: props.endTime,
      placeName: props.placeName,
      location: props.location,
      targetAudience: props.targetAudience,
      maxVolunteers: props.maxVolunteers,
      currentVolunteers: props.currentVolunteers,
      status: props.status,
      isFull: entity.isFull(),
      createdBy: props.createdBy,
      isActive: props.isActive,
      createdAt: props.createdAt.toISOString(),
      updatedAt: props.updatedAt.toISOString(),
    };
  }

  private sanitize(dto: {
    title: string;
    description: string;
    placeName: string;
  }) {
    return {
      title: InputSanitizer.sanitizeString(dto.title),
      description: InputSanitizer.sanitizeString(dto.description),
      placeName: InputSanitizer.sanitizeString(dto.placeName),
    };
  }

  private validateRequiredFields(payload: {
    title: string;
    description: string;
    imageUrl: string;
    placeName: string;
    startTime: string;
    endTime: string;
  }): string | null {
    if (!payload.title?.trim()) return "Title is required";
    if (!payload.description?.trim()) return "Description is required";
    if (!payload.imageUrl?.trim()) return "Image is required";
    if (!payload.placeName?.trim()) return "Place name is required";
    if (!payload.startTime?.trim()) return "Start time is required";
    if (!payload.endTime?.trim()) return "End time is required";
    return null;
  }

  async create(
    dto: CreateActivityRequest,
    userId: string
  ): Promise<CreateActivityResponse> {
    try {
      const sanitized = this.sanitize(dto);
      const payload = { ...dto, ...sanitized };

      const err = this.validateRequiredFields(payload);
      if (err) return { success: false, error: err };

      const activity = Activity.create({
        title: payload.title,
        description: payload.description,
        imageUrl: payload.imageUrl,
        dayOfWeek: dto.dayOfWeek,
        date: new Date(dto.date),
        startTime: dto.startTime,
        endTime: dto.endTime,
        placeName: payload.placeName,
        location: dto.location,
        targetAudience: dto.targetAudience,
        maxVolunteers: dto.maxVolunteers,
        createdBy: userId,
        isActive: true,
      });

      const created = await this.activityRepository.create(activity);
      return { success: true, activity: this.toDto(created) };
    } catch (error) {
      return serviceError<CreateActivityResponse>(
        ActivityService.SCOPE,
        "create",
        error,
        error instanceof Error ? error.message : "An error occurred while creating activity"
      );
    }
  }

  async update(
    id: string,
    dto: UpdateActivityRequest
  ): Promise<UpdateActivityResponse> {
    try {
      if (!id?.trim()) return { success: false, error: "Id is required" };

      const existing = await this.activityRepository.findById(id);
      if (!existing) return { success: false, error: "Activity not found" };

      const sanitized = dto.title || dto.description || dto.placeName
        ? this.sanitize({
            title: dto.title || existing.title,
            description: dto.description || existing.description,
            placeName: dto.placeName || existing.toObject().placeName,
          })
        : {};

      const updateData: any = {};
      if (dto.title !== undefined) updateData.title = sanitized.title;
      if (dto.description !== undefined) updateData.description = sanitized.description;
      if (dto.imageUrl !== undefined) updateData.imageUrl = dto.imageUrl;
      if (dto.dayOfWeek !== undefined) updateData.dayOfWeek = dto.dayOfWeek;
      if (dto.date !== undefined) updateData.date = new Date(dto.date);
      if (dto.startTime !== undefined) updateData.startTime = dto.startTime;
      if (dto.endTime !== undefined) updateData.endTime = dto.endTime;
      if (dto.placeName !== undefined) updateData.placeName = sanitized.placeName;
      if (dto.location !== undefined) updateData.location = dto.location;
      if (dto.targetAudience !== undefined) updateData.targetAudience = dto.targetAudience;
      if (dto.maxVolunteers !== undefined) updateData.maxVolunteers = dto.maxVolunteers;

      existing.update(updateData);

      const updated = await this.activityRepository.update(existing);
      return { success: true, activity: this.toDto(updated) };
    } catch (error) {
      return serviceError<UpdateActivityResponse>(
        ActivityService.SCOPE,
        "update",
        error,
        error instanceof Error ? error.message : "An error occurred while updating activity"
      );
    }
  }

  async delete(id: string): Promise<DeleteActivityResponse> {
    try {
      if (!id?.trim()) return { success: false, error: "Id is required" };

      const deleted = await this.activityRepository.delete(id);
      if (!deleted) {
        return { success: false, error: "Activity not found", deleted: false };
      }

      return { success: true, deleted: true };
    } catch (error) {
      return serviceError<DeleteActivityResponse>(
        ActivityService.SCOPE,
        "delete",
        error,
        "An error occurred while deleting activity"
      );
    }
  }

  async getOne(id: string): Promise<GetActivityResponse> {
    try {
      if (!id?.trim()) return { success: false, error: "Id is required" };

      const activity = await this.activityRepository.findById(id);
      if (!activity) return { success: false, error: "Activity not found" };

      return { success: true, activity: this.toDto(activity) };
    } catch (error) {
      return serviceError<GetActivityResponse>(
        ActivityService.SCOPE,
        "getOne",
        error,
        "An error occurred while fetching activity"
      );
    }
  }

  async getAll(): Promise<GetAllActivitiesResponse> {
    try {
      const activities = await this.activityRepository.findAll();
      const items = activities.map((x) => this.toDto(x));

      return { success: true, activities: items };
    } catch (error) {
      return serviceError<GetAllActivitiesResponse>(
        ActivityService.SCOPE,
        "getAll",
        error,
        "An error occurred while fetching activities"
      );
    }
  }

  async getPublished(): Promise<GetAllActivitiesResponse> {
    try {
      const activities = await this.activityRepository.findPublished();
      const items = activities.map((x) => this.toDto(x));

      return { success: true, activities: items };
    } catch (error) {
      return serviceError<GetAllActivitiesResponse>(
        ActivityService.SCOPE,
        "getPublished",
        error,
        "An error occurred while fetching published activities"
      );
    }
  }

  async getByCreator(creatorId: string): Promise<GetAllActivitiesResponse> {
    try {
      if (!creatorId?.trim()) {
        return { success: false, error: "Creator id is required" };
      }

      const activities = await this.activityRepository.findByCreator(creatorId);
      const items = activities.map((x) => this.toDto(x));

      return { success: true, activities: items };
    } catch (error) {
      return serviceError<GetAllActivitiesResponse>(
        ActivityService.SCOPE,
        "getByCreator",
        error,
        "An error occurred while fetching creator activities"
      );
    }
  }

  async publish(id: string): Promise<PublishActivityResponse> {
    try {
      if (!id?.trim()) return { success: false, error: "Id is required" };

      const activity = await this.activityRepository.findById(id);
      if (!activity) return { success: false, error: "Activity not found" };

      activity.publish();

      const updated = await this.activityRepository.update(activity);
      return { success: true, activity: this.toDto(updated) };
    } catch (error) {
      return serviceError<PublishActivityResponse>(
        ActivityService.SCOPE,
        "publish",
        error,
        error instanceof Error ? error.message : "An error occurred while publishing activity"
      );
    }
  }

  async cancel(id: string): Promise<CancelActivityResponse> {
    try {
      if (!id?.trim()) return { success: false, error: "Id is required" };

      const activity = await this.activityRepository.findById(id);
      if (!activity) return { success: false, error: "Activity not found" };

      activity.cancel();

      const updated = await this.activityRepository.update(activity);
      return { success: true, activity: this.toDto(updated) };
    } catch (error) {
      return serviceError<CancelActivityResponse>(
        ActivityService.SCOPE,
        "cancel",
        error,
        error instanceof Error ? error.message : "An error occurred while cancelling activity"
      );
    }
  }

  async joinActivity(activityId: string): Promise<JoinActivityResponse> {
    try {
      if (!activityId?.trim()) {
        return { success: false, error: "Activity id is required" };
      }

      const activity = await this.activityRepository.findById(activityId);
      if (!activity) return { success: false, error: "Activity not found" };

      activity.addVolunteer();

      await this.activityRepository.update(activity);

      return { success: true, message: "تم التسجيل بنجاح" };
    } catch (error) {
      return serviceError<JoinActivityResponse>(
        ActivityService.SCOPE,
        "joinActivity",
        error,
        error instanceof Error ? error.message : "An error occurred while joining activity"
      );
    }
  }

  async leaveActivity(activityId: string): Promise<LeaveActivityResponse> {
    try {
      if (!activityId?.trim()) {
        return { success: false, error: "Activity id is required" };
      }

      const activity = await this.activityRepository.findById(activityId);
      if (!activity) return { success: false, error: "Activity not found" };

      activity.removeVolunteer();

      await this.activityRepository.update(activity);

      return { success: true, message: "تم إلغاء التسجيل بنجاح" };
    } catch (error) {
      return serviceError<LeaveActivityResponse>(
        ActivityService.SCOPE,
        "leaveActivity",
        error,
        error instanceof Error ? error.message : "An error occurred while leaving activity"
      );
    }
  }
}

export default ActivityService;