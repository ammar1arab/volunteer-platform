import { Calendar, Clock, MapPin, Award } from "lucide-react";
import styles from "./ActivityItem.module.scss";
import { Badge } from "@/presentation/components";
import { getMonthLabel, getParticipationStatusLabel } from "@/presentation/constants";
import { ParticipationStatus } from "@/core/domain/enums";

type Props = {
  title: string;
  description: string;
  date: string;
  startTime: string;
  endTime: string;
  placeName: string;
  status: ParticipationStatus;
  activityStatus?: string;
  requestedAt: string;
  volunteerHours?: number | null;
  actionLoading?: boolean;
  onReapply?: () => void;
  onCancel?: () => void;
};

const VARIANT: Record<ParticipationStatus, "success" | "danger" | "warning"> = {
  [ParticipationStatus.APPROVED]: "success",
  [ParticipationStatus.REJECTED]: "danger",
  [ParticipationStatus.CANCELLED]: "danger",
  [ParticipationStatus.PENDING]: "warning",
};

const formatDate = (d: string) => {
  const dt = new Date(d);
  return `${dt.getDate()} ${getMonthLabel(dt.getMonth() + 1)} ${dt.getFullYear()}`;
};

const canCancel = (status: ParticipationStatus, activityStatus?: string) =>
  (status === ParticipationStatus.PENDING || status === ParticipationStatus.APPROVED) &&
  activityStatus === "PUBLISHED";

const ActivityItem = ({
  title, description, date, startTime, endTime, placeName,
  status, activityStatus, requestedAt, volunteerHours, actionLoading, onReapply, onCancel,
}: Props) => (
  <div className={styles.item}>
    <div className={styles.header}>
      <h3 className={styles.title}>{title}</h3>
      <Badge variant={VARIANT[status]}>{getParticipationStatusLabel(status)}</Badge>
    </div>

    <p className={styles.description}>{description}</p>

    <div className={styles.details}>
      <div className={styles.detail}><Calendar size={14} /><span>{formatDate(date)}</span></div>
      <div className={styles.detail}><Clock size={14} /><span>{startTime} – {endTime}</span></div>
      <div className={styles.detail}><MapPin size={14} /><span>{placeName}</span></div>
      {volunteerHours != null && volunteerHours > 0 && (
        <div className={styles.detail}><Award size={14} /><span>{volunteerHours} ساعة تطوع</span></div>
      )}
    </div>

    <div className={styles.footer}>
      <span className={styles.requested}>طلب الانضمام: {formatDate(requestedAt)}</span>
      <div className={styles.footerActions}>
        {canCancel(status, activityStatus) && onCancel && (
          <button className={styles.btnCancelRequest} disabled={actionLoading} onClick={onCancel}>
            {actionLoading ? "..." : status === ParticipationStatus.APPROVED ? "إلغاء انضمامي" : "إلغاء الطلب"}
          </button>
        )}
        {(status === ParticipationStatus.REJECTED || status === ParticipationStatus.CANCELLED) && onReapply && (
          <button className={styles.btnReapply} disabled={actionLoading} onClick={onReapply}>
            {actionLoading ? "..." : "انضمام مجدداً"}
          </button>
        )}
      </div>
    </div>
  </div>
);

export default ActivityItem;