import { FeaturedPost } from "@/core/domain/entities";
import { FeaturedPostProps } from "@/core/domain/interfaces";
import { prisma } from "@/infrastructure/persistence/prisma";
import IFeaturedPostRepository from "./IFeaturedPostRepository";

class FeaturedPostRepository implements IFeaturedPostRepository {
  async findById(id: string): Promise<FeaturedPost | null> {
    const data = await prisma.featuredPost.findUnique({
      where: { id },
    });

    if (!data) return null;
    return new FeaturedPost(data as FeaturedPostProps);
  }

  async findAll(): Promise<FeaturedPost[]> {
    const rows = await prisma.featuredPost.findMany({
      orderBy: { title: "asc" },
    });

    return rows.map((x) => new FeaturedPost(x as FeaturedPostProps));
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
      },
    });

    return new FeaturedPost(created as FeaturedPostProps);
  }

  async update(featuredPost: FeaturedPost): Promise<FeaturedPost> {
    const props = featuredPost.toObject();

    const updated = await prisma.featuredPost.update({
      where: { id: featuredPost.id },
      data: {
        imageUrl: props.imageUrl,
        title: props.title,
        description: props.description,
        isActive: props.isActive,
      },
    });

    return new FeaturedPost(updated as FeaturedPostProps);
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
