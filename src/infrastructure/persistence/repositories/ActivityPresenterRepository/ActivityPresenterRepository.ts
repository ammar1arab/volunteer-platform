import IActivityPresenterRepository from "./IActivityPresenterRepository";
import type { ActivityPresenter as PrismaActivityPresenter } from "@prisma/client";
import { prisma } from "@/infrastructure/persistence/prisma";
import { ActivityPresenter } from "@/core/domain/entities";
import { PresenterRole } from "@/core/domain/enums";

class ActivityPresenterRepository implements IActivityPresenterRepository {
  private mapToEntity(data: PrismaActivityPresenter): ActivityPresenter {
    return ActivityPresenter.reconstitute({
      id: data.id,
      activityId: data.activityId,
      presenterId: data.presenterId,
      role: data.role as PresenterRole,
      topic: data.topic ?? null,
      createdAt: data.createdAt,
      updatedAt: data.updatedAt,
      isActive: data.isActive
    });
  }

  async findById(id: string): Promise<ActivityPresenter | null> {
    const data = await prisma.activityPresenter.findUnique({ where: { id } });
    return data ? this.mapToEntity(data) : null;
  }

  async findByActivity(activityId: string): Promise<ActivityPresenter[]> {
    const rows = await prisma.activityPresenter.findMany({
      where: { activityId, isActive: true },
      orderBy: { createdAt: "asc" }
    });
    return rows.map((row) => this.mapToEntity(row));
  }

  async findByActivityAndPresenter(
    activityId: string,
    presenterId: string
  ): Promise<ActivityPresenter | null> {
    const data = await prisma.activityPresenter.findUnique({
      where: { activityId_presenterId: { activityId, presenterId } }
    });
    return data ? this.mapToEntity(data) : null;
  }

  async findActivePrimaryByActivities(activityIds: string[]): Promise<Map<string, ActivityPresenter>> {
    const map = new Map<string, ActivityPresenter>();
    if (!activityIds.length) return map;

    const rows = await prisma.activityPresenter.findMany({
      where: {
        activityId: { in: activityIds },
        role: PresenterRole.PRIMARY,
        isActive: true
      },
      orderBy: { createdAt: "asc" }
    });

    for (const row of rows) {
      if (!map.has(row.activityId)) {
        map.set(row.activityId, this.mapToEntity(row));
      }
    }
    return map;
  }

  async create(presenter: ActivityPresenter): Promise<ActivityPresenter> {
    const props = presenter.toObject();
    const created = await prisma.activityPresenter.create({
      data: {
        id: props.id,
        activityId: props.activityId,
        presenterId: props.presenterId,
        role: props.role,
        topic: props.topic,
        isActive: props.isActive,
        createdAt: props.createdAt,
        updatedAt: props.updatedAt
      }
    });
    return this.mapToEntity(created);
  }

  async update(presenter: ActivityPresenter): Promise<ActivityPresenter> {
    const props = presenter.toObject();
    const updated = await prisma.activityPresenter.update({
      where: { id: props.id },
      data: {
        role: props.role,
        topic: props.topic,
        isActive: props.isActive,
        updatedAt: new Date()
      }
    });
    return this.mapToEntity(updated);
  }

  async delete(id: string): Promise<boolean> {
    try {
      await prisma.activityPresenter.delete({ where: { id } });
      return true;
    } catch {
      return false;
    }
  }
}

export default ActivityPresenterRepository;
