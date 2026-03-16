import { Certificate } from "@/core/domain/entities";
import { CertificateStatus } from "@/core/domain/enums";

interface ICertificateRepository {
  createMany(data: { userId: string; activityId: string }[]): Promise<void>;

  updateManyStatus(
    ids: string[],
    status: CertificateStatus
  ): Promise<void>;

  findByUserId(userId: string): Promise<Certificate[]>;

  findById(id: string): Promise<Certificate | null>;
}

export default ICertificateRepository;