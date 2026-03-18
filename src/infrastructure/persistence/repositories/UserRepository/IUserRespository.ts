import { EmailRecipientDto, EmailRecipientFilters } from "@/core/application/dtos";
import { User } from "@/core/domain/entities";

interface IUserRepository {
  findByEmail(email: string): Promise<User | null>;
  findById(id: string): Promise<User | null>;
  create(user: User): Promise<User>;
  update(user: User): Promise<User>;
  findEmailRecipients(filters: EmailRecipientFilters): Promise<EmailRecipientDto[]>;
}

export default IUserRepository;
