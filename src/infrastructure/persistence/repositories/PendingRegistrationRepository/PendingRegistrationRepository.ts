import IPendingRegistrationRepository, { PendingRegistrationData } from "./IPendingRegistrationRepository";
import { JordanianCity, Gender } from "@prisma/client";
import { prisma } from "@/infrastructure/persistence/prisma";

class PendingRegistrationRepository implements IPendingRegistrationRepository {
  async upsert(data: PendingRegistrationData, expiresAt: Date): Promise<void> {
    const shared = {
      password: data.password,
      fullName: data.fullName,
      phone: data.phone,
      city: data.city as JordanianCity,
      dateOfBirth: data.dateOfBirth,
      gender: data.gender ?? null,
      membershipNumber: data.membershipNumber ?? null,
      educationLevel: data.educationLevel ?? null,
      occupation: data.occupation ?? null,
      languages: data.languages ?? [],
      preferredVolunteerTypes: data.preferredVolunteerTypes ?? [],
      skills: data.skills ?? [],
      interests: data.interests ?? [],
      hasVolunteerExperience: data.hasVolunteerExperience ?? false,
      expiresAt,
    };

    await prisma.pendingRegistration.upsert({
      where: { email: data.email.toLowerCase() },
      create: {
        id: crypto.randomUUID(),
        email: data.email.toLowerCase(),
        ...shared,
      },
      update: shared,
    });
  }

  async findByEmail(email: string): Promise<PendingRegistrationData | null> {
    const row = await prisma.pendingRegistration.findUnique({
      where: { email: email.toLowerCase() },
    });
    if (!row || row.expiresAt < new Date()) return null;
    return {
      email: row.email,
      password: row.password,
      fullName: row.fullName,
      phone: row.phone,
      city: row.city as JordanianCity,
      dateOfBirth: row.dateOfBirth,
      gender: row.gender as Gender | null,
      membershipNumber: row.membershipNumber ?? null,
      educationLevel: row.educationLevel ?? null,
      occupation: row.occupation ?? null,
      languages: row.languages ?? [],
      preferredVolunteerTypes: row.preferredVolunteerTypes ?? [],
      skills: row.skills ?? [],
      interests: row.interests ?? [],
      hasVolunteerExperience: row.hasVolunteerExperience ?? false,
    };
  }

  async deleteByEmail(email: string): Promise<void> {
    await prisma.pendingRegistration.deleteMany({ where: { email: email.toLowerCase() } });
  }

  async deleteExpired(): Promise<void> {
    await prisma.pendingRegistration.deleteMany({ where: { expiresAt: { lt: new Date() } } });
  }
}

export default PendingRegistrationRepository;
