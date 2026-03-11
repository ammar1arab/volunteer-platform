"use client";
import styles from "./ActivityCard.module.scss";
import Image from "next/image";
import { useState } from "react";
import { useRouter } from "next/navigation";
import type { ActivityDto } from "@/core/application/dtos";
import { ActivityType } from "@/core/domain/enums";
import { getMonthLabel, getActivityTypeLabel, getCityLabel, ROUTES } from "@/presentation/constants";
import { Share, Modal } from "@/presentation/components";
import { MapPin, Clock, Users, Share2, ExternalLink, Wifi, MapPinned, Timer, Calendar } from "lucide-react";

type Props = { activity: ActivityDto; actionButton?: React.ReactNode };

const ActivityCard = ({ activity, actionButton }: Props) => {
  const router = useRouter();
  const [locationModalOpen, setLocationModalOpen] = useState(false);

  const date = new Date(activity.date);
  const formattedDate = `${date.getDate()} ${getMonthLabel(date.getMonth() + 1)} ${date.getFullYear()}`;

  const mapsUrl = activity.latitude && activity.longitude
    ? `https://www.google.com/maps?q=${activity.latitude},${activity.longitude}`
    : null;

  const shareText = `${activity.title}\n\n${activity.placeName ?? getActivityTypeLabel(activity.activityType)}\n${formattedDate} · ${activity.startTime} – ${activity.endTime}\n\n${typeof window !== "undefined" ? window.location.href : ""}`;

  const isInPerson = activity.activityType === ActivityType.IN_PERSON;

  return (
    <>
      <article className={styles.card} onClick={() => router.push(ROUTES.ACTIVITY_DETAILS(activity.id))}>

        <div className={styles.imageCol}>
          <div className={styles.imageInner}>
            <Image src={activity.imageUrl} alt={activity.title} fill sizes="(max-width: 768px) 100vw, 220px" />
            <div className={styles.scanline} />
            {activity.isFull && <span className={styles.fullBadge}>مكتمل</span>}
          </div>
          <div className={styles.imageFooter}>
            <div className={`${styles.typeChip} ${isInPerson ? styles.inPerson : styles.online}`}>
              {isInPerson ? <MapPinned size={9} /> : <Wifi size={9} />}
              {getActivityTypeLabel(activity.activityType)}
            </div>
            <Share
              trigger={(openShare) => (
                <button className={styles.shareBtn}
                  onClick={(e) => { e.stopPropagation(); openShare({ title: activity.title, text: shareText }); }}
                  aria-label="مشاركة">
                  <Share2 size={12} />
                </button>
              )}
            />
          </div>
        </div>

        {/* ── Body ── */}
        <div className={styles.body}>
          <div className={styles.header}>
            <h3 className={styles.title}>{activity.title}</h3>
            <p className={styles.description}>{activity.description}</p>
          </div>

          <div className={styles.metaGrid}>
            <div className={styles.metaItem}>
              <div className={styles.metaIcon}><Calendar size={11} /></div>
              <div className={styles.metaContent}>
                <span className={styles.metaLabel}>التاريخ</span>
                <span className={styles.metaValue}>{formattedDate}</span>
              </div>
            </div>
            <div className={styles.metaItem}>
              <div className={styles.metaIcon}><Clock size={11} /></div>
              <div className={styles.metaContent}>
                <span className={styles.metaLabel}>الوقت</span>
                <span className={styles.metaValue}>{activity.startTime} – {activity.endTime}</span>
              </div>
            </div>
            <div className={styles.metaItem}>
              <div className={styles.metaIcon}><Users size={11} /></div>
              <div className={styles.metaContent}>
                <span className={styles.metaLabel}>المتطوعون</span>
                <span className={styles.metaValue}>
                  <span className={styles.accent}>{activity.currentVolunteers}</span>
                  <span className={styles.slash}> / </span>
                  {activity.maxVolunteers}
                </span>
              </div>
            </div>
            <div className={styles.metaItem}>
              <div className={styles.metaIcon}><Timer size={11} /></div>
              <div className={styles.metaContent}>
                <span className={styles.metaLabel}>عدد الساعات</span>
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
                <ExternalLink size={11} /><span>رابط الاجتماع</span>
              </a>
            ) : (
              <div className={styles.locationInfo}><Wifi size={11} /><span>إلكتروني</span></div>
            )}
            {isInPerson && mapsUrl && (
              <button type="button" className={styles.mapsBtn}
                onClick={(e) => { e.stopPropagation(); setLocationModalOpen(true); }}>
                <MapPin size={11} />
              </button>
            )}
          </div>

          {actionButton && (
            <div className={styles.actions} onClick={(e) => e.stopPropagation()}>
              {actionButton}
            </div>
          )}
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

export default ActivityCard;