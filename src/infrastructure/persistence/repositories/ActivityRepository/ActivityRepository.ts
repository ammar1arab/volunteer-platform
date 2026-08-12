import IActivityRepository from "./IActivityRepository";
import type { Activity as PrismaActivity } from "@prisma/client";
import { prisma } from "@/infrastructure/persistence/prisma";
import { Activity } from "@/core/domain/entities";
import {
  DayOfWeek,
  ActivityStatus,
  ActivityType,
  DomainFeaturedPostCategory,
  JordanianCity,
  MeetingPlatform,
  MeetingLinkSource,
  MeetingSyncStatus
} from "@/core/domain/enums";

class ActivityRepository implements IActivityRepository {
  private mapToEntity(data: PrismaActivity): Activity {
    return Activity.reconstitute({
      ...data,
      dayOfWeek: data.dayOfWeek as DayOfWeek,
      status: data.status as ActivityStatus,
      activityType: data.activityType as ActivityType,
      categories: (data.categories ?? []) as DomainFeaturedPostCategory[],
      city: (data.city as JordanianCity) ?? null,
      placeName: data.placeName ?? null,
      latitude: data.latitude ?? null,
      longitude: data.longitude ?? null,
      meetingLink: data.meetingLink ?? null,
      meetingPlatform: (data.meetingPlatform as MeetingPlatform) ?? null,
      externalMeetingId: data.externalMeetingId ?? null,
      meetingLinkSource: (data.meetingLinkSource as MeetingLinkSource) ?? MeetingLinkSource.MANUAL,
      meetingCode: data.meetingCode ?? null,
      meetingSpaceName: data.meetingSpaceName ?? null,
      meetingSyncStatus: (data.meetingSyncStatus as MeetingSyncStatus) ?? MeetingSyncStatus.NONE,
      meetingSyncError: data.meetingSyncError ?? null,
      meetingSyncedAt: data.meetingSyncedAt ?? null,
      timeZone: data.timeZone || Activity.DEFAULT_TIME_ZONE,
      durationHours: data.durationHours ?? 0,
      deletedAt: data.deletedAt ?? null
    });
  }

  async findById(id: string): Promise<Activity | null> {
    const data = await prisma.activity.findUnique({ where: { id, deletedAt: null } });
    return data ? this.mapToEntity(data) : null;
  }

  async findSummaryById(id: string): Promise<{ title: string; activityType: string; durationHours: number } | null> {
    const row = await prisma.activity.findUnique({
      where: { id, deletedAt: null },
      select: { title: true, activityType: true, durationHours: true }
    });
    return row ?? null;
  }

  async findAll(): Promise<Activity[]> {
    const rows = await prisma.activity.findMany({
      where: { deletedAt: null },
      orderBy: { date: "asc" }
    });
    return rows.map((row) => this.mapToEntity(row));
  }

  async findPublished(): Promise<Activity[]> {
    const rows = await prisma.activity.findMany({
      where: { status: ActivityStatus.PUBLISHED, isActive: true, deletedAt: null },
      orderBy: { date: "asc" }
    });
    return rows.map((row) => this.mapToEntity(row));
  }

  async findByCreator(creatorId: string): Promise<Activity[]> {
    const rows = await prisma.activity.findMany({
      where: { createdBy: creatorId, deletedAt: null },
      orderBy: { createdAt: "desc" }
    });
    return rows.map((row) => this.mapToEntity(row));
  }

  async create(activity: Activity): Promise<Activity> {
    const props = activity.toObject();
    const created = await prisma.activity.create({
      data: {
        id: props.id,
        title: props.title,
        description: props.description,
        imageUrl: props.imageUrl,
        dayOfWeek: props.dayOfWeek,
        date: props.date,
        startTime: props.startTime,
        endTime: props.endTime,
        durationHours: props.durationHours,
        maxVolunteers: props.maxVolunteers,
        currentVolunteers: props.currentVolunteers,
        status: props.status,
        activityType: props.activityType,
        categories: props.categories,
        createdBy: props.createdBy,
        isActive: props.isActive,
        createdAt: props.createdAt,
        updatedAt: props.updatedAt,
        deletedAt: null,
        placeName: props.placeName ?? null,
        city: props.city ?? null,
        latitude: props.latitude ?? null,
        longitude: props.longitude ?? null,
        meetingLink: props.meetingLink ?? null,
        meetingPlatform: props.meetingPlatform ?? null,
        externalMeetingId: props.externalMeetingId ?? null,
        meetingLinkSource: props.meetingLinkSource,
        meetingCode: props.meetingCode ?? null,
        meetingSpaceName: props.meetingSpaceName ?? null,
        meetingSyncStatus: props.meetingSyncStatus,
        meetingSyncError: props.meetingSyncError ?? null,
        meetingSyncedAt: props.meetingSyncedAt ?? null,
        timeZone: props.timeZone
      }
    });
    return this.mapToEntity(created);
  }

  async update(activity: Activity): Promise<Activity> {
    const props = activity.toObject();
    const updated = await prisma.activity.update({
      where: { id: props.id },
      data: {
        title: props.title,
        description: props.description,
        imageUrl: props.imageUrl,
        dayOfWeek: props.dayOfWeek,
        date: props.date,
        startTime: props.startTime,
        endTime: props.endTime,
        durationHours: props.durationHours,
        maxVolunteers: props.maxVolunteers,
        currentVolunteers: props.currentVolunteers,
        status: props.status,
        activityType: props.activityType,
        categories: props.categories,
        isActive: props.isActive,
        deletedAt: props.deletedAt,
        updatedAt: new Date(),
        placeName: props.placeName ?? null,
        city: props.city ?? null,
        latitude: props.latitude ?? null,
        longitude: props.longitude ?? null,
        meetingLink: props.meetingLink ?? null,
        meetingPlatform: props.meetingPlatform ?? null,
        externalMeetingId: props.externalMeetingId ?? null,
        meetingLinkSource: props.meetingLinkSource,
        meetingCode: props.meetingCode ?? null,
        meetingSpaceName: props.meetingSpaceName ?? null,
        meetingSyncStatus: props.meetingSyncStatus,
        meetingSyncError: props.meetingSyncError ?? null,
        meetingSyncedAt: props.meetingSyncedAt ?? null,
        timeZone: props.timeZone
      }
    });
    return this.mapToEntity(updated);
  }

  async delete(id: string): Promise<boolean> {
    try {
      await prisma.activity.update({
        where: { id, deletedAt: null },
        data: { deletedAt: new Date(), updatedAt: new Date() }
      });
      return true;
    } catch {
      return false;
    }
  }
}

export default ActivityRepository;
