"use client";

import styles from "./MeetingStatusBadge.module.scss";
import { MeetingSyncStatus } from "@/core/domain/enums";
import { getMeetingSyncStatusLabel } from "@/presentation/constants/labels";

const STATUS_CLASS: Record<string, string> = {
  [MeetingSyncStatus.NONE]: "none",
  [MeetingSyncStatus.PENDING]: "pending",
  [MeetingSyncStatus.SYNCED]: "synced",
  [MeetingSyncStatus.FAILED]: "failed",
  [MeetingSyncStatus.CANCELLED]: "cancelled"
};

type Props = {
  status?: string | null;
};

const MeetingStatusBadge = ({ status }: Props) => {
  const key = status || MeetingSyncStatus.NONE;
  const className = STATUS_CLASS[key] ?? "none";

  return (
    <span className={`${styles.status} ${styles[className]}`}>
      {getMeetingSyncStatusLabel(key)}
    </span>
  );
};

export default MeetingStatusBadge;
