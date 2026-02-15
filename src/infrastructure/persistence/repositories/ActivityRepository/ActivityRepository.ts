import { Activity } from "@/core/domain/entities";
import { prisma } from "@/infrastructure/persistence/prisma";
import IActivityRepository from "./IActivityRepository";

class ActivityRepository implements IActivityRepository {
  private mapToEntity(data: any): Activity {
    return new Activity({
      id: data.id,
      title: data.title,
      description: data.description,
      imageUrl: data.imageUrl,
      dayOfWeek: data.dayOfWeek,
      date: data.date,
      startTime: data.startTime,
      endTime: data.endTime,
      placeName: data.placeName,
      location: {
        latitude: data.latitude,
        longitude: data.longitude,
        address: data.address,
      },
      targetAudience: data.targetAudience,
      maxVolunteers: data.maxVolunteers,
      currentVolunteers: data.currentVolunteers,
      status: data.status,
      createdBy: data.createdBy,
      isActive: data.isActive,
      createdAt: data.createdAt,
      updatedAt: data.updatedAt,
    });
  }

  async findById(id: string): Promise<Activity | null> {
    const data = await prisma.activity.findUnique({ where: { id } });
    return data ? this.mapToEntity(data) : null;
  }

  async findAll(): Promise<Activity[]> {
    const rows = await prisma.activity.findMany({ orderBy: { date: "asc" } });
    return rows.map(this.mapToEntity);
  }

  async findPublished(): Promise<Activity[]> {
    const rows = await prisma.activity.findMany({
      where: { status: "PUBLISHED", isActive: true },
      orderBy: { date: "asc" },
    });
    return rows.map(this.mapToEntity);
  }

  async findByCreator(creatorId: string): Promise<Activity[]> {
    const rows = await prisma.activity.findMany({
      where: { createdBy: creatorId },
      orderBy: { createdAt: "desc" },
    });
    return rows.map(this.mapToEntity);
  }

  async create(activity: Activity): Promise<Activity> {
    const props = activity.toObject();
    
    const { location, ...rest } = props;
    
    const created = await prisma.activity.create({
      data: {
        ...rest,
        latitude: location.latitude,
        longitude: location.longitude,
        address: location.address,
      },
    });
    
    return this.mapToEntity(created);
  }

  async update(activity: Activity): Promise<Activity> {
    const props = activity.toObject();
    
    const { location, ...rest } = props;
    
    const updated = await prisma.activity.update({
      where: { id: props.id },
      data: {
        ...rest,
        latitude: location.latitude,
        longitude: location.longitude,
        address: location.address,
        updatedAt: new Date(),
      },
    });
    
    return this.mapToEntity(updated);
  }

  async delete(id: string): Promise<boolean> {
    try {
      await prisma.activity.delete({ where: { id } });
      return true;
    } catch {
      return false;
    }
  }
}

export default ActivityRepository;