import { Certificate } from "@/core/domain/entities";
import { CertificateDto } from "@/core/application/dtos";

export function toCertificateDto(
  cert: Certificate,
  activityTitle: string,
  activityType?: string | null,
  durationHours?: number | null
): CertificateDto {
  return {
    id: cert.id,
    userId: cert.userId,
    activityId: cert.activityId,
    activityTitle,
    activityType: activityType ?? null,
    durationHours: durationHours ?? null,
    pngUrl: cert.pngUrl,
    status: cert.status,
    issuedAt: cert.issuedAt.toISOString()
  };
}