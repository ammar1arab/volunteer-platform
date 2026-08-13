"use client";

import { useState } from "react";
import styles from "./MeetingRoom.module.scss";
import type { MeetingLaunchDto } from "@/presentation/services/meetings.service";
import { ArrowRight, CalendarDays, Clock3 } from "lucide-react";
import LoadingState from "@/presentation/components/state/LoadingState/LoadingState";
import { formatMeetingDate, getInAppMeetingSrc } from "./MeetingRoom.logic";

type Props = {
  activityId: string;
  displayName?: string;
  launch: MeetingLaunchDto;
  onLeave: () => void;
};

const MeetingRoom = ({ activityId, displayName, launch, onLeave }: Props) => {
  const src = getInAppMeetingSrc(activityId, displayName);
  const [loadedSrc, setLoadedSrc] = useState("");
  const loaded = loadedSrc === src;
  const dateLabel = formatMeetingDate(launch.date);
  const timeLabel =
    launch.startTime && launch.endTime ? `${launch.startTime} – ${launch.endTime}` : null;

  return (
    <section className={styles.room}>
      <div className={styles.topBar}>
        <div className={styles.heading}>
          <h1 className={styles.title}>{launch.title || "قاعة الاجتماع"}</h1>
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
        {!loaded && (
          <div className={styles.overlay}>
            <LoadingState compact />
          </div>
        )}
        <iframe
          className={styles.frame}
          src={src}
          title={launch.title || "قاعة الاجتماع"}
          allow="camera; microphone; display-capture; autoplay; clipboard-write; fullscreen; speaker-selection"
          allowFullScreen
          onLoad={() => setLoadedSrc(src)}
        />
      </div>
    </section>
  );
};

export default MeetingRoom;
