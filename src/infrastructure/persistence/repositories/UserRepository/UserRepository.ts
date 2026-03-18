import IUserRepository from "./IUserRespository";
import type { User as PrismaUser } from "@prisma/client";
import { prisma } from "@/infrastructure/persistence/prisma";
import { User } from "@/core/domain/entities";
import { UserRole } from "@/core/domain/enums";
import { JordanianCity, Gender } from "@prisma/client";
import type { EmailRecipientDto, EmailRecipientFilters } from "@/core/application/dtos";

class UserRepository implements IUserRepository {
  private mapToEntity(data: PrismaUser): User {
    return new User({ ...data, role: data.role as UserRole });
  }

  async findByEmail(email: string): Promise<User | null> {
    const data = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
    return data ? this.mapToEntity(data) : null;
  }

  async findById(id: string): Promise<User | null> {
    const data = await prisma.user.findUnique({ where: { id } });
    return data ? this.mapToEntity(data) : null;
  }

  async create(user: User): Promise<User> {
    const props   = user.toObject();
    const created = await prisma.user.create({ data: props });
    return this.mapToEntity(created);
  }

  async update(user: User): Promise<User> {
    const props   = user.toObject();
    const updated = await prisma.user.update({
      where: { id: props.id },
      data: {
        email:     props.email,
        fullName:  props.fullName,
        phone:     props.phone,
        isActive:  props.isActive,
        updatedAt: new Date(),
      },
    });
    return this.mapToEntity(updated);
  }

  async delete(id: string): Promise<boolean> {
    try {
      await prisma.user.delete({ where: { id } });
      return true;
    } catch {
      return false;
    }
  }

  async findEmailRecipients(filters: EmailRecipientFilters): Promise<EmailRecipientDto[]> {
    const rows = await prisma.user.findMany({
      where: {
        role:     "VOLUNTEER",
        isActive: true,
        volunteerProfile: {
          isActive: true,
          ...(filters.target === "CITY" && filters.targetValue
            ? { city: filters.targetValue as JordanianCity }
            : {}),
          ...(filters.target === "GENDER" && filters.targetValue
            ? { gender: filters.targetValue as Gender }
            : {}),
          ...(filters.minHours
            ? { totalVolunteerHours: { gte: filters.minHours } }
            : {}),
        },
      },
      select: {
        id:       true,
        fullName: true,
        email:    true,
        volunteerProfile: {
          select: {
            city:                true,
            gender:              true,
            totalVolunteerHours: true,
            skills:              true,
          },
        },
      },
    });

    let result: EmailRecipientDto[] = rows.map((r) => ({
      id:     r.id,
      name:   r.fullName,
      email:  r.email,
      city:   r.volunteerProfile?.city   ?? null,
      gender: r.volunteerProfile?.gender ?? null,
      hours:  r.volunteerProfile?.totalVolunteerHours ?? 0,
    }));

    if (filters.skillFilter?.trim()) {
      const skill = filters.skillFilter.trim().toLowerCase();
      result = result.filter((r, i) => {
        const skills = (rows[i].volunteerProfile?.skills ?? []) as string[];
        return skills.some((s) => s.toLowerCase().includes(skill));
      });
    }

    return result;
  }
}

export default UserRepository;