import { ActivityParticipation } from "@/core/domain/entities";
import { ActivityParticipationProps } from "@/core/domain/interfaces";
import { prisma } from "@/infrastructure/persistence/prisma";
import IActivityParticipationRepository from "./IActivityParticipationRepository";

class ActivityParticipationRepository
  implements IActivityParticipationRepository
{
  async findById(id: string): Promise<ActivityParticipation | null> {
    const participation = await prisma.activityParticipation.findUnique({
      where: { id },
    });

    if (!participation) return null;
    return this.toDomain(participation);
  }

  async findByActivityAndVolunteer(
    activityId: string,
    volunteerId: string
  ): Promise<ActivityParticipation | null> {
    const participation = await prisma.activityParticipation.findUnique({
      where: {
        activityId_volunteerId: {
          activityId,
          volunteerId,
        },
      },
    });

    if (!participation) return null;
    return this.toDomain(participation);
  }

  async findPendingByActivity(
    activityId: string
  ): Promise<ActivityParticipation[]> {
    const participations = await prisma.activityParticipation.findMany({
      where: {
        activityId,
        status: "PENDING",
      },
      orderBy: { requestedAt: "desc" },
    });

    return participations.map((p) => this.toDomain(p));
  }

  async findAllPending(): Promise<ActivityParticipation[]> {
    const participations = await prisma.activityParticipation.findMany({
      where: { status: "PENDING" },
      orderBy: { requestedAt: "desc" },
    });

    return participations.map((p) => this.toDomain(p));
  }

  async findByVolunteer(volunteerId: string): Promise<ActivityParticipation[]> {
    const participations = await prisma.activityParticipation.findMany({
      where: { volunteerId },
      orderBy: { requestedAt: "desc" },
    });

    return participations.map((p) => this.toDomain(p));
  }

  async create(
    participation: ActivityParticipation
  ): Promise<ActivityParticipation> {
    const props = participation.toObject();

    const created = await prisma.activityParticipation.create({
      data: {
        id: props.id,
        activityId: props.activityId,
        volunteerId: props.volunteerId,
        status: props.status,
        requestedAt: props.requestedAt,
        respondedAt: props.respondedAt,
        isActive: props.isActive,
        createdAt: props.createdAt,
        updatedAt: props.updatedAt,
      },
    });

    return this.toDomain(created);
  }

  async update(
    participation: ActivityParticipation
  ): Promise<ActivityParticipation> {
    const props = participation.toObject();

    const updated = await prisma.activityParticipation.update({
      where: { id: participation.id },
      data: {
        status: props.status,
        respondedAt: props.respondedAt,
        isActive: props.isActive,
        updatedAt: props.updatedAt,
      },
    });

    return this.toDomain(updated);
  }

  async delete(id: string): Promise<boolean> {
    try {
      await prisma.activityParticipation.delete({
        where: { id },
      });
      return true;
    } catch {
      return false;
    }
  }

  private toDomain(raw: {
    id: string;
    activityId: string;
    volunteerId: string;
    status: string;
    requestedAt: Date;
    respondedAt: Date | null;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
  }): ActivityParticipation {
    return new ActivityParticipation({
      id: raw.id,
      activityId: raw.activityId,
      volunteerId: raw.volunteerId,
      status: raw.status,
      requestedAt: raw.requestedAt,
      respondedAt: raw.respondedAt,
      isActive: raw.isActive,
      createdAt: raw.createdAt,
      updatedAt: raw.updatedAt,
    } as ActivityParticipationProps);
  }
}

export default ActivityParticipationRepository;
