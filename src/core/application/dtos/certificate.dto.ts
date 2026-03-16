import { CertificateStatus } from "@/core/domain/enums";
import type { Result } from "./base.dto";

export interface CertificateDto {
  id: string;
  userId: string;
  activityId: string;
  activityTitle: string;
  activityType: string | null;
  durationHours: number | null;
  pngUrl: string | null;
  pdfUrl: string | null;
  status: CertificateStatus;
  issuedAt: string;
}

export interface CertificateWithTotalHoursDto {
  certificates: CertificateDto[];
  totalHours: number;
}

export type GetUserCertificatesResponse = Result<CertificateWithTotalHoursDto>;
export type GetCertificateByIdResponse = Result<{ certificate: CertificateDto }>;