export enum MeetingSyncOperationType {
  CREATE = "CREATE",
  UPDATE = "UPDATE",
  CANCEL = "CANCEL",
  SYNC_ATTENDEES = "SYNC_ATTENDEES",
  IMPORT_REPORT = "IMPORT_REPORT"
}

export enum MeetingSyncOperationStatus {
  PENDING = "PENDING",
  PROCESSING = "PROCESSING",
  COMPLETED = "COMPLETED",
  FAILED = "FAILED"
}
