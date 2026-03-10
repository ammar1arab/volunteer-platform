"use client";
import styles from "./AdminActivityCard.module.scss";
import Image from "next/image";
import { useState } from "react";
import { ActivityDto } from "@/core/application/dtos";
import { ActivityStatus, ActivityType } from "@/core/domain/enums";
import { getDayLabel, getActivityTypeLabel, getCityLabel, getMonthLabel } from "@/presentation/constants/labels";
import { Share, Modal } from "@/presentation/components";
import { Calendar, Clock, MapPin, Users, Share2, ExternalLink, Wifi, MapPinned, Timer } from "lucide-react";

export type AdminActivityCardProps = {
  activity: ActivityDto;
  meta?: React.ReactNode;
  actions?: React.ReactNode;
};

const AdminActivityCard = ({ activity, meta, actions }: AdminActivityCardProps) => {
  const [locationModalOpen, setLocationModalOpen] = useState(false);

  const date = new Date(activity.date);
  const formattedDate = `${date.getDate()} ${getMonthLabel(date.getMonth() + 1)} ${date.getFullYear()}`;

  const mapsUrl = activity.latitude && activity.longitude
    ? `https://www.google.com/maps?q=${activity.latitude},${activity.longitude}`
    : null;

  const shareText = `${activity.title}\n\n${activity.placeName ?? ""}\n${getDayLabel(activity.dayOfWeek)} ${formattedDate}\n${activity.startTime} – ${activity.endTime}\n\n${typeof window !== "undefined" ? window.location.href : ""}`;

  const isInPerson = activity.activityType === ActivityType.IN_PERSON;
  const isCompleted = activity.status === ActivityStatus.COMPLETED;

  return (
    <>
      <article className={`${styles.card} ${isCompleted ? styles.completed : ""}`}>

        <div className={styles.imageCol}>
          <div className={styles.imageWrapper}>
            <Image
              src={activity.imageUrl}
              alt={activity.title}
              fill
              sizes="(max-width: 768px) 100vw, 280px"
              className={styles.img}
            />
          </div>
          <div className={`${styles.typeChip} ${isInPerson ? styles.inPerson : styles.online}`}>
            {isInPerson ? <MapPinned size={10} /> : <Wifi size={10} />}
            <span>{getActivityTypeLabel(activity.activityType)}</span>
          </div>
          {meta && <div className={styles.badge}>{meta}</div>}
          <Share
            trigger={(openShare) => (
              <button
                className={styles.shareBtn}
                onClick={(e) => { e.stopPropagation(); openShare({ title: activity.title, text: shareText }); }}
                aria-label="مشاركة"
              >
                <Share2 size={13} />
              </button>
            )}
          />
        </div>

        <div className={styles.body}>
          <div className={styles.header}>
            <h3 className={styles.title}>{activity.title}</h3>
            <p className={styles.description}>{activity.description}</p>
          </div>

          <div className={styles.metaGrid}>
            <div className={styles.metaItem}>
              <div className={styles.metaIcon}><Users size={12} /></div>
              <div className={styles.metaContent}>
                <span className={styles.metaLabel}>المتطوعون</span>
                <span className={styles.metaValue}>
                  <span className={styles.accent}>{activity.currentVolunteers}</span>
                  <span className={styles.slash}>/</span>
                  {activity.maxVolunteers}
                </span>
              </div>
            </div>

            <div className={styles.metaItem}>
              <div className={styles.metaIcon}><Calendar size={12} /></div>
              <div className={styles.metaContent}>
                <span className={styles.metaLabel}>التاريخ</span>
                <span className={styles.metaValue}>{getDayLabel(activity.dayOfWeek)} · {formattedDate}</span>
              </div>
            </div>

            <div className={styles.metaItem}>
              <div className={styles.metaIcon}><Clock size={12} /></div>
              <div className={styles.metaContent}>
                <span className={styles.metaLabel}>الوقت</span>
                <span className={styles.metaValue}>{activity.startTime} – {activity.endTime}</span>
              </div>
            </div>

            <div className={styles.metaItem}>
              <div className={styles.metaIcon}><Timer size={12} /></div>
              <div className={styles.metaContent}>
                <span className={styles.metaLabel}>المدة</span>
                <span className={styles.metaValue}>{activity.durationHours} ساعة</span>
              </div>
            </div>
          </div>

          <div className={styles.locationRow}>
            {isInPerson ? (
              <div className={styles.locationInfo}>
                <MapPin size={11} />
                <span>{activity.placeName ?? "—"}{activity.city ? ` · ${getCityLabel(activity.city)}` : ""}</span>
              </div>
            ) : activity.meetingLink ? (
              <a href={activity.meetingLink} target="_blank" rel="noopener noreferrer"
                className={styles.meetingLink} onClick={(e) => e.stopPropagation()}>
                <ExternalLink size={11} />
                <span>رابط الاجتماع</span>
              </a>
            ) : (
              <div className={styles.locationInfo}>
                <Wifi size={11} />
                <span>إلكتروني — لا يوجد رابط</span>
              </div>
            )}

            {isInPerson && mapsUrl && (
              <button
                type="button"
                className={styles.mapsBtn}
                onClick={(e) => { e.stopPropagation(); setLocationModalOpen(true); }}
              >
                <MapPin size={11} />
                <span>الخريطة</span>
              </button>
            )}
          </div>

          {actions && <div className={styles.actions}>{actions}</div>}
        </div>
      </article>

      {mapsUrl && (
        <Modal isOpen={locationModalOpen} onClose={() => setLocationModalOpen(false)}
          title={activity.placeName ?? ""} size="sm">
          <div className={styles.locActions}>
            <Share
              trigger={(openShare) => (
                <button type="button" className={styles.locBtnShare}
                  onClick={() => openShare({ title: activity.placeName ?? "", text: `${activity.placeName ?? ""}\n${mapsUrl}` })}>
                  مشاركة الموقع
                </button>
              )}
            />
            <a className={styles.locBtnMaps} href={mapsUrl} target="_blank"
              rel="noopener noreferrer" onClick={() => setLocationModalOpen(false)}>
              فتح في Google Maps
            </a>
          </div>
        </Modal>
      )}
    </>
  );
};

export default AdminActivityCard;