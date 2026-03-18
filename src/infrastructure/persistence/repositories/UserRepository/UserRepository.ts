import IUserRepository from "./IUserRespository";
import type { Prisma, User as PrismaUser } from "@prisma/client";
import { prisma } from "@/infrastructure/persistence/prisma";
import { User } from "@/core/domain/entities";
import { UserRole } from "@/core/domain/enums";
import { JordanianCity, Gender } from "@prisma/client";
import type { EmailRecipientDto, EmailRecipientFilters } from "@/core/application/dtos";

class UserRepository implements IUserRepository {
  private mapToEntity(data: PrismaUser): User {
    return new User({
      ...data,
      role: data.role as UserRole,
      emailVerified: data.emailVerified ?? false,
      tokenVersion: data.tokenVersion ?? 0,
      isSuperAdmin: data.isSuperAdmin ?? false,
      permissions: data.permissions ?? [],
    });
  }

  async findByEmail(email: string): Promise<User | null> {
    const data = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
    return data ? this.mapToEntity(data) : null;
  }

  async findById(id: string): Promise<User | null> {
    const data = await prisma.user.findUnique({ where: { id } });
    return data ? this.mapToEntity(data) : null;
  }

  async findAllAdmins(): Promise<User[]> {
    const rows = await prisma.user.findMany({ where: { role: UserRole.ADMIN } });
    return rows.map((r) => this.mapToEntity(r));
  }

  async create(user: User): Promise<User> {
    const props = user.toObject();
    const created = await prisma.user.create({ data: props });
    return this.mapToEntity(created);
  }

  async update(user: User): Promise<User> {
    const props = user.toObject();
    const updated = await prisma.user.update({
      where: { id: props.id },
      data: {
        email: props.email,
        fullName: props.fullName,
        phone: props.phone,
        password: props.password,
        isActive: props.isActive,
        emailVerified: props.emailVerified,
        tokenVersion: props.tokenVersion,
        isSuperAdmin: props.isSuperAdmin,
        permissions: props.permissions,
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
    const now = new Date();
    const profileWhere: Prisma.VolunteerProfileWhereInput = { isActive: true };

    if (filters.target === "CITY" && filters.targetValue)
      profileWhere.city = filters.targetValue as JordanianCity;
    if (filters.target === "GENDER" && filters.targetValue)
      profileWhere.gender = filters.targetValue as Gender;
    if (filters.genderFilter) profileWhere.gender = filters.genderFilter as Gender;
    if (filters.cityFilter) profileWhere.city = filters.cityFilter as JordanianCity;
    if (filters.minHours) profileWhere.totalVolunteerHours = { gte: filters.minHours };
    if (filters.hasExperience !== undefined)
      profileWhere.hasVolunteerExperience = filters.hasExperience;

    const dobFilter: Prisma.DateTimeFilter = {};
    if (filters.minAge)
      dobFilter.lte = new Date(now.getFullYear() - filters.minAge, now.getMonth(), now.getDate());
    if (filters.maxAge)
      dobFilter.gte = new Date(now.getFullYear() - filters.maxAge, now.getMonth(), now.getDate());
    if (Object.keys(dobFilter).length) profileWhere.dateOfBirth = dobFilter;

    if (filters.interests?.length) {
      profileWhere.OR = [
        { interests: { hasSome: filters.interests } },
        { skills: { hasSome: filters.interests } },
      ];
    }

    const rows = await prisma.user.findMany({
      where: { role: UserRole.VOLUNTEER, isActive: true, volunteerProfile: profileWhere },
      select: {
        id: true,
        fullName: true,
        email: true,
        volunteerProfile: {
          select: { city: true, gender: true, totalVolunteerHours: true },
        },
      },
    });

    return rows.map((r) => ({
      id: r.id,
      name: r.fullName,
      email: r.email,
      city: r.volunteerProfile?.city ?? null,
      gender: r.volunteerProfile?.gender ?? null,
      hours: r.volunteerProfile?.totalVolunteerHours ?? 0,
    }));
  }
}

export default UserRepository;