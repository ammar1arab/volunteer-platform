"use client";

import styles from "./MeetingRoom.module.scss";
import type { MeetingLaunchDto } from "@/presentation/services/meetings.service";
import { ArrowRight, CalendarDays, Clock3, RefreshCw, Users, VideoOff } from "lucide-react";
import Button from "@/presentation/components/base/Button/Button";
import ConfirmDialog from "@/presentation/components/base/ConfirmDialog/ConfirmDialog";
import EmptyState from "@/presentation/components/state/EmptyState/EmptyState";
import LoadingState from "@/presentation/components/state/LoadingState/LoadingState";
import { ToastContainer } from "@/presentation/components/state/Toast/Toast";
import { useNow } from "@/presentation/query";
import { MEETING_LABELS } from "@/presentation/constants/meetingEmbed";
import {
  formatMeetingDate,
  getMeetingPhase,
  getMeetingPhaseLabel,
  useMeetingRoomEmbed
} from "./MeetingRoom.logic";

type Props = {
  activityId: string;
  displayName?: string;
  launch: MeetingLaunchDto;
  onLeave: () => void;
};

const MeetingRoom = ({ activityId, displayName, launch, onLeave }: Props) => {
  const subject = launch.title?.trim() || MEETING_LABELS.roomTitle;
  const {
    status,
    participantCount,
    setParentNode,
    retryLoad,
    requestLeave,
    toasts,
    removeToast,
    confirmDialog
  } = useMeetingRoomEmbed({ activityId, displayName, subject });
  const now = useNow(true);
  const phase = getMeetingPhase(
    launch.date,
    launch.startTime,
    launch.endTime,
    now || Date.now(),
    launch.timeZone
  );
  const dateLabel = formatMeetingDate(launch.date, launch.timeZone);
  const timeLabel =
    launch.startTime && launch.endTime ? `${launch.startTime} – ${launch.endTime}` : null;
  const showStage = status === "boot" || status === "ready" || status === "joined";

  return (
    <section className={styles.room}>
      <ToastContainer toasts={toasts} onRemove={removeToast} />
      <div className={styles.topBar}>
        <div className={styles.heading}>
          <div className={styles.titleRow}>
            <h1 className={styles.title}>{subject}</h1>
            {phase && (
              <span className={`${styles.phase} ${styles[phase]}`}>{getMeetingPhaseLabel(phase)}</span>
            )}
          </div>
          <div className={styles.meta}>
            {dateLabel && (
              <span>
                <CalendarDays size={14} />
                {dateLabel}
              </span>
            )}
            {timeLabel && (
              <span>
                <Clock3 size={14} />
                {timeLabel}
              </span>
            )}
            {status === "joined" && (
              <span>
                <Users size={14} />
                {participantCount} {MEETING_LABELS.participants}
              </span>
            )}
          </div>
        </div>
        <Button
          variant="ghost"
          size="sm"
          className={styles.leaveBtn}
          icon={<ArrowRight size={14} />}
          onClick={() => {
            void requestLeave(onLeave);
          }}
        >
          {MEETING_LABELS.leave}
        </Button>
      </div>

      <div className={styles.stage}>
        {showStage && <div className={styles.mount} dir="ltr" ref={setParentNode} />}
        {status === "boot" && (
          <div className={styles.overlay}>
            <LoadingState compact />
          </div>
        )}
        {status === "failed" && (
          <div className={styles.panel}>
            <EmptyState
              icon={VideoOff}
              title={MEETING_LABELS.loadError}
              message={MEETING_LABELS.loadErrorMessage}
              action={{ label: MEETING_LABELS.retry, onClick: retryLoad }}
            />
          </div>
        )}
        {status === "left" && (
          <div className={styles.panel}>
            <EmptyState
              icon={RefreshCw}
              title={MEETING_LABELS.leftTitle}
              message={MEETING_LABELS.leftMessage}
              action={{ label: MEETING_LABELS.rejoin, onClick: retryLoad }}
            />
          </div>
        )}
      </div>

      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        onClose={confirmDialog.handleCancel}
        onConfirm={confirmDialog.handleConfirm}
        title={confirmDialog.options.title}
        message={confirmDialog.options.message}
        confirmText={confirmDialog.options.confirmText}
        cancelText={confirmDialog.options.cancelText}
        variant={confirmDialog.options.variant}
        warning={confirmDialog.options.warning}
      />
    </section>
  );
};

export default MeetingRoom;
