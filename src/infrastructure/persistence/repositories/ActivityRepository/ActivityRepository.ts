import { Activity } from "@/core/domain/entities";
import { ActivityProps } from "@/core/domain/interfaces";
import { prisma } from "@/infrastructure/persistence/prisma";
import IActivityRepository from "./IActivityRepository";

class ActivityRepository implements IActivityRepository {
  async findById(id: string): Promise<Activity | null> {
    const activity = await prisma.activity.findUnique({
      where: { id },
    });

    if (!activity) return null;

    return this.toDomain(activity);
  }

  async findAll(): Promise<Activity[]> {
    const activities = await prisma.activity.findMany({
      orderBy: { date: "asc" },
    });

    return activities.map((a) => this.toDomain(a));
  }

  async findPublished(): Promise<Activity[]> {
    const activities = await prisma.activity.findMany({
      where: {
        status: "PUBLISHED",
        isActive: true,
      },
      orderBy: { date: "asc" },
    });

    return activities.map((a) => this.toDomain(a));
  }

  async findByCreator(creatorId: string): Promise<Activity[]> {
    const activities = await prisma.activity.findMany({
      where: { createdBy: creatorId },
      orderBy: { createdAt: "desc" },
    });

    return activities.map((a) => this.toDomain(a));
  }

  async create(activity: Activity): Promise<Activity> {
    const props = activity.toObject();
    const data = this.toPrismaData(props);

    const created = await prisma.activity.create({
      data: {
        ...data,
        createdAt: props.createdAt,
      },
    });

    return this.toDomain(created);
  }

  async update(activity: Activity): Promise<Activity> {
    const props = activity.toObject();
    const data = this.toPrismaData(props);

    const updated = await prisma.activity.update({
      where: { id: activity.id },
      data,
    });

    return this.toDomain(updated);
  }

  async delete(id: string): Promise<boolean> {
    try {
      await prisma.activity.delete({
        where: { id },
      });
      return true;
    } catch {
      return false;
    }
  }

  private toPrismaData(props: ActivityProps) {
    return {
      id: props.id,
      title: props.title,
      description: props.description,
      imageUrl: props.imageUrl,
      dayOfWeek: props.dayOfWeek,
      date: props.date,
      startTime: props.startTime,
      endTime: props.endTime,
      placeName: props.placeName,
      latitude: props.location.latitude,
      longitude: props.location.longitude,
      address: props.location.address,
      targetAudience: props.targetAudience,
      maxVolunteers: props.maxVolunteers,
      currentVolunteers: props.currentVolunteers,
      status: props.status,
      createdBy: props.createdBy,
      isActive: props.isActive,
      updatedAt: props.updatedAt,
    };
  }

  private toDomain(raw: {
    id: string;
    title: string;
    description: string;
    imageUrl: string;
    dayOfWeek: string;
    date: Date;
    startTime: string;
    endTime: string;
    placeName: string;
    latitude: number;
    longitude: number;
    address: string;
    targetAudience: string;
    maxVolunteers: number;
    currentVolunteers: number;
    status: string;
    createdBy: string;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
  }): Activity {
    return new Activity({
      id: raw.id,
      title: raw.title,
      description: raw.description,
      imageUrl: raw.imageUrl,
      dayOfWeek: raw.dayOfWeek,
      date: raw.date,
      startTime: raw.startTime,
      endTime: raw.endTime,
      placeName: raw.placeName,
      location: {
        latitude: raw.latitude,
        longitude: raw.longitude,
        address: raw.address,
      },
      targetAudience: raw.targetAudience,
      maxVolunteers: raw.maxVolunteers,
      currentVolunteers: raw.currentVolunteers,
      status: raw.status,
      createdBy: raw.createdBy,
      isActive: raw.isActive,
      createdAt: raw.createdAt,
      updatedAt: raw.updatedAt,
    } as ActivityProps);
  }
}

export default ActivityRepository;
