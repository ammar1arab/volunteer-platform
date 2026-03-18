import { EmailRecipientDto, EmailRecipientFilters } from "@/core/application/dtos";
import { User } from "@/core/domain/entities";

interface IUserRepository {
  findByEmail(email: string): Promise<User | null>;
  findById(id: string): Promise<User | null>;
  findAllAdmins(): Promise<User[]>;
  create(user: User): Promise<User>;
  update(user: User): Promise<User>;
  delete(id: string): Promise<boolean>;
  findEmailRecipients(filters: EmailRecipientFilters): Promise<EmailRecipientDto[]>;
}

export default IUserRepository;