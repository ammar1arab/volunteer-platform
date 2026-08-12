import IActivityParticipationRepository from "./IActivityParticipationRepository";
import type { ActivityParticipation as PrismaParticipation } from "@prisma/client";
import { prisma } from "@/infrastructure/persistence/prisma";
import { ActivityParticipation } from "@/core/domain/entities";
import { ParticipationStatus, AttendanceStatus, JordanianCity, Gender } from "@/core/domain/enums";
import { ApprovedVolunteerRow } from "@/core/application/dtos";

class ActivityParticipationRepository implements IActivityParticipationRepository {
  private mapToEntity(data: PrismaParticipation): ActivityParticipation {
    return new ActivityParticipation({
      ...data,
      status: data.status as ParticipationStatus,
      attendanceStatus: (data.attendanceStatus as AttendanceStatus) ?? AttendanceStatus.NOT_MARKED,
      volunteerHours: data.volunteerHours ?? null,
      markedAt: data.markedAt ?? null,
      respondedAt: data.respondedAt ?? undefined
    });
  }

  async findById(id: string): Promise<ActivityParticipation | null> {
    const data = await prisma.activityParticipation.findUnique({ where: { id } });
    return data ? this.mapToEntity(data) : null;
  }

  async sumAttendedHours(userId: string): Promise<number> {
    const result = await prisma.activityParticipation.aggregate({
      where: { volunteerId: userId, attendanceStatus: "ATTENDED" },
      _sum: { volunteerHours: true }
    });
    return result._sum.volunteerHours ?? 0;
  }

  async findByActivityAndVolunteer(activityId: string, volunteerId: string): Promise<ActivityParticipation | null> {
    const data = await prisma.activityParticipation.findUnique({
      where: { activityId_volunteerId: { activityId, volunteerId } }
    });
    return data ? this.mapToEntity(data) : null;
  }

  async findPendingByActivity(activityId: string): Promise<ActivityParticipation[]> {
    const rows = await prisma.activityParticipation.findMany({
      where: { activityId, status: ParticipationStatus.PENDING },
      orderBy: { requestedAt: "desc" }
    });
    return rows.map((row) => this.mapToEntity(row));
  }

  async findAllPending(): Promise<ActivityParticipation[]> {
    const rows = await prisma.activityParticipation.findMany({
      where: { status: ParticipationStatus.PENDING },
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


  async findApprovedByActivity(activityId: string): Promise<ActivityParticipation[]> {
    const rows = await prisma.activityParticipation.findMany({
      where: { activityId, status: ParticipationStatus.APPROVED },
      orderBy: { requestedAt: "desc" }
    });
    return rows.map((row) => this.mapToEntity(row));
  }


  async countNotMarked(activityId: string): Promise<number> {
    return prisma.activityParticipation.count({
      where: {
        activityId,
        status: ParticipationStatus.APPROVED,
        attendanceStatus: AttendanceStatus.NOT_MARKED
      }
    });
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
      where: { activityId, status: ParticipationStatus.APPROVED },
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
      },
      orderBy: { requestedAt: "desc" }
    });

    return rows.map((r) => ({
      participationId: r.id,
      id: r.volunteer.id,
      fullName: r.volunteer.fullName,
      email: r.volunteer.email,
      phone: r.volunteer.phone,
      profilePictureUrl: r.volunteer.volunteerProfile?.profilePictureUrl ?? null,
      city: (r.volunteer.volunteerProfile?.city ?? null) as JordanianCity | null,
      dateOfBirth: r.volunteer.volunteerProfile?.dateOfBirth ?? null,
      gender: (r.volunteer.volunteerProfile?.gender ?? null) as Gender | null,
      attendanceStatus: r.attendanceStatus as AttendanceStatus,
      volunteerHours: r.volunteerHours ?? null
    }));
  }
}

export default ActivityParticipationRepository;
