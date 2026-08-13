"use client";
import { useState } from "react";
import { Calendar, Clock, MapPin, Wifi, CheckCircle2, XCircle, Navigation, ExternalLink, Award } from "lucide-react";
import styles from "./ActivityItem.module.scss";
import { Modal, Share } from "@/presentation/components";
import {
  getMonthLabel, getParticipationStatusLabel,
  getActivityTypeLabel, getMeetingPlatformLabel,
  getAttendanceStatusLabel, getCityLabel,
  getOnlineMeetingJoinState, ROUTES
} from "@/presentation/constants";
import { ActivityType, AttendanceStatus, JordanianCity, MeetingPlatform, ParticipationStatus } from "@/core/domain/enums";
import Link from "next/link";

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
  activityId?: string;
  placeName?: string | null;
  city?: JordanianCity | null;
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

const getAccentVariant = (status: ParticipationStatus, activityStatus?: string): string => {
  if (activityStatus === "COMPLETED" && status === ParticipationStatus.APPROVED) return "blue";
  switch (status) {
    case ParticipationStatus.APPROVED: return "green";
    case ParticipationStatus.PENDING: return "yellow";
    case ParticipationStatus.REJECTED: return "red";
    case ParticipationStatus.CANCELLED: return "violet";
    default: return "muted";
  }
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
  status, activityStatus, activityId, requestedAt, respondedAt, markedAt,
  activityType, placeName, city, latitude, longitude,
  meetingLink, meetingPlatform, volunteerHours,
  attendanceStatus, actionLoading, onReapply, onCancel,
}: Props) => {
  const [locationModalOpen, setLocationModalOpen] = useState(false);

  const isOnline = activityType === ActivityType.ONLINE;
  const hasMap = !isOnline && latitude && longitude;
  const mapUrl = hasMap ? `https://www.google.com/maps?q=${latitude},${longitude}` : null;
  const joinState = getOnlineMeetingJoinState({
    activityType,
    activityStatus,
    participationStatus: status,
    meetingLink
  });
  const platformLabel = meetingPlatform ? getMeetingPlatformLabel(meetingPlatform) : "رابط الاجتماع";
  const attended = attendanceStatus === AttendanceStatus.ATTENDED;
  const absent = attendanceStatus === AttendanceStatus.ABSENT;
  const accent = getAccentVariant(status, activityStatus);

  return (
    <>
      <div className={styles.card}>


        <div className={`${styles.accent} ${styles[accent]}`} />

        <div className={styles.body}>


          <div className={styles.topRow}>
            <div className={styles.chips}>

              <span className={`${styles.statusChip} ${styles[accent]}`}>
                {getParticipationStatusLabel(status)}
              </span>

              {activityType && (
                <span className={isOnline ? styles.typeBadgeOnline : styles.typeBadgeInPerson}>
                  {isOnline ? <Wifi size={10} /> : <MapPin size={10} />}
                  {getActivityTypeLabel(activityType)}
                </span>
              )}

              {attended && (
                <span className={styles.attendedBadge}>
                  <CheckCircle2 size={10} />
                  {getAttendanceStatusLabel(AttendanceStatus.ATTENDED)}
                </span>
              )}
              {absent && (
                <span className={styles.absentBadge}>
                  <XCircle size={10} />
                  {getAttendanceStatusLabel(AttendanceStatus.ABSENT)}
                </span>
              )}
            </div>


            {volunteerHours != null && volunteerHours > 0 && (
              <span className={styles.hoursPill}>
                <Award size={11} />
                {volunteerHours} ساعة
              </span>
            )}
          </div>


          <h3 className={styles.title}>{title}</h3>
          <p className={styles.description}>{description}</p>


          <div className={styles.metaRow}>
            <span className={styles.meta}><Calendar size={12} />{fmt(date)}</span>
            <span className={styles.meta}><Clock size={12} />{startTime} – {endTime}</span>
            {!isOnline && city && (
              <span className={styles.meta}><Navigation size={12} />{getCityLabel(city)}</span>
            )}
            {!isOnline && placeName && (
              <span className={styles.meta}><MapPin size={12} />{placeName}</span>
            )}
            {isOnline && meetingPlatform && (
              <span className={styles.meta}><Wifi size={12} />{platformLabel}</span>
            )}
          </div>


          <div className={styles.actionsRow}>

            <div className={styles.links}>
              {joinState === "join" && activityId && (
                <Link href={ROUTES.VOLUNTEER.MEETING_LOBBY(activityId)} className={styles.linkBtn}>
                  <Wifi size={12} />
                  انضم للاجتماع
                  <ExternalLink size={11} />
                </Link>
              )}
              {joinState === "pending" && (
                <span className={styles.linkPending}>الرابط قيد الإنشاء</span>
              )}
              {hasMap && mapUrl && (
                <button type="button" className={styles.mapBtn} onClick={() => setLocationModalOpen(true)}>
                  <MapPin size={12} />
                  الموقع
                </button>
              )}
            </div>


            <div className={styles.btnGroup}>
              {canCancel(status, activityStatus) && onCancel && (
                <button className={styles.btnCancel} disabled={actionLoading} onClick={onCancel}>
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


          <div className={styles.footerDates}>
            <span>طلب: {fmt(requestedAt)}</span>
            {respondedAt && <span>استجابة: {fmt(respondedAt)}</span>}
            {markedAt && attended && <span>حضور: {fmt(markedAt)}</span>}
          </div>

        </div>
        <div className={`${styles.accent} ${styles[accent]}`} />

      </div>


      {hasMap && mapUrl && (
        <Modal isOpen={locationModalOpen} onClose={() => setLocationModalOpen(false)} title={placeName ?? "الموقع"} size="sm">
          <div className={styles.locActions}>
            <Share
              trigger={(openShare) => (
                <button type="button" className={styles.locBtnShare}
                  onClick={() => openShare({ title: placeName ?? "الموقع", text: `${placeName ?? ""}\n${mapUrl}` })}>
                  مشاركة الموقع
                </button>
              )}
            />
            <a className={styles.locBtnMaps} href={mapUrl} target="_blank" rel="noopener noreferrer"
              onClick={() => setLocationModalOpen(false)}>
              فتح في Google Maps
            </a>
          </div>
        </Modal>
      )}
    </>
  );
};

export default ActivityItem;