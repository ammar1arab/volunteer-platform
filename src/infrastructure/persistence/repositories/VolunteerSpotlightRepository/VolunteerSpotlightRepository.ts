import IVolunteerSpotlightRepository from "./IVolunteerSpotlightRepository";

import type { VolunteerSpotlight as PrismaVolunteerSpotlight } from "@prisma/client";
import { prisma } from "@/infrastructure/persistence/prisma";
import { VolunteerSpotlight } from "@/core/domain/entities";
import { JordanianCity } from "@/core/domain/enums";

class VolunteerSpotlightRepository implements IVolunteerSpotlightRepository {
  private mapToEntity(data: PrismaVolunteerSpotlight): VolunteerSpotlight {
    return new VolunteerSpotlight({
      ...data,
      city: data.city as JordanianCity
    });
  }

  async findById(id: string): Promise<VolunteerSpotlight | null> {
    const data = await prisma.volunteerSpotlight.findUnique({ where: { id } });
    return data ? this.mapToEntity(data) : null;
  }

  async findAll(): Promise<VolunteerSpotlight[]> {
    const rows = await prisma.volunteerSpotlight.findMany({
      orderBy: { name: "asc" }
    });
    return rows.map((row) => this.mapToEntity(row));
  }

  async create(volunteerSpotlight: VolunteerSpotlight): Promise<VolunteerSpotlight> {
    const props = volunteerSpotlight.toObject();
    const created = await prisma.volunteerSpotlight.create({
      data: {
        id: props.id,
        imageUrl: props.imageUrl,
        name: props.name,
        description: props.description,
        spotlightDate: props.spotlightDate,
        city: props.city as JordanianCity,
        createdAt: props.createdAt,
        updatedAt: props.updatedAt,
        isActive: props.isActive
      }
    });
    return this.mapToEntity(created);
  }

  async update(volunteerSpotlight: VolunteerSpotlight): Promise<VolunteerSpotlight> {
    const props = volunteerSpotlight.toObject();

    const updated = await prisma.volunteerSpotlight.update({
      where: { id: props.id },
      data: {
        imageUrl: props.imageUrl,
        name: props.name,
        description: props.description,
        spotlightDate: props.spotlightDate,
        city: props.city as JordanianCity,
        updatedAt: new Date(),
        isActive: props.isActive
      }
    });

    return this.mapToEntity(updated);
  }

  async delete(id: string): Promise<boolean> {
    try {
      await prisma.volunteerSpotlight.delete({ where: { id } });
      return true;
    } catch {
      return false;
    }
  }
}

export default VolunteerSpotlightRepository;
