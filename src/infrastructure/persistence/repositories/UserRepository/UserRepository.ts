import IUserRepository from "./IUserRespository";
import type { User as PrismaUser } from "@prisma/client";
import { prisma } from "@/infrastructure/persistence/prisma";
import { User } from "@/core/domain/entities";
import { UserRole } from "@/core/domain/enums";
import type { EmailRecipientDto, EmailRecipientFilters } from "@/core/application/dtos";
import { findAudienceUsers } from "@/infrastructure/persistence/audience/findAudienceUsers";

class UserRepository implements IUserRepository {
  private mapToEntity(data: PrismaUser): User {
    return new User({
      ...data,
      role: data.role as UserRole,
      emailVerified: data.emailVerified ?? false,
      tokenVersion: data.tokenVersion ?? 0,
      isSuperAdmin: data.isSuperAdmin ?? false,
      permissions: data.permissions ?? []
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
        updatedAt: new Date()
      }
    });
    return this.mapToEntity(updated);
  }

  async delete(id: string): Promise<boolean> {
    try {
      await prisma.$transaction([
        prisma.activityParticipation.deleteMany({ where: { volunteerId: id } }),
        prisma.activity.updateMany({
          where: { createdBy: id },
          data: { deletedAt: new Date(), isActive: false }
        }),
        prisma.certificate.deleteMany({ where: { userId: id } }),
        prisma.notification.deleteMany({ where: { userId: id } }),
        prisma.pushSubscription.deleteMany({ where: { userId: id } }),
        prisma.volunteerProfile.deleteMany({ where: { userId: id } }),
        prisma.user.delete({ where: { id } })
      ]);
      return true;
    } catch (error) {
      throw error;
    }
  }

  async findEmailRecipients(filters: EmailRecipientFilters): Promise<EmailRecipientDto[]> {
    return findAudienceUsers({ ...filters, requireVerifiedEmail: true });
  }
}

export default UserRepository;
