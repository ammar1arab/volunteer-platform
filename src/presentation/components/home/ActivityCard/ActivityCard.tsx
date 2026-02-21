"use client";
import styles from "./ActivityCard.module.scss";
import Image from "next/image";
import { useRouter } from "next/navigation";
import type { ActivityDto } from "@/core/application/dtos";
import { MapPin, Clock, Users, Share2, Send } from "lucide-react";
import { ROUTES } from "@/presentation/constants";
import { Share } from "@/presentation/components";

type ActivityCardProps = {
  activity: ActivityDto;
  actionButton?: React.ReactNode;
};

const ActivityCard = ({ activity, actionButton }: ActivityCardProps) => {
  const router = useRouter();

  const formattedDate = new Date(activity.date).toLocaleDateString("ar-JO", {
    day: "numeric", month: "long", year: "numeric",
  });

  const mapsUrl = `https://www.google.com/maps?q=${activity.location.latitude},${activity.location.longitude}`;

  const shareText = `${activity.title}\n\n ${activity.placeName}\n ${formattedDate}\n  ${activity.startTime} – ${activity.endTime}\n👥 الفئة: ${activity.targetAudience}\n\n🗺️ ${mapsUrl}`;

  return (
    <article className={styles.card} onClick={() => router.push(ROUTES.ACTIVITY_DETAILS(activity.id))}>

      <div className={styles.imageWrapper}>
        <Image src={activity.imageUrl} alt={activity.title} fill
          sizes="(max-width: 768px) 100vw, 50vw" className={styles.img} />
        {activity.isFull && <span className={styles.fullBadge}>مكتمل</span>}
      </div>

      <div className={styles.content}>
        <h3 className={styles.title}>{activity.title}</h3>
        <p className={styles.description}>{activity.description}</p>

        <div className={styles.infoRow}>
          <span className={styles.infoChip}>
            <Clock size={12} />
            {activity.startTime} – {activity.endTime}
          </span>
          <span className={styles.infoChip}>
            <Users size={12} />
            {activity.currentVolunteers} / {activity.maxVolunteers}
          </span>
        </div>

        <div className={styles.placeRow}>
          <MapPin size={13} className={styles.placeIcon} />
          <span className={styles.placeName}>{activity.placeName}</span>
          <span className={styles.date}>{formattedDate}</span>
        </div>

        <div className={styles.actions} onClick={(e) => e.stopPropagation()}>
          <a className={styles.mapsBtn} href={mapsUrl} target="_blank"
            rel="noopener noreferrer" title="فتح الخريطة">
            <MapPin size={16} />
          </a>

          <Share
            trigger={(openShare) => (
              <button className={styles.shareIconBtn}
                onClick={(e) => { e.stopPropagation(); openShare({ title: activity.title, text: shareText }); }}
                title="مشاركة">
                <Share2 size={16} />
              </button>
            )}
          />

          <div className={styles.actionMain}>
            {actionButton}
          </div>
        </div>
      </div>
    </article>
  );
};

export default ActivityCard;