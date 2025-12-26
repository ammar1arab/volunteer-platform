import { ActivityRepository } from "@/infrastructure/persistence/repositories";
import { InputSanitizer } from "@/infrastructure/security";
import { Activity } from "@/core/domain/entities";
import { DayOfWeek } from "@/core/domain/enums";
import { serviceError, logger } from "@/core/application/helpers";

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

  private sanitizeTextFields(dto: {
    title?: string;
    description?: string;
    placeName?: string;
  }) {
    return {
      title: dto.title ? InputSanitizer.sanitizeString(dto.title) : undefined,
      description: dto.description ? InputSanitizer.sanitizeString(dto.description) : undefined,
      placeName: dto.placeName ? InputSanitizer.sanitizeString(dto.placeName) : undefined,
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

  async create(dto: CreateActivityRequest, userId: string): Promise<CreateActivityResponse> {
    try {
      logger.info(ActivityService.SCOPE, "create", `Creating activity for user: ${userId}`);

      const sanitized = this.sanitizeTextFields({
        title: dto.title,
        description: dto.description,
        placeName: dto.placeName,
      });

      const payload = {
        title: sanitized.title!,
        description: sanitized.description!,
        imageUrl: dto.imageUrl,
        placeName: sanitized.placeName!,
        startTime: dto.startTime,
        endTime: dto.endTime,
      };

      const err = this.validateRequiredFields(payload);
      if (err) {
        logger.warn(ActivityService.SCOPE, "create", `Validation failed: ${err}`);
        return { success: false, error: err };
      }

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
      logger.info(ActivityService.SCOPE, "create", `Activity created: ${created.id}`);

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

  async update(id: string, dto: UpdateActivityRequest): Promise<UpdateActivityResponse> {
    try {
      if (!id?.trim()) {
        logger.warn(ActivityService.SCOPE, "update", "Id is required");
        return { success: false, error: "Id is required" };
      }

      logger.info(ActivityService.SCOPE, "update", `Updating activity: ${id}`);

      const existing = await this.activityRepository.findById(id);
      if (!existing) {
        logger.warn(ActivityService.SCOPE, "update", `Activity not found: ${id}`);
        return { success: false, error: "Activity not found" };
      }

      const sanitized = this.sanitizeTextFields({
        title: dto.title,
        description: dto.description,
        placeName: dto.placeName,
      });

      const updateData: {
        title?: string;
        description?: string;
        placeName?: string;
        imageUrl?: string;
        dayOfWeek?: DayOfWeek;
        date?: Date;
        startTime?: string;
        endTime?: string;
        location?: { latitude: number; longitude: number; address: string };
        targetAudience?: string;
        maxVolunteers?: number;
      } = {};

      if (sanitized.title !== undefined) updateData.title = sanitized.title;
      if (sanitized.description !== undefined) updateData.description = sanitized.description;
      if (sanitized.placeName !== undefined) updateData.placeName = sanitized.placeName;

      if (dto.imageUrl !== undefined) updateData.imageUrl = dto.imageUrl;
      if (dto.dayOfWeek !== undefined) updateData.dayOfWeek = dto.dayOfWeek;
      if (dto.date !== undefined) updateData.date = new Date(dto.date);
      if (dto.startTime !== undefined) updateData.startTime = dto.startTime;
      if (dto.endTime !== undefined) updateData.endTime = dto.endTime;
      if (dto.location !== undefined) updateData.location = dto.location;
      if (dto.targetAudience !== undefined) updateData.targetAudience = dto.targetAudience;
      if (dto.maxVolunteers !== undefined) updateData.maxVolunteers = dto.maxVolunteers;

      existing.update(updateData);

      const updated = await this.activityRepository.update(existing);
      logger.info(ActivityService.SCOPE, "update", `Activity updated: ${id}`);

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
      if (!id?.trim()) {
        logger.warn(ActivityService.SCOPE, "delete", "Id is required");
        return { success: false, error: "Id is required" };
      }

      logger.info(ActivityService.SCOPE, "delete", `Deleting activity: ${id}`);

      const deleted = await this.activityRepository.delete(id);
      if (!deleted) {
        logger.warn(ActivityService.SCOPE, "delete", `Activity not found: ${id}`);
        return { success: false, error: "Activity not found", deleted: false };
      }

      logger.info(ActivityService.SCOPE, "delete", `Activity deleted: ${id}`);
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
      if (!id?.trim()) {
        logger.warn(ActivityService.SCOPE, "getOne", "Id is required");
        return { success: false, error: "Id is required" };
      }

      const activity = await this.activityRepository.findById(id);
      if (!activity) {
        logger.warn(ActivityService.SCOPE, "getOne", `Activity not found: ${id}`);
        return { success: false, error: "Activity not found" };
      }

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
      logger.info(ActivityService.SCOPE, "getAll", "Fetching all activities");

      const activities = await this.activityRepository.findAll();
      const items = activities.map((x) => this.toDto(x));

      logger.info(ActivityService.SCOPE, "getAll", `Found ${items.length} activities`);
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
      logger.info(ActivityService.SCOPE, "getPublished", "Fetching published activities");

      const activities = await this.activityRepository.findPublished();
      const items = activities.map((x) => this.toDto(x));

      logger.info(ActivityService.SCOPE, "getPublished", `Found ${items.length} published activities`);
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
        logger.warn(ActivityService.SCOPE, "getByCreator", "Creator id is required");
        return { success: false, error: "Creator id is required" };
      }

      logger.info(ActivityService.SCOPE, "getByCreator", `Fetching activities by creator: ${creatorId}`);

      const activities = await this.activityRepository.findByCreator(creatorId);
      const items = activities.map((x) => this.toDto(x));

      logger.info(ActivityService.SCOPE, "getByCreator", `Found ${items.length} activities`);
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
      if (!id?.trim()) {
        logger.warn(ActivityService.SCOPE, "publish", "Id is required");
        return { success: false, error: "Id is required" };
      }

      logger.info(ActivityService.SCOPE, "publish", `Publishing activity: ${id}`);

      const activity = await this.activityRepository.findById(id);
      if (!activity) {
        logger.warn(ActivityService.SCOPE, "publish", `Activity not found: ${id}`);
        return { success: false, error: "Activity not found" };
      }

      activity.publish();

      const updated = await this.activityRepository.update(activity);
      logger.info(ActivityService.SCOPE, "publish", `Activity published: ${id}`);

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
      if (!id?.trim()) {
        logger.warn(ActivityService.SCOPE, "cancel", "Id is required");
        return { success: false, error: "Id is required" };
      }

      logger.info(ActivityService.SCOPE, "cancel", `Cancelling activity: ${id}`);

      const activity = await this.activityRepository.findById(id);
      if (!activity) {
        logger.warn(ActivityService.SCOPE, "cancel", `Activity not found: ${id}`);
        return { success: false, error: "Activity not found" };
      }

      activity.cancel();

      const updated = await this.activityRepository.update(activity);
      logger.info(ActivityService.SCOPE, "cancel", `Activity cancelled: ${id}`);

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
}

export default ActivityService;