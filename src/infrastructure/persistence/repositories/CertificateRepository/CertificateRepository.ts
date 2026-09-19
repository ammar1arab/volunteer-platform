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

  async findIssuedUserIds(activityId: string): Promise<string[]> {

    const rows = await prisma.certificate.findMany({
      where: { activityId, status: PrismaCertificateStatus.COMPLETED },
      select: { userId: true }
    });

    return rows.map((row) => row.userId);

  }

  async findByUserAndActivity(userId: string, activityId: string): Promise<Certificate | null> {
    const data = await prisma.certificate.findUnique({
      where: { userId_activityId: { userId, activityId } }
    });
    return data ? this.mapToEntity(data) : null;
  }

  async saveIssued(data: { userId: string; activityId: string; pngUrl: string }): Promise<Certificate> {

    const row = await prisma.certificate.upsert({
      where: { userId_activityId: { userId: data.userId, activityId: data.activityId } },
      create: {
        userId: data.userId,
        activityId: data.activityId,
        pngUrl: data.pngUrl,
        status: PrismaCertificateStatus.COMPLETED
      },
      update: {
        pngUrl: data.pngUrl,
        status: PrismaCertificateStatus.COMPLETED,
        issuedAt: new Date(),
        updatedAt: new Date()
      }
    });

    return this.mapToEntity(row);

  }
}

export default CertificateRepository;