import { VolunteerProfile } from "@/core/domain/entities";
import { VolunteerProfileProps } from "@/core/domain/interfaces";
import { prisma } from "@/infrastructure/persistence/prisma";
import IVolunteerProfileRepository from "./IVolunteerProfileRepository";

class VolunteerProfileRepository implements IVolunteerProfileRepository {
  async findByUserId(userId: string): Promise<VolunteerProfile | null> {
    const profileData = await prisma.volunteerProfile.findUnique({
      where: { userId },
    });

    if (!profileData) return null;

    return new VolunteerProfile({
      ...profileData,
      skills: profileData.skills || [],
      interests: profileData.interests || [],
    } as VolunteerProfileProps);
  }

  async create(profile: VolunteerProfile): Promise<VolunteerProfile> {
    const profileProps = profile.toObject();

    const createdProfile = await prisma.volunteerProfile.create({
      data: {
        id: profileProps.id,
        userId: profileProps.userId,
        city: profileProps.city,
        dateOfBirth: profileProps.dateOfBirth,
        profilePictureUrl: profileProps.profilePictureUrl,
        gender: profileProps.gender,
        bio: profileProps.bio,
        skills: profileProps.skills || [],
        interests: profileProps.interests || [],
        hasVolunteerExperience: profileProps.hasVolunteerExperience || false,
        isActive: profileProps.isActive,
      },
    });

    return new VolunteerProfile({
      ...createdProfile,
      skills: createdProfile.skills || [],
      interests: createdProfile.interests || [],
    } as VolunteerProfileProps);
  }

  async update(profile: VolunteerProfile): Promise<VolunteerProfile> {
    const profileProps = profile.toObject();

    const updatedProfile = await prisma.volunteerProfile.update({
      where: { id: profile.id },
      data: {
        city: profileProps.city,
        dateOfBirth: profileProps.dateOfBirth,
        profilePictureUrl: profileProps.profilePictureUrl,
        gender: profileProps.gender,
        bio: profileProps.bio,
        skills: profileProps.skills || [],
        interests: profileProps.interests || [],
        hasVolunteerExperience: profileProps.hasVolunteerExperience,
        isActive: profileProps.isActive,
        updatedAt: new Date(),
      },
    });

    return new VolunteerProfile({
      ...updatedProfile,
      skills: updatedProfile.skills || [],
      interests: updatedProfile.interests || [],
    } as VolunteerProfileProps);
  }

  async delete(id: string): Promise<void> {
    await prisma.volunteerProfile.delete({
      where: { id },
    });
  }
}

export default VolunteerProfileRepository;