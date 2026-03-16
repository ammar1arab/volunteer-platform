import ICertificateRepository from "./ICertificateRepository";
import {
  Certificate as PrismaCertificate,
  CertificateStatus as PrismaCertificateStatus
} from "@prisma/client";

import { prisma } from "@/infrastructure/persistence/prisma";
import { Certificate } from "@/core/domain/entities";
import { CertificateStatus } from "@/core/domain/enums";

class CertificateRepository implements ICertificateRepository {

  private mapToEntity(data: PrismaCertificate): Certificate {
    return new Certificate({
      ...data,
      status: data.status as CertificateStatus,
      pngUrl: data.pngUrl ?? null,
      pdfUrl: data.pdfUrl ?? null
    });
  }

  private toPrismaStatus(status: CertificateStatus): PrismaCertificateStatus {
    return status as PrismaCertificateStatus;
  }

  async createMany(
    data: { userId: string; activityId: string }[]
  ): Promise<void> {

    await prisma.certificate.createMany({
      data: data.map((item) => ({
        userId: item.userId,
        activityId: item.activityId,
        status: PrismaCertificateStatus.GENERATING
      }))
    });

  }

  async updateManyStatus(
    ids: string[],
    status: CertificateStatus
  ): Promise<void> {

    await prisma.certificate.updateMany({
      where: {
        id: { in: ids }
      },
      data: {
        status: this.toPrismaStatus(status),
        updatedAt: new Date()
      }
    });

  }

  async findByUserId(userId: string): Promise<Certificate[]> {

    const rows = await prisma.certificate.findMany({
      where: { userId },
      orderBy: { issuedAt: "desc" }
    });

    return rows.map((row) => this.mapToEntity(row));

  }

  async findById(id: string): Promise<Certificate | null> {

    const data = await prisma.certificate.findUnique({
      where: { id }
    });

    return data ? this.mapToEntity(data) : null;

  }
}

export default CertificateRepository;