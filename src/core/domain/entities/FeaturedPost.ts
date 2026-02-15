import { BaseEntity } from "@/core/domain/entities";
import { FeaturedPostProps } from "@/core/domain/interfaces";

class FeaturedPost extends BaseEntity {
  private props: FeaturedPostProps;

  constructor(props: FeaturedPostProps) {
    super(props.id, props.createdAt, props.updatedAt, props.isActive ?? true);

    if (!props.imageUrl?.trim()) throw new Error("imageUrl is required");
    if (!props.title?.trim()) throw new Error("title is required");
    if (!props.description?.trim()) throw new Error("description is required");
    if (!props.categories || props.categories.length === 0)
      throw new Error("Add at least one category");

    this.props = {
      ...props,
      categories: [...(props.categories ?? [])],
      imageUrl: props.imageUrl?.trim() || "",
      title: props.title?.trim() || "",
      description: props.description?.trim() || "",
    };
  }

  static create(
    input: Omit<FeaturedPostProps, "id" | "createdAt" | "updatedAt">,
  ): FeaturedPost {
    return new FeaturedPost({
      ...input,
      id: crypto.randomUUID(),
      createdAt: new Date(),
      updatedAt: new Date(),
      isActive: input.isActive ?? true,
    });
  }

  update(
    input: Partial<
      Pick<
        FeaturedPostProps,
        "imageUrl" | "title" | "description" | "isActive" | "categories"
      >
    >,
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

  get categories() {
    return this.props.categories;
  }

  toObject(): FeaturedPostProps {
    return {
      ...this.props,
      id: this.id,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
      isActive: this.isActive,
    };
  }
}

export default FeaturedPost;
