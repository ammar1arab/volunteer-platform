"use client";

import styles from "./MeetingLobbyPage.module.scss";
import { useParams, useRouter } from "next/navigation";
import { UserRole } from "@/core/domain/enums";
import { useAuth, useMeetingLaunch } from "@/presentation/hooks";
import { LoadingState, EmptyState, Button } from "@/presentation/components";
import { ROUTES } from "@/presentation/constants";
import { VideoOff, Video, ArrowRight, CalendarDays, Clock3 } from "lucide-react";

const formatDate = (date?: string) => {
  if (!date) return null;
  try {
    return new Date(date).toLocaleDateString("ar-JO", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric"
    });
  } catch {
    return date;
  }
};

const MeetingLobbyPage = () => {
  const params = useParams<{ id: string }>();
  const activityId = params?.id ?? "";
  const router = useRouter();
  const { status } = useAuth({ requireRole: UserRole.VOLUNTEER });
  const { launch, loading, error, isNotFound } = useMeetingLaunch(activityId);

  if (status === "loading" || loading) return <LoadingState />;

  if (isNotFound || error || !launch?.url) {
    return (
      <div className={styles.page}>
        <EmptyState
          icon={VideoOff}
          message={error || "لا يمكنك فتح هذا الاجتماع حالياً"}
          action={{
            label: "العودة للفرص",
            onClick: () => router.push(ROUTES.VOLUNTEER.ACTIVITIES)
          }}
        />
      </div>
    );
  }

  const dateLabel = formatDate(launch.date);
  const timeLabel =
    launch.startTime && launch.endTime ? `${launch.startTime} – ${launch.endTime}` : null;

  return (
    <div className={styles.page}>
      <div className={styles.panel}>
        <div className={styles.iconWrap}>
          <Video size={28} />
        </div>
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
        <p className={styles.subtitle}>
          سيتم فتح Google Meet في نافذة جديدة. تأكد من السماح بالنوافذ المنبثقة إن لزم الأمر.
          الدخول متاح للمشاركين المعتمدين ومقدمي النشاط.
        </p>
        <div className={styles.actions}>
          <Button
            variant="primary"
            size="lg"
            icon={<Video size={18} />}
            onClick={() => window.open(launch.url, "_blank", "noopener,noreferrer")}
          >
            فتح Google Meet
          </Button>
          <button
            type="button"
            className={styles.backBtn}
            onClick={() => router.push(ROUTES.VOLUNTEER.ACTIVITIES)}
          >
            <ArrowRight size={14} />
            العودة للفرص
          </button>
        </div>
      </div>
    </div>
  );
};

export default MeetingLobbyPage;
