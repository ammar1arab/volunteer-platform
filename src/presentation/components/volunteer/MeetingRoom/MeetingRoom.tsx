"use client";

import styles from "./MeetingRoom.module.scss";
import type { MeetingLaunchDto } from "@/presentation/services/meetings.service";
import { ArrowRight, CalendarDays, Clock3, RefreshCw, VideoOff } from "lucide-react";
import LoadingState from "@/presentation/components/state/LoadingState/LoadingState";
import { useNow } from "@/presentation/query";
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
  const { src, status, handleLoad, retryLoad } = useMeetingRoomEmbed(activityId, displayName);
  const now = useNow(true);
  const phase = getMeetingPhase(
    launch.date,
    launch.startTime,
    launch.endTime,
    now || Date.now(),
    launch.timeZone
  );
  const dateLabel = formatMeetingDate(launch.date);
  const timeLabel =
    launch.startTime && launch.endTime ? `${launch.startTime} – ${launch.endTime}` : null;

  return (
    <section className={styles.room}>
      <div className={styles.topBar}>
        <div className={styles.heading}>
          <div className={styles.titleRow}>
            <h1 className={styles.title}>{launch.title || "قاعة الاجتماع"}</h1>
            {phase && (
              <span className={`${styles.phase} ${styles[phase]}`}>{getMeetingPhaseLabel(phase)}</span>
            )}
          </div>
          {(dateLabel || timeLabel) && (
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
            </div>
          )}
        </div>
        <button type="button" className={styles.leaveBtn} onClick={onLeave}>
          <ArrowRight size={14} />
          مغادرة القاعة
        </button>
      </div>

      <div className={styles.stage}>
        {status !== "ready" && (
          <div className={styles.overlay}>
            {status === "loading" ? (
              <LoadingState compact />
            ) : (
              <div className={styles.failed}>
                <VideoOff size={28} strokeWidth={1.6} />
                <p>تعذر تحميل القاعة</p>
                <button type="button" className={styles.retryBtn} onClick={retryLoad}>
                  <RefreshCw size={14} />
                  إعادة المحاولة
                </button>
              </div>
            )}
          </div>
        )}
        <iframe
          key={src}
          className={styles.frame}
          src={src}
          title={launch.title || "قاعة الاجتماع"}
          allow="camera; microphone; display-capture; autoplay; clipboard-write; fullscreen; speaker-selection"
          allowFullScreen
          referrerPolicy="origin"
          onLoad={handleLoad}
        />
      </div>
    </section>
  );
};

export default MeetingRoom;
