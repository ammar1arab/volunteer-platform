"use client";

import styles from "./MeetingLobbyPage.module.scss";
import { useRouter } from "next/navigation";
import { LoadingState, EmptyState, MeetingRoom } from "@/presentation/components";
import { ROUTES } from "@/presentation/constants";
import { VideoOff, ShieldOff, CalendarClock } from "lucide-react";
import { useMeetingLobbyPage } from "./MeetingLobbyPage.logic";

const MeetingLobbyPage = () => {
  const router = useRouter();
  const { view, launch, error, activityId, displayName } = useMeetingLobbyPage();

  const backToActivities = () => router.push(ROUTES.VOLUNTEER.ACTIVITIES);

  if (view === "loading") {
    return (
      <div className={styles.page}>
        <div className={styles.container}>
          <LoadingState />
        </div>
      </div>
    );
  }

  if (view === "notFound") {
    return (
      <div className={styles.page}>
        <div className={styles.container}>
          <EmptyState
            icon={VideoOff}
            message="النشاط غير موجود"
            action={{ label: "العودة للفرص", onClick: backToActivities }}
          />
        </div>
      </div>
    );
  }

  if (view === "empty") {
    return (
      <div className={styles.page}>
        <div className={styles.container}>
          <EmptyState
            icon={CalendarClock}
            message="رابط الاجتماع غير متوفر بعد"
            action={{ label: "العودة للفرص", onClick: backToActivities }}
          />
        </div>
      </div>
    );
  }

  if (view === "error" || !launch) {
    return (
      <div className={styles.page}>
        <div className={styles.container}>
          <EmptyState
            icon={error?.includes("صلاحية") ? ShieldOff : VideoOff}
            message={error || "تعذر فتح هذا الاجتماع حالياً"}
            action={{ label: "العودة للفرص", onClick: backToActivities }}
          />
        </div>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <MeetingRoom
          activityId={activityId}
          displayName={displayName}
          launch={launch}
          onLeave={backToActivities}
        />
      </div>
    </div>
  );
};

export default MeetingLobbyPage;
