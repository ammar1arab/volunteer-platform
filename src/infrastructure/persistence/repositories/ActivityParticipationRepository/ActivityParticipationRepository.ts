import IActivityParticipationRepository from "./IActivityParticipationRepository";

import type { ActivityParticipation as PrismaParticipation } from "@prisma/client";
import { prisma } from "@/infrastructure/persistence/prisma";

import { ActivityParticipation } from "@/core/domain/entities";
import { ApprovedVolunteerRow } from "@/core/application/dtos";

class ActivityParticipationRepository implements IActivityParticipationRepository {
  private mapToEntity(data: PrismaParticipation): ActivityParticipation {
    return new ActivityParticipation({
      ...data,
      respondedAt: data.respondedAt ?? undefined
    });
  }

  async findById(id: string): Promise<ActivityParticipation | null> {
    const data = await prisma.activityParticipation.findUnique({
      where: { id }
    });
    return data ? this.mapToEntity(data) : null;
  }

  async findByActivityAndVolunteer(activityId: string, volunteerId: string): Promise<ActivityParticipation | null> {
    const data = await prisma.activityParticipation.findUnique({
      where: { activityId_volunteerId: { activityId, volunteerId } }
    });
    return data ? this.mapToEntity(data) : null;
  }

  async findPendingByActivity(activityId: string): Promise<ActivityParticipation[]> {
    const rows = await prisma.activityParticipation.findMany({
      where: { activityId, status: "PENDING" },
      orderBy: { requestedAt: "desc" }
    });
    return rows.map((row) => this.mapToEntity(row));
  }

  async findAllPending(): Promise<ActivityParticipation[]> {
    const rows = await prisma.activityParticipation.findMany({
      where: { status: "PENDING" },
      orderBy: { requestedAt: "desc" }
    });
    return rows.map((row) => this.mapToEntity(row));
  }

  async findByVolunteer(volunteerId: string): Promise<ActivityParticipation[]> {
    const rows = await prisma.activityParticipation.findMany({
      where: { volunteerId },
      orderBy: { requestedAt: "desc" }
    });
    return rows.map((row) => this.mapToEntity(row));
  }

  async create(participation: ActivityParticipation): Promise<ActivityParticipation> {
    const props = participation.toObject();
    const created = await prisma.activityParticipation.create({ data: props });
    return this.mapToEntity(created);
  }

  async update(participation: ActivityParticipation): Promise<ActivityParticipation> {
    const props = participation.toObject();
    const updated = await prisma.activityParticipation.update({
      where: { id: props.id },
      data: { ...props, updatedAt: new Date() }
    });
    return this.mapToEntity(updated);
  }

  async delete(id: string): Promise<boolean> {
    try {
      await prisma.activityParticipation.delete({ where: { id } });
      return true;
    } catch {
      return false;
    }
  }

  async findApprovedVolunteers(activityId: string): Promise<ApprovedVolunteerRow[]> {
    const rows = await prisma.activityParticipation.findMany({
      where: { activityId, status: "APPROVED" },
      include: {
        volunteer: {
          include: {
            volunteerProfile: {
              select: {
                profilePictureUrl: true,
                city: true,
                dateOfBirth: true,
                gender: true
              }
            }
          }
        }
      }
    });

    return rows.map((r) => ({
      id: r.volunteer.id,
      fullName: r.volunteer.fullName,
      email: r.volunteer.email,
      phone: r.volunteer.phone,
      profilePictureUrl: r.volunteer.volunteerProfile?.profilePictureUrl ?? null,
      city: r.volunteer.volunteerProfile?.city ?? null,
      dateOfBirth: r.volunteer.volunteerProfile?.dateOfBirth ?? null,
      gender: r.volunteer.volunteerProfile?.gender ?? null
    }));
  }
}

export default ActivityParticipationRepository;
