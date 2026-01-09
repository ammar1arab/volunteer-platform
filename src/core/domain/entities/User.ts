import { BaseEntity } from "@/core/domain/entities";
import { UserRole } from "@/core/domain/enums";
import { UserProps } from "@/core/domain/interfaces";

class User extends BaseEntity {
  private props: UserProps;

  constructor(props: UserProps) {
    super(props.id, props.createdAt, props.updatedAt, props.isActive ?? true);
    this.props = { ...props };
  }

  static create(
    input: Omit<UserProps, "id" | "createdAt" | "updatedAt">
  ): User {
    return new User({
      ...input,
      id: crypto.randomUUID(),
      createdAt: new Date(),
      updatedAt: new Date(),
      role: input.role ?? UserRole.VOLUNTEER,
      isActive: input.isActive ?? true,
    });
  }

  get email(): string {
    return this.props.email;
  }

  get password(): string {
    return this.props.password;
  }

  get fullName(): string {
    return this.props.fullName;
  }

  get phone(): string {
    return this.props.phone;
  }

  get role(): UserRole {
    return this.props.role;
  }

  set email(value: string) {
    if (!value?.trim()) {
      throw new Error("Email is required");
    }
    this.props.email = value.trim();
    this.touch();
  }

  set fullName(value: string) {
    if (!value?.trim()) {
      throw new Error("Full name is required");
    }
    if (value.length < 2 || value.length > 100) {
      throw new Error("Full name must be 2-100 characters");
    }
    this.props.fullName = value.trim();
    this.touch();
  }

  set phone(value: string) {
    if (!value?.trim()) {
      throw new Error("Phone is required");
    }
    this.props.phone = value.trim();
    this.touch();
  }
  isAdmin(): boolean {
    return this.props.role === UserRole.ADMIN;
  }

  isActiveAccount(): boolean {
    return this.isActive === true;
  }

  toObject(): UserProps {
    return {
      ...this.props,
      id: this.id,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
      isActive: this.isActive,
    };
  }
}

export default User;
