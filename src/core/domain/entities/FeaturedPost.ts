import { BaseEntity } from "@/core/domain/entities";
import { FeaturedPostProps } from "@/core/domain/interfaces";

class FeaturedPost extends BaseEntity {
  private props: FeaturedPostProps;

  constructor(props: FeaturedPostProps) {
    super(props.id, props.createdAt, props.updatedAt, props.isActive ?? true);

    if (!props.imageUrl?.trim()) throw new Error("imageUrl is required");
    if (!props.title?.trim()) throw new Error("title is required");
    if (!props.description?.trim()) throw new Error("description is required");
    if (!props.categories || props.categories.length === 0) throw new Error("Add at least one category");

    this.props = {
      ...props,
      categories: [...(props.categories ?? [])],
      imageUrl: props.imageUrl.trim(),
      title: props.title.trim(),
      description: props.description.trim(),
      views: props.views ?? 0,
    };
  }

  static create(input: Omit<FeaturedPostProps, "id" | "createdAt" | "updatedAt">): FeaturedPost {
    return new FeaturedPost({
      ...input,
      id: crypto.randomUUID(),
      createdAt: new Date(),
      publishedAt: input.publishedAt ?? new Date(),
      updatedAt: new Date(),
      isActive: input.isActive ?? true,
      views: 0,
    });
  }

  update(
    input: Partial<
      Pick<FeaturedPostProps, "imageUrl" | "title" | "description" | "isActive" | "categories" | "publishedAt">
    >
  ): void {
    let changed = false;

    if (input.title !== undefined) {
      if (!input.title.trim()) throw new Error("title is required");
      this.props.title = input.title.trim();
      changed = true;
    }

    if (input.imageUrl !== undefined) {
      if (!input.imageUrl.trim()) throw new Error("imageUrl is required");
      this.props.imageUrl = input.imageUrl.trim();
      changed = true;
    }

    if (input.description !== undefined) {
      if (!input.description.trim()) throw new Error("description is required");
      this.props.description = input.description.trim();
      changed = true;
    }

    if (input.categories !== undefined) {
      if (!input.categories || input.categories.length === 0) {
        throw new Error("Add at least one category");
      }
      this.props.categories = [...input.categories];
      changed = true;
    }

    if (input.isActive !== undefined) {
      this.setActive(input.isActive);
      this.props.isActive = this.isActive;
      changed = true;
    }

    if (input.publishedAt !== undefined) {
      this.props.publishedAt = input.publishedAt;
      changed = true;
    }

    if (changed) {
      this.touch();
    }
  }

  get imageUrl(): string {
    return this.props.imageUrl;
  }

  get title(): string {
    return this.props.title;
  }

  get description(): string {
    return this.props.description;
  }

  get categories(): string[] {
    return this.props.categories;
  }

  get publishedAt(): Date {
    return this.props.publishedAt;
  }

  get views(): number {
    return this.props.views ?? 0;
  }

  incrementViews(): void {
    this.props.views = this.views + 1;
    this.touch();
  }

  toObject(): FeaturedPostProps {
    return {
      ...this.props,
      id: this.id,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
      publishedAt: this.props.publishedAt,
      isActive: this.isActive
    };
  }
}

export default FeaturedPost;
