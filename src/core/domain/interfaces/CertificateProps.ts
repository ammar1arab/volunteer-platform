import { BaseEntityProps } from "@/core/domain/interfaces";
import { CertificateStatus } from "@/core/domain/enums";

export interface CertificateProps extends BaseEntityProps {
  userId: string;
  activityId: string;
  pngUrl: string | null;
  status: CertificateStatus;
  issuedAt: Date;
}
