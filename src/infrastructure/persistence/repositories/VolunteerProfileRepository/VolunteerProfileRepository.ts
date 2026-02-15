import { VolunteerProfile } from "@/core/domain/entities";
import { VolunteerProfileProps } from "@/core/domain/interfaces";
import { prisma } from "@/infrastructure/persistence/prisma";
import IVolunteerProfileRepository from "./IVolunteerProfileRepository";

class VolunteerProfileRepository implements IVolunteerProfileRepository {
  
  private mapToEntity(data: VolunteerProfileProps): VolunteerProfile {
    return new VolunteerProfile({
      ...data,
      skills: data.skills || [],
      interests: data.interests || [],
    });
  }

  async findByUserId(userId: string): Promise<VolunteerProfile | null> {
    const profileData = await prisma.volunteerProfile.findUnique({
      where: { userId },
    });

    if (!profileData) return null;

    return this.mapToEntity(profileData as VolunteerProfileProps);
  }

  async create(profile: VolunteerProfile): Promise<VolunteerProfile> {
    const props = profile.toObject();

    const createdProfile = await prisma.volunteerProfile.create({
      data: {
        id: props.id,
        userId: props.userId,
        city: props.city,
        dateOfBirth: props.dateOfBirth,
        profilePictureUrl: props.profilePictureUrl,
        gender: props.gender,
        bio: props.bio,
        skills: props.skills || [],
        interests: props.interests || [],
        hasVolunteerExperience: props.hasVolunteerExperience || false,
        isActive: props.isActive,
        createdAt: props.createdAt,
        updatedAt: props.updatedAt,
      },
    });

    return this.mapToEntity(createdProfile as VolunteerProfileProps);
  }

  async update(profile: VolunteerProfile): Promise<VolunteerProfile> {
    const props = profile.toObject();

    const updatedProfile = await prisma.volunteerProfile.update({
      where: { id: props.id },
      data: {
        city: props.city,
        dateOfBirth: props.dateOfBirth,
        profilePictureUrl: props.profilePictureUrl,
        gender: props.gender,
        bio: props.bio,
        skills: props.skills || [],
        interests: props.interests || [],
        hasVolunteerExperience: props.hasVolunteerExperience,
        isActive: props.isActive,
        updatedAt: new Date(),
      },
    });

    return this.mapToEntity(updatedProfile as VolunteerProfileProps);
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
