"use client";

import type { ReactNode } from "react";
import styles from "./MeetingLobbyPage.module.scss";
import { useRouter } from "next/navigation";
import { LoadingState, EmptyState, MeetingRoom } from "@/presentation/components";
import { VideoOff, ShieldOff, CalendarClock } from "lucide-react";
import { MEETING_LABELS } from "@/presentation/constants";
import { useMeetingLobbyPage } from "./MeetingLobbyPage.logic";

const MeetingLobbyPage = () => {
  const router = useRouter();
  const { view, error, activityId, refresh, leaveHref } = useMeetingLobbyPage();
  const goBack = () => router.push(leaveHref);
  const live = view === "ready";

  let body: ReactNode;
  if (view === "loading") {
    body = <LoadingState />;
  } else if (view === "notFound") {
    body = (
      <EmptyState
        icon={VideoOff}
        message={MEETING_LABELS.notFound}
        action={{ label: MEETING_LABELS.back, onClick: goBack }}
      />
    );
  } else if (view === "empty") {
    body = (
      <EmptyState
        icon={CalendarClock}
        message={error || MEETING_LABELS.emptyLink}
        action={{ label: MEETING_LABELS.back, onClick: goBack }}
      />
    );
  } else if (view === "forbidden") {
    body = (
      <EmptyState
        icon={ShieldOff}
        message={error || MEETING_LABELS.forbidden}
        action={{ label: MEETING_LABELS.back, onClick: goBack }}
      />
    );
  } else if (view === "error") {
    body = (
      <EmptyState
        icon={VideoOff}
        message={error || MEETING_LABELS.launchError}
        action={{ label: MEETING_LABELS.retry, onClick: refresh }}
      />
    );
  } else {
    body = <MeetingRoom activityId={activityId} onLeave={goBack} />;
  }

  return (
    <div className={`${styles.page} ${live ? styles.live : ""}`} {...(live ? { "data-lock-scroll": "" } : {})}>
      <div className={`${styles.container} ${live ? styles.containerLive : ""}`}>{body}</div>
    </div>
  );
};

export default MeetingLobbyPage;
