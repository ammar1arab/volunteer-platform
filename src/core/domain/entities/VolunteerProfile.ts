import { BaseEntity } from "@/core/domain/entities";
import { VolunteerProfileProps } from "@/core/domain/interfaces";
import { Gender, JordanianCity, EducationLevel } from "@/core/domain/enums";

class VolunteerProfile extends BaseEntity {
  private props: VolunteerProfileProps;

  constructor(props: VolunteerProfileProps) {
    super(props.id, props.createdAt, props.updatedAt, props.isActive ?? true);

    if (!props.userId?.trim()) throw new Error("User ID is required");
    if (!props.city) throw new Error("City is required");
    if (!props.dateOfBirth) throw new Error("Date of birth is required");

    this.props = {
      ...props,
    };
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
        | "membershipNumber"
        | "gender"
        | "bio"
        | "skills"
        | "interests"
        | "educationLevel"
        | "occupation"
        | "languages"
        | "preferredVolunteerTypes"
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
    if (input.membershipNumber !== undefined) {
      this.props.membershipNumber = input.membershipNumber?.trim() || null;
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
    if (input.educationLevel !== undefined) {
      this.props.educationLevel = input.educationLevel;
      changed = true;
    }
    if (input.occupation !== undefined) {
      this.props.occupation = input.occupation?.trim() || null;
      changed = true;
    }
    if (input.languages !== undefined) {
      this.props.languages = input.languages;
      changed = true;
    }
    if (input.preferredVolunteerTypes !== undefined) {
      this.props.preferredVolunteerTypes = input.preferredVolunteerTypes;
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

    if (changed) this.touch();
  }

  addVolunteerHours(hours: number): void {
    if (hours <= 0) throw new Error("Hours must be positive");
    this.props.totalVolunteerHours = Math.round((this.props.totalVolunteerHours + hours) * 100) / 100;
    this.touch();
  }

  subtractVolunteerHours(hours: number): void {
    if (hours <= 0) throw new Error("Hours must be positive");
    this.props.totalVolunteerHours = Math.max(0, Math.round((this.props.totalVolunteerHours - hours) * 100) / 100);
    this.touch();
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
  get membershipNumber(): string | null {
    return this.props.membershipNumber ?? null;
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
  get educationLevel(): EducationLevel | null {
    return this.props.educationLevel ?? null;
  }
  get occupation(): string | null {
    return this.props.occupation ?? null;
  }
  get languages(): string[] {
    return this.props.languages ?? [];
  }
  get preferredVolunteerTypes(): string[] {
    return this.props.preferredVolunteerTypes ?? [];
  }
  get hasVolunteerExperience(): boolean {
    return this.props.hasVolunteerExperience ?? false;
  }
  get totalVolunteerHours(): number {
    return this.props.totalVolunteerHours;
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
