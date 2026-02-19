import IVolunteerProfileRepository from "./IVolunteerProfileRepository";

import type { VolunteerProfile as PrismaVolunteerProfile } from "@prisma/client";
import { prisma } from "@/infrastructure/persistence/prisma";

import { VolunteerProfile } from "@/core/domain/entities";
import { JordanianCity, Gender } from "@/core/domain/enums";

class VolunteerProfileRepository implements IVolunteerProfileRepository {
  private mapToEntity(data: PrismaVolunteerProfile): VolunteerProfile {
    return new VolunteerProfile({
      ...data,
      city: data.city as JordanianCity,
      gender: (data.gender as Gender) ?? null,
      skills: data.skills ?? [],
      interests: data.interests ?? []
    });
  }

  async findByUserId(userId: string): Promise<VolunteerProfile | null> {
    const data = await prisma.volunteerProfile.findUnique({ where: { userId } });
    return data ? this.mapToEntity(data) : null;
  }

  async create(profile: VolunteerProfile): Promise<VolunteerProfile> {
    const props = profile.toObject();
    const created = await prisma.volunteerProfile.create({
      data: {
        ...props,
        city: props.city,
        gender: props.gender ?? null
      }
    });
    return this.mapToEntity(created);
  }

  async update(profile: VolunteerProfile): Promise<VolunteerProfile> {
    const props = profile.toObject();
    const updated = await prisma.volunteerProfile.update({
      where: { id: props.id },
      data: {
        ...props,
        city: props.city,
        gender: props.gender ?? null,
        updatedAt: new Date()
      }
    });
    return this.mapToEntity(updated);
  }

  async delete(id: string): Promise<boolean> {
    try {
      await prisma.volunteerProfile.delete({ where: { id } });
      return true;
    } catch {
      return false;
    }
  }
}

export default VolunteerProfileRepository;
