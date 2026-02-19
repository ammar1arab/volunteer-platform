import { BaseEntity } from "@/core/domain/entities";
import { UserRole } from "@/core/domain/enums";
import { UserProps } from "@/core/domain/interfaces";

class User extends BaseEntity {
  private props: UserProps;

  constructor(props: UserProps) {
    super(props.id, props.createdAt, props.updatedAt, props.isActive ?? true);

    if (!props.email?.trim()) throw new Error("Email is required");
    if (!props.password?.trim()) throw new Error("Password is required");
    if (!props.fullName?.trim()) throw new Error("Full name is required");
    if (props.fullName.length < 2 || props.fullName.length > 100) {
      throw new Error("Full name must be 2-100 characters");
    }
    if (!props.phone?.trim()) throw new Error("Phone is required");

    this.props = {
      ...props,
      email: props.email.trim(),
      fullName: props.fullName.trim(),
      phone: props.phone.trim()
    };
  }

  static create(input: Omit<UserProps, "id" | "createdAt" | "updatedAt">): User {
    return new User({
      ...input,
      id: crypto.randomUUID(),
      createdAt: new Date(),
      updatedAt: new Date(),
      role: input.role ?? UserRole.VOLUNTEER,
      isActive: input.isActive ?? true
    });
  }

  update(input: Partial<Pick<UserProps, "email" | "fullName" | "phone" | "isActive">>): void {
    let changed = false;

    if (input.email !== undefined) {
      if (!input.email.trim()) throw new Error("Email is required");
      this.props.email = input.email.trim();
      changed = true;
    }

    if (input.fullName !== undefined) {
      if (!input.fullName.trim()) throw new Error("Full name is required");
      if (input.fullName.length < 2 || input.fullName.length > 100) {
        throw new Error("Full name must be 2-100 characters");
      }
      this.props.fullName = input.fullName.trim();
      changed = true;
    }

    if (input.phone !== undefined) {
      if (!input.phone.trim()) throw new Error("Phone is required");
      this.props.phone = input.phone.trim();
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
      isActive: this.isActive
    };
  }
}

export default User;
