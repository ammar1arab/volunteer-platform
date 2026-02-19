import IFeaturedPostRepository from "./IFeaturedPostRepository";

import type { FeaturedPost as PrismaFeaturedPost } from "@prisma/client";
import { FeaturedPostCategory } from "@prisma/client";
import { prisma } from "@/infrastructure/persistence/prisma";
import { FeaturedPost } from "@/core/domain/entities";
import { DomainFeaturedPostCategory } from "@/core/domain/enums";

class FeaturedPostRepository implements IFeaturedPostRepository {
  private mapToEntity(data: PrismaFeaturedPost): FeaturedPost {
    return new FeaturedPost({
      ...data,
      categories: data.categories as DomainFeaturedPostCategory[]
    });
  }

  async findById(id: string): Promise<FeaturedPost | null> {
    const data = await prisma.featuredPost.findUnique({ where: { id } });
    return data ? this.mapToEntity(data) : null;
  }

  async findAll(): Promise<FeaturedPost[]> {
    const rows = await prisma.featuredPost.findMany({
      orderBy: { title: "asc" }
    });
    return rows.map((row) => this.mapToEntity(row));
  }

  async create(featuredPost: FeaturedPost): Promise<FeaturedPost> {
    const props = featuredPost.toObject();
    const created = await prisma.featuredPost.create({
      data: {
        id: props.id,
        imageUrl: props.imageUrl,
        title: props.title,
        description: props.description,
        isActive: props.isActive,
        categories: props.categories as FeaturedPostCategory[],
        createdAt: props.createdAt,
        updatedAt: props.updatedAt
      }
    });

    return this.mapToEntity(created);
  }

  async update(featuredPost: FeaturedPost): Promise<FeaturedPost> {
    const props = featuredPost.toObject();
    const updated = await prisma.featuredPost.update({
      where: { id: props.id },
      data: {
        imageUrl: props.imageUrl,
        title: props.title,
        description: props.description,
        isActive: props.isActive,
        categories: props.categories as FeaturedPostCategory[],
        updatedAt: new Date()
      }
    });

    return this.mapToEntity(updated);
  }

  async delete(id: string): Promise<boolean> {
    try {
      await prisma.featuredPost.delete({ where: { id } });
      return true;
    } catch {
      return false;
    }
  }
}

export default FeaturedPostRepository;
