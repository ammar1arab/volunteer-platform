"use client";
import styles from "./ActivityCard.module.scss";

import Image from "next/image";
import { useState } from "react";
import { useRouter } from "next/navigation";
import type { ActivityDto } from "@/core/application/dtos";
import { MapPin, Clock, Users, Share2 } from "lucide-react";
import { ROUTES } from "@/presentation/constants";
import { Share, Modal } from "@/presentation/components";

type Props = { activity: ActivityDto; actionButton?: React.ReactNode };

const ActivityCard = ({ activity, actionButton }: Props) => {
  const router = useRouter();
  const [locationModalOpen, setLocationModalOpen] = useState(false);

  const formattedDate = new Date(activity.date).toLocaleDateString("ar-JO", {
    day: "numeric", month: "long", year: "numeric",
  });

  const mapsUrl = `https://www.google.com/maps?q=${activity.location.latitude},${activity.location.longitude}`;
  const shareText = `${activity.title}\n\n${activity.placeName}\n${formattedDate} - ${activity.startTime} – ${activity.endTime}\nالفئة: ${activity.targetAudience}\n\n${typeof window !== "undefined" ? window.location.href : ""}`;


  return (
    <>
      <article className={styles.card} onClick={() => router.push(ROUTES.ACTIVITY_DETAILS(activity.id))}>
        <div className={styles.imageWrapper}>
          <Image src={activity.imageUrl} alt={activity.title} fill
            sizes="(max-width: 768px) 100vw, 50vw" className={styles.img} />
          <div className={styles.scanline} />
          {activity.isFull && <span className={styles.fullBadge}>مكتمل</span>}
        </div>

        <div className={styles.content}>
          <h3 className={styles.title}>{activity.title}</h3>
          <p className={styles.description}>{activity.description}</p>

          <div className={styles.infoRow}>
            <span className={styles.infoChip}><Clock size={12} />{activity.startTime} – {activity.endTime}</span>
            <span className={styles.infoChip}><Users size={12} />{activity.currentVolunteers} / {activity.maxVolunteers}</span>
          </div>

          <div className={styles.placeRow}>
            <MapPin size={13} className={styles.placeIcon} />
            <span className={styles.placeName}>{activity.placeName}</span>
            <span className={styles.date}>{formattedDate}</span>
          </div>

          <div className={styles.actions} onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              className={styles.mapsBtn}
              onClick={(e) => { e.stopPropagation(); setLocationModalOpen(true); }}
              title="خيارات الموقع"
            >
              <MapPin size={16} />
            </button>

            <Share
              trigger={(openShare) => (
                <button className={styles.shareIconBtn}
                  onClick={(e) => { e.stopPropagation(); openShare({ title: activity.title, text: shareText }); }}
                  title="مشاركة">
                  <Share2 size={16} />
                </button>
              )}
            />
            <div className={styles.actionMain}>{actionButton}</div>
          </div>
        </div>
      </article>
      <Modal isOpen={locationModalOpen} onClose={() => setLocationModalOpen(false)} title={activity.placeName} size="sm">
        <div className={styles.locBody}>
          {activity.location.address && <p className={styles.locAddress}>{activity.location.address}</p>}
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
      </Modal >
    </>
  );
};

export default ActivityCard;