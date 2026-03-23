import IOtpRepository, { OtpValidRow } from "./IOtpRepository";
import { OtpType } from "@prisma/client";
import { prisma } from "@/infrastructure/persistence/prisma";

class OtpRepository implements IOtpRepository {
  async create(email: string, code: string, type: OtpType, expiresAt: Date): Promise<void> {
    await prisma.otpCode.create({
      data: { id: crypto.randomUUID(), email: email.toLowerCase(), code, type, expiresAt },
    });
  }

  async findValid(email: string, type: OtpType): Promise<OtpValidRow | null> {
    const row = await prisma.otpCode.findFirst({
      where: {
        email:     email.toLowerCase(),
        type,
        usedAt:    null,
        expiresAt: { gt: new Date() },
      },
      orderBy: { createdAt: "desc" },
      select:  { id: true, code: true, expiresAt: true, attempts: true },
    });
    return row ?? null;
  }

  async markUsed(id: string): Promise<void> {
    await prisma.otpCode.update({ where: { id }, data: { usedAt: new Date() } });
  }

  async incrementAttempts(id: string): Promise<number> {
    const updated = await prisma.otpCode.update({
      where: { id },
      data:  { attempts: { increment: 1 } },
      select: { attempts: true },
    });
    return updated.attempts;
  }

  async invalidatePrevious(email: string, type: OtpType): Promise<void> {
    await prisma.otpCode.updateMany({
      where: { email: email.toLowerCase(), type, usedAt: null },
      data:  { usedAt: new Date() },
    });
  }

  async countRecentByEmail(email: string, windowMs: number): Promise<number> {
    return prisma.otpCode.count({
      where: { email: email.toLowerCase(), createdAt: { gt: new Date(Date.now() - windowMs) } },
    });
  }

  async getLastSentAt(email: string, type: OtpType): Promise<Date | null> {
    const row = await prisma.otpCode.findFirst({
      where:   { email: email.toLowerCase(), type },
      orderBy: { createdAt: "desc" },
      select:  { createdAt: true },
    });
    return row?.createdAt ?? null;
  }

  async checkValid(email: string, code: string, type: OtpType): Promise<boolean> {
    const row = await prisma.otpCode.findFirst({
      where: { email: email.toLowerCase(), type, code, usedAt: null, expiresAt: { gt: new Date() } },
      select: { id: true },
    });
    return !!row;
  }
}

export default OtpRepository;