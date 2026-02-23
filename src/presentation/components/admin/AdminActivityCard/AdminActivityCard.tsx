"use client";
import styles from "./AdminActivityCard.module.scss";
import Image from "next/image";
import { useState } from "react";
import { ActivityDto } from "@/core/application/dtos";
import { getDayLabel } from "@/presentation/constants/labels";
import { Share, Modal } from "@/presentation/components";
import { Calendar, Clock, MapPin, Users, Target, Share2 } from "lucide-react";

export type AdminActivityCardProps = {
  activity: ActivityDto;
  meta?: React.ReactNode;
  actions?: React.ReactNode;
};

const AdminActivityCard = ({ activity, meta, actions }: AdminActivityCardProps) => {
  const [locationModalOpen, setLocationModalOpen] = useState(false);

  const formattedDate = new Date(activity.date).toLocaleDateString("ar-JO", {
    year: "numeric", month: "long", day: "numeric",
  });

  const mapsUrl = `https://www.google.com/maps?q=${activity.location.latitude},${activity.location.longitude}`;
  const shareText = `${activity.title}\n\n${activity.placeName} - ${activity.location.address}\n${getDayLabel(activity.dayOfWeek)} ${formattedDate}\n${activity.startTime} – ${activity.endTime}\nالفئة: ${activity.targetAudience}\n\n${typeof window !== "undefined" ? window.location.href : ""}`;

  return (
    <>
      <article className={styles.card}>
        <div className={styles.imageWrapper}>
          <Image src={activity.imageUrl} alt={activity.title} fill
            sizes="(max-width: 600px) 100vw, 33vw" className={styles.img} />
          <div className={styles.scanline} />
          {meta && <div className={styles.badge}>{meta}</div>}
          <div className={styles.shareWrapper}>
            <Share
              trigger={(openShare) => (
                <button className={styles.shareBtn}
                  onClick={(e) => { e.stopPropagation(); openShare({ title: activity.title, text: shareText }); }}
                  aria-label="مشاركة">
                  <Share2 size={14} />
                </button>
              )}
            />
          </div>
        </div>

        <div className={styles.body}>
          <h3 className={styles.title}>{activity.title}</h3>
          <p className={styles.description}>{activity.description}</p>

          <div className={styles.grid}>
            <div className={styles.infoItem}>
              <Target size={12} />
              <div className={styles.infoContent}>
                <span className={styles.infoLabel}>الفئة المستهدفة</span>
                <span className={styles.infoValue}>{activity.targetAudience}</span>
              </div>
            </div>
            <div className={styles.infoItem}>
              <Users size={12} />
              <div className={styles.infoContent}>
                <span className={styles.infoLabel}>المتطوعون</span>
                <span className={styles.infoValue}>{activity.currentVolunteers} / {activity.maxVolunteers}</span>
              </div>
            </div>
            <div className={styles.infoItem}>
              <Calendar size={12} />
              <div className={styles.infoContent}>
                <span className={styles.infoLabel}>اليوم والتاريخ</span>
                <span className={styles.infoValue}>{getDayLabel(activity.dayOfWeek)} · {formattedDate}</span>
              </div>
            </div>
            <div className={styles.infoItem}>
              <Clock size={12} />
              <div className={styles.infoContent}>
                <span className={styles.infoLabel}>الوقت</span>
                <span className={styles.infoValue}>{activity.startTime} – {activity.endTime}</span>
              </div>
            </div>
          </div>

          <div className={styles.locationRow}>
            <div className={styles.locationInfo}>
              <span className={styles.placeName}>{activity.placeName}</span>
            </div>
            <button
              type="button"
              className={styles.mapsBtn}
              onClick={(e) => { e.stopPropagation(); setLocationModalOpen(true); }}
              title="خيارات الموقع"
            >
              <MapPin size={13} />
            </button>
          </div>
        </div>

        {actions && <div className={styles.footer}>{actions}</div>}
      </article>

      <Modal isOpen={locationModalOpen} onClose={() => setLocationModalOpen(false)} title={activity.placeName} size="sm">
        <div className={styles.locBody}>
          <div className={styles.locActions}>

            <Share
              trigger={(openShare) => (
                <button
                  type="button"
                  className={styles.locBtnShare}
                  onClick={() => openShare({
                    title: activity.placeName,
                    text: `${activity.placeName}\n${activity.location.address}\n${mapsUrl}`,
                  })}
                >
                  مشاركة الموقع
                </button>
              )}
            />
            <a
              className={styles.locBtnMaps}
              href={mapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => setLocationModalOpen(false)}
            >
              فتح في Google Maps
            </a>

          </div>
        </div>
      </Modal>
    </>
  );
};

export default AdminActivityCard;