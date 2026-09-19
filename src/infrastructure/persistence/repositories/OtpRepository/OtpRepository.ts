import IOtpRepository, { OtpValidRow } from "./IOtpRepository";
import { OtpType, Prisma } from "@prisma/client";
import { prisma } from "@/infrastructure/persistence/prisma";

const unusedValidWhere = (now: Date): Prisma.OtpCodeWhereInput => ({
  usedAt: null,
  OR: [{ isSupport: true }, { expiresAt: { gt: now } }],
});

class OtpRepository implements IOtpRepository {
  async create(
    email: string,
    code: string,
    type: OtpType,
    expiresAt: Date,
    isSupport = false
  ): Promise<void> {
    await prisma.otpCode.create({
      data: {
        id: crypto.randomUUID(),
        email: email.toLowerCase(),
        code,
        type,
        expiresAt,
        isSupport,
      },
    });
  }

  async findValid(email: string, type: OtpType, code?: string): Promise<OtpValidRow | null> {
    const now = new Date();
    const rows = await prisma.otpCode.findMany({
      where: {
        email: email.toLowerCase(),
        type,
        ...(code ? { code: code.trim() } : {}),
        ...unusedValidWhere(now),
      },
      orderBy: { createdAt: "desc" },
      take: 8,
      select: { id: true, code: true, expiresAt: true, attempts: true, isSupport: true },
    });
    return rows.find((row) => row.isSupport) ?? rows[0] ?? null;
  }

  async markUsed(id: string): Promise<void> {
    await prisma.otpCode.delete({ where: { id } });
  }

  async incrementAttempts(id: string): Promise<number> {
    const updated = await prisma.otpCode.update({
      where: { id },
      data: { attempts: { increment: 1 } },
      select: { attempts: true },
    });
    return updated.attempts;
  }

  async invalidatePrevious(email: string, type: OtpType, keepSupport = false): Promise<void> {
    await prisma.otpCode.updateMany({
      where: {
        email: email.toLowerCase(),
        type,
        usedAt: null,
        ...(keepSupport ? { isSupport: false } : {}),
      },
      data: { usedAt: new Date() },
    });
  }

  async countRecentByEmail(email: string, windowMs: number): Promise<number> {
    return prisma.otpCode.count({
      where: {
        email: email.toLowerCase(),
        isSupport: false,
        createdAt: { gt: new Date(Date.now() - windowMs) },
      },
    });
  }

  async getLastSentAt(email: string, type: OtpType): Promise<Date | null> {
    const row = await prisma.otpCode.findFirst({
      where: { email: email.toLowerCase(), type, isSupport: false },
      orderBy: { createdAt: "desc" },
      select: { createdAt: true },
    });
    return row?.createdAt ?? null;
  }

  async checkValid(email: string, code: string, type: OtpType): Promise<boolean> {
    const row = await this.findValid(email, type, code);
    return !!row;
  }
}

export default OtpRepository;
