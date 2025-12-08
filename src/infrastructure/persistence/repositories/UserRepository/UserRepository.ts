import { User } from "@/core/domain/entities";
import { UserProps } from "@/core/domain/interfaces";
import { prisma } from "@/infrastructure/persistence/prisma";

import IUserRepository from "./IUserRespository";

class UserRepository implements IUserRepository {
  // Find User By Their Email
  async findByEmail(email: string): Promise<User | null> {
    const userData = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (!userData) return null;

    return new User(userData as UserProps);
  }
  // Find User By Their Id
  async findById(id: string): Promise<User | null> {
    const userData = await prisma.user.findUnique({
      where: { id },
    });

    if (!userData) return null;

    return new User(userData as UserProps);
  }
  // Create A New User
  async create(user: User): Promise<User> {
    const userProps = user.toObject();

    const createdUser = await prisma.user.create({
      data: {
        id: userProps.id,
        email: user.email,
        password: userProps.password,
        fullName: userProps.fullName,
        phone: userProps.phone,
        role: userProps.role,
      },
    });

    return new User(createdUser as UserProps);
  }

  // Update An Existing User
  async update(user: User): Promise<User> {
    const userProps = user.toObject();

    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: {
        email: userProps.email,
        phone: userProps.phone,
        fullName: userProps.fullName,
      },
    });

    return new User(updatedUser as UserProps);
  }
}

export default UserRepository;
