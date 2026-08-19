import { prisma } from "@/infrastructure/persistence/prisma";
import type { Prisma } from "@prisma/client";

import { SystemLogStatus } from "@/core/domain/enums";

export default class SystemLogRepository {
  async create(data: Prisma.SystemLogUncheckedCreateInput) {
    return prisma.systemLog.create({
      data
    });
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
}
