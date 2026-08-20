"use client";
import styles from "./AdminActivityCard.module.scss";
import Image from "next/image";
import { useState } from "react";
import { ActivityDto } from "@/core/application/dtos";
import { ActivityStatus, ActivityType } from "@/core/domain/enums";
import { getDayLabel, getActivityTypeLabel, getCityLabel, getMonthLabel } from "@/presentation/constants/labels";
import { Share, Modal, MeetingStatusBadge, ActivityPresenterBadge, Button } from "@/presentation/components";
import { Calendar, Clock, MapPin, Users, Share2, ExternalLink, Wifi, MapPinned, Timer } from "lucide-react";
import { MeetingLinkSource, MeetingSyncStatus } from "@/core/domain/enums";
import { ROUTES } from "@/presentation/constants";
import Link from "next/link";
import { formatDate } from "@/lib/utils/date";

export type AdminActivityCardProps = {
  activity: ActivityDto;
  meta?: React.ReactNode;
  actions?: React.ReactNode;
};

const AdminActivityCard = ({ activity, meta, actions }: AdminActivityCardProps) => {
  const [locationModalOpen, setLocationModalOpen] = useState(false);

  const formattedDate = formatDate(activity.date);

  const mapsUrl = activity.latitude && activity.longitude
    ? `https://www.google.com/maps?q=${activity.latitude},${activity.longitude}`
    : null;

  const shareText = `${activity.title}\n\n${activity.placeName ?? ""}\n${getDayLabel(activity.dayOfWeek)} ${formattedDate}\n${activity.startTime} – ${activity.endTime}\n\n${typeof window !== "undefined" ? window.location.href : ""}`;

  const isInPerson = activity.activityType === ActivityType.IN_PERSON;
  const isCompleted = activity.status === ActivityStatus.COMPLETED;
  const isAutoMeet = activity.meetingLinkSource === MeetingLinkSource.GOOGLE_MEET_AUTO;
  const meetStatus = (
    <>
      {isAutoMeet && <MeetingStatusBadge status={activity.meetingSyncStatus} />}
      {activity.meetingSyncStatus === MeetingSyncStatus.FAILED && (
        <Link
          href={ROUTES.ADMIN.GOOGLE_MEET}
          className={styles.meetManageLink}
          onClick={(e) => e.stopPropagation()}
          title="إدارة الاجتماعات"
        >
          إدارة الاجتماع
        </Link>
      )}
    </>
  );

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
            />
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
        </div>

        <div className={styles.body}>
          <div className={styles.header}>
            <h3 className={styles.title}>{activity.title}</h3>
            {activity.primaryPresenterName && (
              <div className={styles.presenter}>
                <ActivityPresenterBadge name={activity.primaryPresenterName} />
              </div>
            )}
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
              <div className={styles.onlineMeta}>
                <a href={activity.meetingLink} target="_blank" rel="noopener noreferrer"
                  className={styles.meetingLink} onClick={(e) => e.stopPropagation()}>
                  <ExternalLink size={11} />
                  <span>رابط الاجتماع</span>
                </a>
                {meetStatus}
              </div>
            ) : isAutoMeet ? (
              <div className={styles.onlineMeta}>
                <div className={styles.locationInfo}>
                  <Wifi size={11} />
                  <span>
                    {activity.meetingSyncStatus === MeetingSyncStatus.FAILED
                      ? "تعذر إنشاء الرابط"
                      : activity.meetingSyncStatus === MeetingSyncStatus.PENDING
                        ? "الرابط قيد الإنشاء"
                        : activity.status === ActivityStatus.DRAFT
                          ? "يُنشأ الرابط عند النشر"
                          : "الرابط قيد الإنشاء"}
                  </span>
                </div>
                {meetStatus}
              </div>
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
                <Button variant="ghost" icon={<Share2 size={16} />} onClick={() => openShare({ title: activity.placeName ?? "", text: `${activity.placeName ?? ""}\n${mapsUrl}` })}>
                  مشاركة
                </Button>
              )}
            />
            <Button variant="primary" icon={<MapPinned size={16} />} onClick={() => {
              window.open(mapsUrl, "_blank", "noopener,noreferrer");
              setLocationModalOpen(false);
            }}>
              خرائط جوجل
            </Button>
          </div>
        </Modal>
      )}
    </>
  );
};

export default AdminActivityCard;