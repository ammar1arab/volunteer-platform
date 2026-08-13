import IMeetingSyncOperationRepository, {
  MeetingSyncOperationRecord,
  MeetingSyncPayload
} from "./IMeetingSyncOperationRepository";
import type { MeetingSyncOperation as PrismaMeetingSyncOperation, Prisma } from "@prisma/client";
import { prisma } from "@/infrastructure/persistence/prisma";
import {
  MeetingSyncOperationStatus,
  MeetingSyncOperationType
} from "@/core/domain/enums";

function parseMeetingSyncPayload(value: Prisma.JsonValue): MeetingSyncPayload | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  if (typeof value.activityId !== "string" || typeof value.type !== "string") return null;
  return {
    activityId: value.activityId,
    type: value.type as MeetingSyncOperationType
  };
}

class MeetingSyncOperationRepository implements IMeetingSyncOperationRepository {
  private map(data: PrismaMeetingSyncOperation): MeetingSyncOperationRecord {
    return {
      id: data.id,
      activityId: data.activityId,
      type: data.type as MeetingSyncOperationType,
      status: data.status as MeetingSyncOperationStatus,
      attempts: data.attempts,
      payload: parseMeetingSyncPayload(data.payload),
      lastError: data.lastError ?? null,
      dedupeKey: data.dedupeKey,
      scheduledFor: data.scheduledFor,
      processedAt: data.processedAt ?? null,
      createdAt: data.createdAt,
      updatedAt: data.updatedAt
    };
  }

  async enqueue(input: {
    activityId: string;
    type: MeetingSyncOperationType;
    dedupeKey: string;
    payload?: MeetingSyncPayload;
    scheduledFor?: Date;
  }): Promise<MeetingSyncOperationRecord> {
    const now = new Date();
    const row = await prisma.meetingSyncOperation.upsert({
      where: { dedupeKey: input.dedupeKey },
      create: {
        id: crypto.randomUUID(),
        activityId: input.activityId,
        type: input.type,
        status: MeetingSyncOperationStatus.PENDING,
        attempts: 0,
        payload: input.payload
          ? { activityId: input.payload.activityId, type: input.payload.type }
          : undefined,
        lastError: null,
        dedupeKey: input.dedupeKey,
        scheduledFor: input.scheduledFor ?? now,
        processedAt: null,
        createdAt: now,
        updatedAt: now
      },
      update: {
        type: input.type,
        status: MeetingSyncOperationStatus.PENDING,
        payload: input.payload
          ? { activityId: input.payload.activityId, type: input.payload.type }
          : undefined,
        lastError: null,
        scheduledFor: input.scheduledFor ?? now,
        processedAt: null,
        updatedAt: now
      }
    });
    return this.map(row);
  }

  async findById(id: string): Promise<MeetingSyncOperationRecord | null> {
    const row = await prisma.meetingSyncOperation.findUnique({ where: { id } });
    return row ? this.map(row) : null;
  }

  async findPending(limit = 20): Promise<MeetingSyncOperationRecord[]> {
    const rows = await prisma.meetingSyncOperation.findMany({
      where: {
        status: MeetingSyncOperationStatus.PENDING,
        scheduledFor: { lte: new Date() }
      },
      orderBy: { scheduledFor: "asc" },
      take: limit
    });
    return rows.map((row) => this.map(row));
  }

  async markProcessing(id: string): Promise<MeetingSyncOperationRecord> {
    const row = await prisma.meetingSyncOperation.update({
      where: { id },
      data: {
        status: MeetingSyncOperationStatus.PROCESSING,
        attempts: { increment: 1 },
        updatedAt: new Date()
      }
    });
    return this.map(row);
  }

  async markCompleted(id: string): Promise<MeetingSyncOperationRecord> {
    const now = new Date();
    const row = await prisma.meetingSyncOperation.update({
      where: { id },
      data: {
        status: MeetingSyncOperationStatus.COMPLETED,
        processedAt: now,
        lastError: null,
        updatedAt: now
      }
    });
    return this.map(row);
  }

  async markFailed(id: string, error: string): Promise<MeetingSyncOperationRecord> {
    const row = await prisma.meetingSyncOperation.update({
      where: { id },
      data: {
        status: MeetingSyncOperationStatus.FAILED,
        lastError: error.slice(0, 500),
        processedAt: new Date(),
        updatedAt: new Date()
      }
    });
    return this.map(row);
  }
}

export default MeetingSyncOperationRepository;
