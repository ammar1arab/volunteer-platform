import { User } from "@/core/domain/entities";
import { UserProps } from "@/core/domain/interfaces";
import { prisma } from "@/infrastructure/persistence/prisma";
import IUserRepository from "./IUserRespository";

class UserRepository implements IUserRepository {
  async findByEmail(email: string): Promise<User | null> {
    const userData = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (!userData) return null;

    return new User(userData as UserProps);
  }

  async findById(id: string): Promise<User | null> {
    const userData = await prisma.user.findUnique({
      where: { id },
    });

    if (!userData) return null;

    return new User(userData as UserProps);
  }

  async create(user: User): Promise<User> {
    const userProps = user.toObject();

    const createdUser = await prisma.user.create({
      data: {
        id: userProps.id,
        email: userProps.email,
        password: userProps.password,
        fullName: userProps.fullName,
        phone: userProps.phone,
        role: userProps.role,
        isActive: userProps.isActive,
      },
    });

    return new User(createdUser as UserProps);
  }

  async update(user: User): Promise<User> {
    const userProps = user.toObject();

    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: {
        email: userProps.email,
        fullName: userProps.fullName,
        phone: userProps.phone,
        isActive: userProps.isActive,
      },
    });

    return new User(updatedUser as UserProps);
  }
}

export default UserRepository;