import { BaseEntity } from "@/core/domain/entities";
import { CertificateProps } from "@/core/domain/interfaces";
import { CertificateStatus } from "@/core/domain/enums";

class Certificate extends BaseEntity {
  private props: CertificateProps;

  constructor(props: CertificateProps) {
    super(props.id, props.createdAt, props.updatedAt, props.isActive ?? true);
    if (!props.userId?.trim()) throw new Error("User ID is required");
    if (!props.activityId?.trim()) throw new Error("Activity ID is required");
    this.props = {
      ...props,
      pngUrl: props.pngUrl ?? null
    };
  }

  static create(input: { userId: string; activityId: string }): Certificate {
    return new Certificate({
      ...input,
      id: crypto.randomUUID(),
      pngUrl: null,
      status: CertificateStatus.GENERATING,
      issuedAt: new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
      isActive: true
    });
  }

  static reconstitute(props: CertificateProps): Certificate {
    return new Certificate(props);
  }

  markCompleted(pngUrl: string): void {
    if (this.props.status !== CertificateStatus.GENERATING)
      throw new Error("Only generating certificates can be marked completed");
    this.props.status = CertificateStatus.COMPLETED;
    this.props.pngUrl = pngUrl;
    this.touch();
  }

  markFailed(): void {
    if (this.props.status !== CertificateStatus.GENERATING)
      throw new Error("Only generating certificates can be marked failed");
    this.props.status = CertificateStatus.FAILED;
    this.touch();
  }

  isCompleted(): boolean {
    return this.props.status === CertificateStatus.COMPLETED;
  }

  get userId(): string {
    return this.props.userId;
  }
  get activityId(): string {
    return this.props.activityId;
  }
  get pngUrl(): string | null {
    return this.props.pngUrl;
  }
  get status(): CertificateStatus {
    return this.props.status;
  } 
  get issuedAt(): Date {
    return this.props.issuedAt;
  }

  toObject(): CertificateProps {
    return {
      ...this.props,
      id: this.id,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
      isActive: this.isActive
    };
  }
}

export default Certificate;
