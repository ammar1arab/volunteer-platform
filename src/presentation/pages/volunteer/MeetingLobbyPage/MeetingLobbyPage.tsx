"use client";

import type { ReactNode } from "react";
import styles from "./MeetingLobbyPage.module.scss";
import { useRouter } from "next/navigation";
import { LoadingState, EmptyState, MeetingRoom } from "@/presentation/components";
import { VideoOff, ShieldOff, CalendarClock } from "lucide-react";
import { useMeetingLobbyPage } from "./MeetingLobbyPage.logic";

const MeetingLobbyPage = () => {
  const router = useRouter();
  const { view, launch, error, activityId, displayName, refresh, leaveHref } = useMeetingLobbyPage();
  const goBack = () => router.push(leaveHref);
  const live = view === "ready";

  let body: ReactNode;
  if (view === "loading") {
    body = <LoadingState />;
  } else if (view === "notFound") {
    body = (
      <EmptyState
        icon={VideoOff}
        message="النشاط غير موجود"
        action={{ label: "العودة", onClick: goBack }}
      />
    );
  } else if (view === "empty") {
    body = (
      <EmptyState
        icon={CalendarClock}
        message={error || "رابط الاجتماع غير متوفر بعد"}
        action={{ label: "العودة", onClick: goBack }}
      />
    );
  } else if (view === "forbidden") {
    body = (
      <EmptyState
        icon={ShieldOff}
        message={error || "ليس لديك صلاحية للانضمام إلى هذا الاجتماع"}
        action={{ label: "العودة", onClick: goBack }}
      />
    );
  } else if (view === "error" || !launch) {
    body = (
      <EmptyState
        icon={VideoOff}
        message={error || "تعذر فتح هذا الاجتماع حالياً"}
        action={{ label: "إعادة المحاولة", onClick: refresh }}
      />
    );
  } else {
    body = (
      <MeetingRoom
        activityId={activityId}
        displayName={displayName}
        launch={launch}
        onLeave={goBack}
      />
    );
  }

  return (
    <div className={`${styles.page} ${live ? styles.live : ""}`}>
      <div className={`${styles.container} ${live ? styles.containerLive : ""}`}>{body}</div>
    </div>
  );
};

export default MeetingLobbyPage;
