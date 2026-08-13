"use client";

import styles from "./MeetingRoom.module.scss";
import Button from "@/presentation/components/base/Button/Button";
import LoadingState from "@/presentation/components/state/LoadingState/LoadingState";
import type { MeetingLaunchDto } from "@/presentation/services/meetings.service";
import { ArrowRight, CalendarDays, Clock3 } from "lucide-react";
import { formatMeetingDate, useMeetingRoomEmbed } from "./MeetingRoom.logic";

type Props = {
  launch: MeetingLaunchDto;
  onLeave: () => void;
};

const IFRAME_ALLOW =
  "camera; microphone; display-capture; autoplay; clipboard-write; clipboard-read; encrypted-media; fullscreen; picture-in-picture; geolocation";

const MeetingRoom = ({ launch, onLeave }: Props) => {
  const dateLabel = formatMeetingDate(launch.date);
  const timeLabel =
    launch.startTime && launch.endTime ? `${launch.startTime} – ${launch.endTime}` : null;
  const { status, handleLoad } = useMeetingRoomEmbed(launch.url);

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
        <Button
          variant="ghost"
          size="sm"
          className={styles.leaveBtn}
          icon={<ArrowRight size={14} />}
          onClick={onLeave}
        >
          مغادرة القاعة
        </Button>
      </div>

      <div className={styles.stage}>
        {status === "loading" && (
          <div className={styles.overlay}>
            <LoadingState compact />
          </div>
        )}
        <iframe
          className={styles.frame}
          src={launch.url}
          title={launch.title || "Google Meet"}
          allow={IFRAME_ALLOW}
          allowFullScreen
          referrerPolicy="origin-when-cross-origin"
          onLoad={handleLoad}
        />
      </div>
    </section>
  );
};

export default MeetingRoom;
