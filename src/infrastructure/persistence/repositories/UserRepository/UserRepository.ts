import IUserRepository from "./IUserRespository";

import type { User as PrismaUser } from "@prisma/client";
import { prisma } from "@/infrastructure/persistence/prisma";

import { User } from "@/core/domain/entities";
import { UserRole } from "@/core/domain/enums";

class UserRepository implements IUserRepository {
  private mapToEntity(data: PrismaUser): User {
    return new User({
      ...data,
      role: data.role as UserRole
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
        isActive: props.isActive,
        updatedAt: new Date()
      }
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
}

export default UserRepository;
