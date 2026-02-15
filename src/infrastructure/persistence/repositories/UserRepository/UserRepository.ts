import { User } from "@/core/domain/entities";
import { UserProps } from "@/core/domain/interfaces";
import { prisma } from "@/infrastructure/persistence/prisma";
import IUserRepository from "./IUserRespository";

class UserRepository implements IUserRepository {
  
  private mapToEntity(data: UserProps): User {
    return new User(data);
  }

  async findByEmail(email: string): Promise<User | null> {
    const userData = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (!userData) return null;

    return this.mapToEntity(userData as UserProps);
  }

  async findById(id: string): Promise<User | null> {
    const userData = await prisma.user.findUnique({
      where: { id },
    });

    if (!userData) return null;

    return this.mapToEntity(userData as UserProps);
  }

  async create(user: User): Promise<User> {
    const props = user.toObject();

    const created = await prisma.user.create({
      data: {
        id: props.id,
        email: props.email,
        password: props.password,
        fullName: props.fullName,
        phone: props.phone,
        role: props.role,
        isActive: props.isActive,
        createdAt: props.createdAt,
        updatedAt: props.updatedAt,
      },
    });

    return this.mapToEntity(created as UserProps);
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
        updatedAt: new Date(),
      },
    });

    return this.mapToEntity(updated as UserProps);
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
