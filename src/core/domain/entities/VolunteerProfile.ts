import { BaseEntity } from "@/core/domain/entities";
import { VolunteerProfileProps } from "@/core/domain/interfaces";
import { Gender, JordanianCity } from "@/core/domain/enums";

class VolunteerProfile extends BaseEntity {
  private props: VolunteerProfileProps;

  constructor(props: VolunteerProfileProps) {
    super(props.id, props.createdAt, props.updatedAt, props.isActive ?? true);
    this.props = { ...props };
  }

  static create(
    input: Omit<VolunteerProfileProps, "id" | "createdAt" | "updatedAt">
  ): VolunteerProfile {
    return new VolunteerProfile({
      ...input,
      id: crypto.randomUUID(),
      createdAt: new Date(),
      updatedAt: new Date(),
      isActive: input.isActive ?? true,
    });
  }

 get userId(): string {
    return this.props.userId;
  }

  get city(): string {
    return this.props.city;
  }

  get dateOfBirth(): Date {
    return this.props.dateOfBirth;
  }

  get profilePictureUrl(): string | null {
    return this.props.profilePictureUrl ?? null;
  }

  get gender(): string | null {
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

  updateCity(city: JordanianCity): void {
    this.props.city = city;
    this.props.updatedAt = new Date();
  }

  updateDateOfBirth(dateOfBirth: Date): void {
    this.props.dateOfBirth = dateOfBirth;
    this.props.updatedAt = new Date();
  }

  updateProfilePicture(url: string): void {
    this.props.profilePictureUrl = url;
    this.props.updatedAt = new Date();
  }

  updateGender(gender: Gender): void {
    this.props.gender = gender;
    this.props.updatedAt = new Date();
  }

  updateBio(bio: string): void {
    this.props.bio = bio;
    this.props.updatedAt = new Date();
  }

  updateSkills(skills: string[]): void {
    this.props.skills = skills;
    this.props.updatedAt = new Date();
  }

  updateInterests(interests: string[]): void {
    this.props.interests = interests;
    this.props.updatedAt = new Date();
  }

  updateVolunteerExperience(hasExperience: boolean): void {
    this.props.hasVolunteerExperience = hasExperience;
    this.props.updatedAt = new Date();
  }

  toObject(): VolunteerProfileProps {
    return {
      ...this.props,
      id: this.id,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
      isActive: this.isActive,
    };
  }
}

export default VolunteerProfile;