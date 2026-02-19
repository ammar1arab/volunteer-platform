import { BaseEntity } from "@/core/domain/entities";
import { VolunteerSpotlightProps } from "@/core/domain/interfaces";
import { JordanianCity } from "@/core/domain/enums";

class VolunteerSpotlight extends BaseEntity {
  private props: VolunteerSpotlightProps;

  constructor(props: VolunteerSpotlightProps) {
    super(props.id, props.createdAt, props.updatedAt, props.isActive ?? true);

    if (!props.imageUrl?.trim()) throw new Error("Image URL is required");
    if (!props.name?.trim()) throw new Error("Name is required");
    if (!props.description?.trim()) throw new Error("Description is required");
    if (!props.spotlightDate) throw new Error("Spotlight date is required");
    if (!props.city) throw new Error("City is required");

    this.props = {
      ...props,
      imageUrl: props.imageUrl.trim(),
      name: props.name.trim(),
      description: props.description.trim()
    };
  }

  static create(input: Omit<VolunteerSpotlightProps, "id" | "createdAt" | "updatedAt">): VolunteerSpotlight {
    return new VolunteerSpotlight({
      ...input,
      id: crypto.randomUUID(),
      createdAt: new Date(),
      updatedAt: new Date(),
      isActive: input.isActive ?? true
    });
  }

  update(
    input: Partial<
      Pick<VolunteerSpotlightProps, "imageUrl" | "name" | "description" | "spotlightDate" | "city" | "isActive">
    >
  ): void {
    let changed = false;

    if (input.imageUrl !== undefined) {
      if (!input.imageUrl.trim()) throw new Error("Image URL is required");
      this.props.imageUrl = input.imageUrl.trim();
      changed = true;
    }

    if (input.name !== undefined) {
      if (!input.name.trim()) throw new Error("Name is required");
      this.props.name = input.name.trim();
      changed = true;
    }

    if (input.description !== undefined) {
      if (!input.description.trim()) throw new Error("Description is required");
      this.props.description = input.description.trim();
      changed = true;
    }

    if (input.spotlightDate !== undefined) {
      this.props.spotlightDate = input.spotlightDate;
      changed = true;
    }

    if (input.city !== undefined) {
      this.props.city = input.city;
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

  get name(): string {
    return this.props.name;
  }

  get description(): string {
    return this.props.description;
  }

  get spotlightDate(): Date {
    return this.props.spotlightDate;
  }

  get city(): JordanianCity {
    return this.props.city;
  }

  toObject(): VolunteerSpotlightProps {
    return {
      ...this.props,
      id: this.id,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
      isActive: this.isActive
    };
  }
}

export default VolunteerSpotlight;