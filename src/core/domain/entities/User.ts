import { BaseEntity } from "@/core/domain/entities";
import { UserRole } from "@/core/domain/enums";
import { UserProps } from "@/core/domain/interfaces";

class User extends BaseEntity {
  public firstName: string;
  public lastName: string;
  public email: string;
  public phone?: string;
  public password: string;
  public role: UserRole;

  private constructor(props: UserProps) {
    super(props.id, props.createdAt, props.isActive ?? true);
    this.firstName = props.firstName;
    this.lastName = props.lastName;
    this.email = props.email;
    this.phone = props.phone;
    this.password = props.password;
    this.role = props.role;
  }

  static create(input: Omit<UserProps, "id" | "createdAt" | "isActive">): User {
    return new User({
      ...input,
      role: input.role ?? UserRole.VOLUNTEER,
    });
  }
}

export default User