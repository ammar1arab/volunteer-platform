import { SystemLogRepository } from "@/infrastructure/persistence/repositories";
import { serviceError } from "@/core/application/common";
import { ok } from "@/core/application/dtos";
import { logger } from "@/lib/utils";
import { SystemLogStatus } from "@/core/domain/enums";
import type { Prisma } from "@prisma/client";

class SystemLogUseCase {
  private static readonly SCOPE = "SystemLogUseCase";

  constructor(private systemLogRepository: SystemLogRepository) {}

  async logAction(data: {
    action: string;
    status: SystemLogStatus;
    message?: string;
    metadata?: Record<string, unknown> | null;
    userId?: string;
  }) {
    try {
      await this.systemLogRepository.create({
        action: data.action,
        status: data.status,
        message: data.message,
        metadata: data.metadata as Prisma.InputJsonValue,
        userId: data.userId,
      });
    } catch (error) {
      logger.error(SystemLogUseCase.SCOPE, "logAction", error as Error);
    }
  }

  async getLogs(page = 1, limit = 50, filters?: { action?: string; status?: string }) {
    try {
      const skip = (page - 1) * limit;
      const where: Prisma.SystemLogWhereInput = {};
      if (filters?.action) where.action = filters.action;
      if (filters?.status && filters.status !== "ALL") where.status = filters.status;

      const [logs, total] = await Promise.all([
        this.systemLogRepository.findMany({
          skip,
          take: limit,
          where,
          orderBy: { createdAt: "desc" }
        }),
        this.systemLogRepository.count(where)
      ]);

      return ok({
        logs,
        pagination: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit)
        }
      });
    } catch (error) {
      return serviceError(SystemLogUseCase.SCOPE, "getLogs", error, "Failed to fetch logs");
    }
  }

  async clearAll() {
    try {
      await this.systemLogRepository.clearAll();
      return ok({ success: true });
    } catch (error) {
      return serviceError(SystemLogUseCase.SCOPE, "clearAll", error, "Failed to clear logs");
    }
  }
}

export default SystemLogUseCase;
