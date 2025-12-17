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

  isAdmin(): boolean {
    return this.props.role === UserRole.ADMIN;
  }

  isActiveAccount(): boolean {
    return this.props.isActive === true;
  }

  toObject(): UserProps {
    return {
      ...this.props,
    };
  }
}

export default User;
