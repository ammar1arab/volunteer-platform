"use client";
import styles from "./ActivityCard.module.scss";

import Image from "next/image";
import { useRouter } from "next/navigation";

import type { ActivityDto } from "@/core/application/dtos";
import { MapPin, Calendar, Clock, Users, ArrowLeft } from "lucide-react";
import { formatForDisplay } from "@/lib/utils";
import { ROUTES } from "@/presentation/constants";

type ActivityCardProps = {
  activity: ActivityDto;
  actionButton?: React.ReactNode;
};

const ActivityCard = ({ activity, actionButton }: ActivityCardProps) => {
  const router = useRouter();

  const handleNavigate = () => {
    router.push(ROUTES.ACTIVITY_DETAILS(activity.id));
  };

  return (
    <article className={styles.card} onClick={handleNavigate}>
      <div className={styles.imageWrapper}>
        <Image
          src={activity.imageUrl}
          alt={activity.title}
          fill
          sizes="(max-width: 768px) 100vw, 50vw"
        />
        {activity.isFull && <span className={styles.badge}>مكتمل</span>}
      </div>

      <div className={styles.content}>
        <h3 className={styles.title}>{activity.title}</h3>
        <p className={styles.description}>{formatForDisplay(activity.description)}</p>

        <div className={styles.meta}>
          <span className={styles.metaItem}>
            <MapPin size={14} />
            {activity.placeName}
          </span>
          <span className={styles.metaItem}>
            <Calendar size={14} />
            {new Date(activity.date).toLocaleDateString("ar-JO", { day: "numeric", month: "short" })}
          </span>
          <span className={styles.metaItem}>
            <Clock size={14} />
            {activity.startTime}
          </span>
          <span className={styles.metaItem}>
            <Users size={14} />
            {activity.currentVolunteers}/{activity.maxVolunteers}
          </span>
        </div>

        <div className={styles.footer} onClick={(e) => e.stopPropagation()}>
          <button className={styles.readMore} onClick={handleNavigate}>
            اقرأ المزيد
            <ArrowLeft size={16} />
          </button>
          {actionButton}
        </div>
      </div>
    </article>
  );
};

export default ActivityCard;