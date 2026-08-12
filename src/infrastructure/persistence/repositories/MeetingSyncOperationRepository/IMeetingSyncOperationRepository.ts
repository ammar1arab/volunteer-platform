import {
  MeetingSyncOperationStatus,
  MeetingSyncOperationType
} from "@/core/domain/enums";

export interface MeetingSyncOperationRecord {
  id: string;
  activityId: string;
  type: MeetingSyncOperationType;
  status: MeetingSyncOperationStatus;
  attempts: number;
  payload: unknown;
  lastError: string | null;
  dedupeKey: string;
  scheduledFor: Date;
  processedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

interface IMeetingSyncOperationRepository {
  enqueue(input: {
    activityId: string;
    type: MeetingSyncOperationType;
    dedupeKey: string;
    payload?: unknown;
    scheduledFor?: Date;
  }): Promise<MeetingSyncOperationRecord>;
  findById(id: string): Promise<MeetingSyncOperationRecord | null>;
  findPending(limit?: number): Promise<MeetingSyncOperationRecord[]>;
  markProcessing(id: string): Promise<MeetingSyncOperationRecord>;
  markCompleted(id: string): Promise<MeetingSyncOperationRecord>;
  markFailed(id: string, error: string): Promise<MeetingSyncOperationRecord>;
}

export default IMeetingSyncOperationRepository;
