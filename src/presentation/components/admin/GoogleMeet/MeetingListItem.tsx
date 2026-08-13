"use client";

import MeetingStatusBadge from "./MeetingStatusBadge";
import ActivityPresenterBadge from "@/presentation/components/activity/ActivityPresenterBadge/ActivityPresenterBadge";
import { getMeetingLinkSourceLabel } from "@/presentation/constants/labels";
import { MeetingSyncStatus } from "@/core/domain/enums";
import { ROUTES } from "@/presentation/constants";
import Link from "next/link";
import type { MeetingListItemDto } from "@/presentation/services/meetings.service";
import {
  Calendar,
  Users,
  ExternalLink,
  RotateCcw,
  Link2,
  Download,
  FileText,
  Video
} from "lucide-react";
import styles from "./MeetingListItem.module.scss";

type Props = {
  meeting: MeetingListItemDto;
  mode: "upcoming" | "finished";
  submitting?: boolean;
  onLaunch: (meeting: MeetingListItemDto) => void;
  onRetry: (meeting: MeetingListItemDto) => void;
  onImportReport?: (meeting: MeetingListItemDto) => void;
  onOpenReport?: (meeting: MeetingListItemDto) => void;
  onOpenVolunteers?: (meeting: MeetingListItemDto) => void;
};

const formatDate = (date: string) => {
  try {
    const d = new Date(date);
    return d.toLocaleDateString("ar-JO", {
      weekday: "short",
      year: "numeric",
      month: "short",
      day: "numeric"
    });
  } catch {
    return date;
  }
};

const MeetingListItem = ({
  meeting,
  mode,
  submitting,
  onLaunch,
  onRetry,
  onImportReport,
  onOpenReport,
  onOpenVolunteers
}: Props) => {
  const needsRetry =
    meeting.meetingSyncStatus === MeetingSyncStatus.FAILED ||
    meeting.meetingSyncStatus === MeetingSyncStatus.PENDING;

  return (
    <article className={styles.item}>
      <div className={styles.main}>
        <div className={styles.titleRow}>
          <Video size={15} className={styles.titleIcon} />
          <h3 className={styles.title}>{meeting.title}</h3>
          <MeetingStatusBadge status={meeting.meetingSyncStatus} />
        </div>

        <div className={styles.meta}>
          <div className={styles.cell}>
            <Calendar size={13} className={styles.icon} />
            <span className={styles.text}>
              {formatDate(meeting.date)} · {meeting.startTime} – {meeting.endTime}
            </span>
          </div>

          <div className={`${styles.cell} ${styles.hideMobile}`}>
            <span className={styles.textMuted}>
              {getMeetingLinkSourceLabel(meeting.meetingLinkSource)}
            </span>
          </div>

          {typeof meeting.approvedCount === "number" && (
            <div className={`${styles.cell} ${styles.hideMobile}`}>
              <Users size={13} className={styles.icon} />
              <span className={styles.text}>{meeting.approvedCount} معتمد</span>
            </div>
          )}

          {meeting.presenter?.fullName && (
            <div className={`${styles.cell} ${styles.hideMobile}`}>
              <ActivityPresenterBadge name={meeting.presenter.fullName} />
            </div>
          )}

          {meeting.reportSummary && (
            <button
              type="button"
              className={styles.reportChip}
              onClick={() => onOpenReport?.(meeting)}
              title="عرض تقرير الحضور"
            >
              حضور {meeting.reportSummary.attendeeCount}
              {meeting.reportSummary.unmatchedCount > 0
                ? ` · غير مطابق ${meeting.reportSummary.unmatchedCount}`
                : ""}
            </button>
          )}
        </div>

        {meeting.meetingSyncError && (
          <p className={styles.error}>{meeting.meetingSyncError}</p>
        )}
      </div>

      <div className={styles.actions}>
        <button
          type="button"
          className={styles.btnInfo}
          title="فتح الاجتماع"
          onClick={() => onLaunch(meeting)}
          disabled={submitting}
        >
          <ExternalLink size={14} />
        </button>

        {mode === "finished" && (
          <>
            <button
              type="button"
              className={styles.btnSuccess}
              title="استيراد الحضور"
              onClick={() => onImportReport?.(meeting)}
              disabled={submitting}
            >
              <Download size={14} />
            </button>
            <button
              type="button"
              className={styles.btn}
              title="تقرير الحضور"
              onClick={() => onOpenReport?.(meeting)}
            >
              <FileText size={14} />
            </button>
            <button
              type="button"
              className={styles.btn}
              title="مراجعة الحضور"
              onClick={() => onOpenVolunteers?.(meeting)}
            >
              <Users size={14} />
            </button>
          </>
        )}

        {needsRetry && (
          <button
            type="button"
            className={styles.btnWarning}
            title="إعادة المزامنة"
            onClick={() => onRetry(meeting)}
            disabled={submitting}
          >
            <RotateCcw size={14} />
          </button>
        )}

        <Link
          href={ROUTES.ACTIVITY_DETAILS(meeting.activityId)}
          className={styles.btn}
          title="عرض النشاط"
        >
          <Link2 size={14} />
        </Link>
      </div>
    </article>
  );
};

export default MeetingListItem;
