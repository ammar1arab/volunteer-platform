import { Calendar, Clock, MapPin, Award, ExternalLink, Wifi, CheckCircle2, XCircle, Navigation, UserCheck } from "lucide-react";
import styles from "./ActivityItem.module.scss";
import { Badge } from "@/presentation/components";
import {
  getMonthLabel, getParticipationStatusLabel,
  getActivityTypeLabel, getMeetingPlatformLabel, getAttendanceStatusLabel,
  getCityLabel
} from "@/presentation/constants";
import { ActivityType, AttendanceStatus, JordanianCity, MeetingPlatform, ParticipationStatus } from "@/core/domain/enums";

type Props = {
  title: string;
  description: string;
  date: string;
  startTime: string;
  endTime: string;
  status: ParticipationStatus;
  requestedAt: string;
  activityType?: ActivityType;
  activityStatus?: string;
  placeName?: string | null;
  city?: JordanianCity | null | undefined;
  latitude?: number | null;
  longitude?: number | null;
  meetingLink?: string | null;
  meetingPlatform?: MeetingPlatform | null;
  volunteerHours?: number | null;
  attendanceStatus?: AttendanceStatus | null;
  respondedAt?: string | null;
  markedAt?: string | null;
  actionLoading?: boolean;
  onReapply?: () => void;
  onCancel?: () => void;
};

const STATUS_VARIANT: Record<ParticipationStatus, "success" | "danger" | "warning"> = {
  [ParticipationStatus.APPROVED]: "success",
  [ParticipationStatus.REJECTED]: "danger",
  [ParticipationStatus.CANCELLED]: "danger",
  [ParticipationStatus.PENDING]: "warning",
};

const fmt = (d: string) => {
  const dt = new Date(d);
  return `${dt.getDate()} ${getMonthLabel(dt.getMonth() + 1)} ${dt.getFullYear()}`;
};

const canCancel = (status: ParticipationStatus, activityStatus?: string) =>
  (status === ParticipationStatus.PENDING || status === ParticipationStatus.APPROVED) &&
  activityStatus === "PUBLISHED";

const ActivityItem = ({
  title, description, date, startTime, endTime,
  status, activityStatus, requestedAt, respondedAt, markedAt,
  activityType, placeName, city, latitude, longitude,
  meetingLink, meetingPlatform, volunteerHours,
  attendanceStatus, actionLoading, onReapply, onCancel,
}: Props) => {
  const isOnline = activityType === ActivityType.ONLINE;
  const hasMap = !isOnline && latitude && longitude;
  const mapUrl = hasMap ? `https://www.google.com/maps?q=${latitude},${longitude}` : null;
  const platformLabel = meetingPlatform ? getMeetingPlatformLabel(meetingPlatform) : "رابط الاجتماع";
  const typeLabel = activityType ? getActivityTypeLabel(activityType) : null;
  const meetingUrl = meetingLink?.startsWith("http") ? meetingLink : meetingLink ? `https://${meetingLink}` : null;
  const attended = attendanceStatus === AttendanceStatus.ATTENDED;
  const absent = attendanceStatus === AttendanceStatus.ABSENT;
  const attendanceLabel = attendanceStatus ? getAttendanceStatusLabel(attendanceStatus as AttendanceStatus) : null;

  return (
    <div className={styles.item}>

      {/* ── Header ── */}
      <div className={styles.header}>
        <h3 className={styles.title}>{title}</h3>
        <div className={styles.badges}>
          <Badge variant={STATUS_VARIANT[status]}>{getParticipationStatusLabel(status)}</Badge>
          {typeLabel && (
            <span className={isOnline ? styles.typeBadgeOnline : styles.typeBadgeInPerson}>
              {isOnline ? <Wifi size={10} /> : <MapPin size={10} />}
              {typeLabel}
            </span>
          )}
        </div>
      </div>

      <p className={styles.description}>{description}</p>

      {/* ── Details grid ── */}
      <div className={styles.detailsGrid}>
        <div className={styles.detail}><Calendar size={13} /><span>{fmt(date)}</span></div>
        <div className={styles.detail}><Clock size={13} /><span>{startTime} – {endTime}</span></div>

        {isOnline ? (
          meetingPlatform && (
            <div className={styles.detail}><Wifi size={13} /><span>{platformLabel}</span></div>
          )
        ) : (
          <>
            {placeName && <div className={styles.detail}><MapPin size={13} /><span>{placeName}</span></div>}
            {city && <div className={styles.detail}><Navigation size={13} /><span>{getCityLabel(city as JordanianCity)}</span></div>}
          </>
        )}

        {volunteerHours != null && volunteerHours > 0 && (
          <div className={`${styles.detail} ${styles.hoursDetail}`}>
            <Award size={13} /><span>{volunteerHours} ساعة تطوع</span>
          </div>
        )}
      </div>

      {/* ── Attendance chip ── */}
      {(attended || absent) && attendanceLabel && (
        <div className={attended ? styles.attendedChip : styles.absentChip}>
          {attended
            ? <><CheckCircle2 size={13} />{attendanceLabel}{markedAt ? ` · ${fmt(markedAt)}` : ""}</>
            : <><XCircle size={13} />{attendanceLabel}</>
          }
        </div>
      )}

      {/* ── Action links ── */}
      {(isOnline && meetingUrl) || (hasMap && mapUrl) ? (
        <div className={styles.links}>
          {isOnline && meetingUrl && (
            <a href={meetingUrl} target="_blank" rel="noopener noreferrer" className={styles.linkBtn}>
              <Wifi size={12} /><span>{platformLabel}</span><ExternalLink size={11} />
            </a>
          )}
          {hasMap && mapUrl && (
            <a href={mapUrl} target="_blank" rel="noopener noreferrer" className={styles.mapBtn}>
              <MapPin size={12} /><span>عرض على الخريطة</span><ExternalLink size={11} />
            </a>
          )}
        </div>
      ) : null}

      {/* ── Footer ── */}
      <div className={styles.footer}>
        <div className={styles.footerDates}>
          <span className={styles.dateChip}><UserCheck size={11} /> طلب: {fmt(requestedAt)}</span>
          {respondedAt && (
            <span className={styles.dateChip}><CheckCircle2 size={11} /> قُبل: {fmt(respondedAt)}</span>
          )}
        </div>
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
};

export default ActivityItem;