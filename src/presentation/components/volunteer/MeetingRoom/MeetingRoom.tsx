"use client";

import styles from "./MeetingRoom.module.scss";
import type { MeetingSessionDto } from "@/core/application/dtos";
import {
  ArrowRight,
  CalendarDays,
  Check,
  Clock3,
  Maximize2,
  Minimize2,
  RefreshCw,
  ShieldOff,
  UserRound,
  Users,
  VideoOff,
  X
} from "lucide-react";
import Button from "@/presentation/components/base/Button/Button";
import ConfirmDialog from "@/presentation/components/base/ConfirmDialog/ConfirmDialog";
import EmptyState from "@/presentation/components/state/EmptyState/EmptyState";
import LoadingState from "@/presentation/components/state/LoadingState/LoadingState";
import { ToastContainer } from "@/presentation/components/state/Toast/Toast";
import ActivityPresenterBadge from "@/presentation/components/activity/ActivityPresenterBadge/ActivityPresenterBadge";
import { useNow } from "@/presentation/query";
import { MEETING_GATE_COPY, MEETING_LABELS, MEETING_TOASTS } from "@/presentation/constants/meetingEmbed";
import {
  formatMeetingDate,
  getMeetingPhase,
  getMeetingPhaseLabel,
  useMeetingRoom
} from "./MeetingRoom.logic";

type Props = {
  activityId: string;
  onLeave: () => void;
};

const WaitingDock = ({
  session,
  admitting,
  onAdmit
}: {
  session: MeetingSessionDto;
  admitting: boolean;
  onAdmit: (userId: string, allow: boolean) => void;
}) => (
  <aside className={styles.dock} aria-label={MEETING_LABELS.dockTitle}>
    <div className={styles.dockHead}>
      <h2>{MEETING_LABELS.dockTitle}</h2>
      <span>{session.waiting.length}</span>
    </div>
    <ul className={styles.dockList}>
      {session.waiting.length === 0 && (
        <li className={styles.dockEmpty}>{MEETING_LABELS.emptyWaiting}</li>
      )}
      {session.waiting.map((guest) => (
        <li key={guest.userId} className={styles.dockItem}>
          <div className={styles.dockIdentity}>
            <strong>{guest.fullName}</strong>
            <span>{guest.email}</span>
          </div>
          <div className={styles.dockActions}>
            <Button
              type="button"
              variant="primary"
              size="sm"
              disabled={admitting}
              icon={<Check size={14} />}
              onClick={() => onAdmit(guest.userId, true)}
            >
              {MEETING_LABELS.admit}
            </Button>
            <Button
              type="button"
              variant="danger"
              size="sm"
              disabled={admitting}
              icon={<X size={14} />}
              onClick={() => onAdmit(guest.userId, false)}
            >
              {MEETING_LABELS.deny}
            </Button>
          </div>
        </li>
      ))}
    </ul>
  </aside>
);

const MeetingRoom = ({ activityId, onLeave }: Props) => {
  const {
    status,
    participantCount,
    setParentNode,
    retryLoad,
    requestLeave,
    showToast,
    toasts,
    removeToast,
    confirmDialog,
    session,
    sessionLoading,
    sessionError,
    identityName,
    canEnterMedia,
    admit,
    admitting,
    refreshSession,
    fullscreen
  } = useMeetingRoom(activityId);
  const now = useNow(true);
  const subject = session?.title?.trim() || MEETING_LABELS.roomTitle;
  const phase = getMeetingPhase(
    session?.date,
    session?.startTime,
    session?.endTime,
    now || Date.now(),
    session?.timeZone
  );
  const dateLabel = formatMeetingDate(session?.date);
  const timeLabel =
    session?.startTime && session?.endTime ? `${session.startTime} – ${session.endTime}` : null;
  const showStage = canEnterMedia && (status === "boot" || status === "ready" || status === "joined");
  const gateStage = session?.stage;
  const gateCopy =
    gateStage === "waiting_host" || gateStage === "waiting_admit" || gateStage === "denied"
      ? MEETING_GATE_COPY[gateStage]
      : null;
  const GateIcon = gateStage === "denied" ? ShieldOff : gateStage === "waiting_admit" ? Users : UserRound;

  const handleAdmit = (userId: string, allow: boolean) => {
    void admit(userId, allow)
      .then(() => showToast(allow ? MEETING_TOASTS.admitted : MEETING_TOASTS.rejected, allow ? "success" : "info"))
      .catch(() => showToast(MEETING_TOASTS.failed, "error"));
  };

  return (
    <section ref={fullscreen.setNode} className={`${styles.room} ${fullscreen.active ? styles.expanded : ""}`}>
      <ToastContainer toasts={toasts} onRemove={removeToast} />
      <div className={styles.topBar}>
        <div className={styles.heading}>
          <div className={styles.titleRow}>
            <h1 className={styles.title}>{subject}</h1>
            {phase && (
              <span className={`${styles.phase} ${styles[phase]}`}>{getMeetingPhaseLabel(phase)}</span>
            )}
            {session?.role === "host" && <span className={styles.hostBadge}>{MEETING_LABELS.hostBadge}</span>}
          </div>
          <div className={styles.meta}>
            {dateLabel && (
              <span className={styles.metaChip}>
                <CalendarDays size={14} />
                <em>{MEETING_LABELS.dateLabel}</em>
                {dateLabel}
              </span>
            )}
            {timeLabel && (
              <span className={styles.metaChip}>
                <Clock3 size={14} />
                <em>{MEETING_LABELS.timeLabel}</em>
                {timeLabel}
              </span>
            )}
            <ActivityPresenterBadge name={session?.presenterName} />
            {status === "joined" && (
              <span className={styles.metaChip}>
                <Users size={14} />
                {participantCount} {MEETING_LABELS.participants}
              </span>
            )}
          </div>
        </div>
        <div className={styles.actions}>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className={styles.iconBtn}
            icon={fullscreen.active ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
            aria-label={fullscreen.active ? MEETING_LABELS.exitFullscreen : MEETING_LABELS.fullscreen}
            onClick={fullscreen.toggle}
          >
            {fullscreen.active ? MEETING_LABELS.exitFullscreen : MEETING_LABELS.fullscreen}
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className={styles.leaveBtn}
            icon={<ArrowRight size={16} />}
            onClick={() => {
              void requestLeave(onLeave);
            }}
          >
            {MEETING_LABELS.back}
          </Button>
        </div>
      </div>

      <div className={styles.workspace}>
        <div className={styles.stage}>
          {showStage && <div className={styles.mount} dir="ltr" ref={setParentNode} />}
          {(sessionLoading || (showStage && status === "boot")) && (
            <div className={styles.overlay}>
              <LoadingState compact />
            </div>
          )}
          {!sessionLoading && sessionError && (
            <div className={styles.panel}>
              <EmptyState
                icon={VideoOff}
                title={MEETING_LABELS.launchError}
                message={sessionError}
                action={{ label: MEETING_LABELS.retry, onClick: refreshSession }}
              />
            </div>
          )}
          {!sessionLoading && !sessionError && gateCopy && (
            <div className={styles.gate}>
              <GateIcon size={40} strokeWidth={1.5} />
              <h2>{gateCopy.title}</h2>
              <p>{gateCopy.message}</p>
              <span>
                {MEETING_LABELS.identityVia}: {identityName}
              </span>
              {gateStage === "denied" && (
                <Button type="button" variant="secondary" size="sm" onClick={onLeave}>
                  {MEETING_LABELS.back}
                </Button>
              )}
            </div>
          )}
          {canEnterMedia && status === "failed" && (
            <div className={styles.panel}>
              <EmptyState
                icon={VideoOff}
                title={MEETING_LABELS.loadError}
                message={MEETING_LABELS.loadErrorMessage}
                action={{ label: MEETING_LABELS.retry, onClick: retryLoad }}
              />
            </div>
          )}
          {canEnterMedia && status === "left" && (
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
        {session?.role === "host" && (
          <WaitingDock session={session} admitting={admitting} onAdmit={handleAdmit} />
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
