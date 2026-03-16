import { CertificateRepository } from "@/infrastructure/persistence/repositories";
import { ActivityRepository } from "@/infrastructure/persistence/repositories";
import { ActivityParticipationRepository } from "@/infrastructure/persistence/repositories";
import { serviceError, guard } from "@/core/application/common";
import { toCertificateDto } from "@/core/application/mappers";
import { ok, fail, GetUserCertificatesResponse, GetCertificateByIdResponse } from "@/core/application/dtos";
import { logger } from "@/lib/utils";

class CertificateUseCase {
  private static readonly SCOPE = "CertificateUseCase";

  constructor(
    private certificateRepository: CertificateRepository,
    private activityRepository: ActivityRepository,
    private participationRepository: ActivityParticipationRepository
  ) {}

  async getByUser(userId: string): Promise<GetUserCertificatesResponse> {
    try {
      guard(userId, "معرّف المستخدم مطلوب");

      const certs = await this.certificateRepository.findByUserId(userId);

      const activityIds = [...new Set(certs.map((c) => c.activityId))];
      const summaries = await Promise.all(
        activityIds.map((id) => this.activityRepository.findSummaryById(id))
      );
      const activityMap = new Map(activityIds.map((id, i) => [id, summaries[i]]));

      const certificates = certs.map((c) => {
        const summary = activityMap.get(c.activityId);
        return toCertificateDto(c, summary?.title ?? "", summary?.activityType ?? null, summary?.durationHours ?? null);
      });

      const totalHours = await this.participationRepository.sumAttendedHours(userId);

      logger.info(CertificateUseCase.SCOPE, "getByUser", `Found ${certificates.length} for: ${userId}`);
      return ok({ certificates, totalHours });
    } catch (error) {
      return serviceError(CertificateUseCase.SCOPE, "getByUser", error, "حدث خطأ أثناء جلب الشهادات");
    }
  }

  async getById(id: string): Promise<GetCertificateByIdResponse> {
    try {
      guard(id, "معرّف الشهادة مطلوب");

      const cert = await this.certificateRepository.findById(id);
      if (!cert) return fail("NOT_FOUND", "الشهادة غير موجودة");

      const summary = await this.activityRepository.findSummaryById(cert.activityId);

      logger.info(CertificateUseCase.SCOPE, "getById", `id=${id}`);
      return ok({
        certificate: toCertificateDto(cert, summary?.title ?? "", summary?.activityType ?? null, summary?.durationHours ?? null)
      });
    } catch (error) {
      return serviceError(CertificateUseCase.SCOPE, "getById", error, "حدث خطأ أثناء جلب الشهادة");
    }
  }
}

export default CertificateUseCase;