import { BaseEntity } from "@/core/domain/entities";
import { VolunteerProfileProps } from "@/core/domain/interfaces";
import { Gender, JordanianCity } from "@/core/domain/enums";

class VolunteerProfile extends BaseEntity {
  private props: VolunteerProfileProps;

  constructor(props: VolunteerProfileProps) {
    super(props.id, props.createdAt, props.updatedAt, props.isActive ?? true);

    if (!props.userId?.trim()) throw new Error("User ID is required");
    if (!props.city) throw new Error("City is required");
    if (!props.dateOfBirth) throw new Error("Date of birth is required");

    this.props = { ...props };
  }

  static create(input: Omit<VolunteerProfileProps, "id" | "createdAt" | "updatedAt">): VolunteerProfile {
    return new VolunteerProfile({
      ...input,
      id: crypto.randomUUID(),
      createdAt: new Date(),
      updatedAt: new Date(),
      isActive: input.isActive ?? true
    });
  }

  update(
    input: Partial<
      Pick<
        VolunteerProfileProps,
        | "city"
        | "dateOfBirth"
        | "profilePictureUrl"
        | "gender"
        | "bio"
        | "skills"
        | "interests"
        | "hasVolunteerExperience"
        | "isActive"
      >
    >
  ): void {
    let changed = false;

    if (input.city !== undefined) {
      this.props.city = input.city;
      changed = true;
    }

    if (input.dateOfBirth !== undefined) {
      this.props.dateOfBirth = input.dateOfBirth;
      changed = true;
    }

    if (input.profilePictureUrl !== undefined) {
      this.props.profilePictureUrl = input.profilePictureUrl;
      changed = true;
    }

    if (input.gender !== undefined) {
      this.props.gender = input.gender;
      changed = true;
    }

    if (input.bio !== undefined) {
      this.props.bio = input.bio?.trim() || null;
      changed = true;
    }

    if (input.skills !== undefined) {
      this.props.skills = input.skills;
      changed = true;
    }

    if (input.interests !== undefined) {
      this.props.interests = input.interests;
      changed = true;
    }

    if (input.hasVolunteerExperience !== undefined) {
      this.props.hasVolunteerExperience = input.hasVolunteerExperience;
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

  get userId(): string {
    return this.props.userId;
  }

  get city(): JordanianCity {
    return this.props.city;
  }

  get dateOfBirth(): Date {
    return this.props.dateOfBirth;
  }

  get profilePictureUrl(): string | null {
    return this.props.profilePictureUrl ?? null;
  }

  get gender(): Gender | null {
    return this.props.gender ?? null;
  }

  get bio(): string | null {
    return this.props.bio ?? null;
  }

  get skills(): string[] {
    return this.props.skills ?? [];
  }

  get interests(): string[] {
    return this.props.interests ?? [];
  }

  get hasVolunteerExperience(): boolean {
    return this.props.hasVolunteerExperience ?? false;
  }

  toObject(): VolunteerProfileProps {
    return {
      ...this.props,
      id: this.id,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
      isActive: this.isActive
    };
  }
}

export default VolunteerProfile;
