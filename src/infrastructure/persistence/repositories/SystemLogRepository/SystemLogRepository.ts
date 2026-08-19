import { prisma } from "@/infrastructure/persistence/prisma";
import type { Prisma } from "@prisma/client";

import { SystemLogStatus } from "@/core/domain/enums";

export default class SystemLogRepository {
  async create(data: Prisma.SystemLogUncheckedCreateInput) {
    const result = await prisma.systemLog.create({
      data
    });

    void prisma.$executeRaw`
      DELETE FROM system_logs
      WHERE id IN (
        SELECT id FROM (
          SELECT id,
            ROW_NUMBER() OVER (ORDER BY "createdAt" DESC) AS rn
          FROM system_logs
        ) ranked
        WHERE rn > 100
      )
    `;

    return result;
  }

  async findMany(options: {
    skip?: number;
    take?: number;
    where?: Prisma.SystemLogWhereInput;
    orderBy?: Prisma.SystemLogOrderByWithRelationInput;
  }) {
    return prisma.systemLog.findMany({
      ...options,
      include: {
        user: {
          select: { fullName: true, email: true }
        }
      }
    });
  }

  async count(where?: Prisma.SystemLogWhereInput) {
    return prisma.systemLog.count({ where });
  }

  async getStats() {
    const [total, errorCount] = await Promise.all([
      prisma.systemLog.count(),
      prisma.systemLog.count({ where: { status: SystemLogStatus.ERROR } })
    ]);
    return { total, errorCount };
  }

  async clearAll() {
    return prisma.systemLog.deleteMany({});
  }
}
