"use client";

import Image from "next/image";
import styles from "./AdminFeaturedPostCard.module.scss";
import { Sparkles, Globe, ExternalLink, ShieldCheck } from "lucide-react";
import { ROUTES } from "@/presentation/constants";
import { formatDate } from "@/lib/utils/date";

type AdminFeaturedPostCardProps = {
  imageUrl: string;
  title: string;
  description: string;
  publishedAt?: string;
  meta?: React.ReactNode;
  actions?: React.ReactNode;
};

const AdminFeaturedPostCard = ({ imageUrl, title, description, publishedAt, meta, actions }: AdminFeaturedPostCardProps) => {
  const dateLabel = publishedAt ? formatDate(publishedAt) : "غير متاح";

  return (
    <article className={styles.card}>
      <div className={styles.imageWrapper}>
        <div className={styles.imageInner}>
          <Image
            src={imageUrl}
            alt={title}
            fill
            sizes="(max-width: 640px) 100vw, 33vw"
            loading="eager" priority
          />
        </div>
      </div>

      <div className={styles.content}>
        <div className={styles.header}>
          <div className={styles.titleGroup}>
            <h3 className={styles.title}>{title}</h3>
            <div className={styles.titleLine} />
          </div>
          <Sparkles size={20} className={styles.iconMain} />
        </div>

        <p className={styles.description}>{description}</p>

        <div className={styles.footer}>
          <div className={styles.status}>
            <div className={styles.pulse} />
            {meta || "Live Status"}
          </div>

          {dateLabel && <span className={styles.date}>{dateLabel}</span>}


          <div className={styles.actions}>
            {actions || (
              <>
                <Globe size={16} />
                <ShieldCheck size={16} />
                <ExternalLink size={16} />
              </>
            )}
          </div>
        </div>
      </div>
    </article>
  );
};

export default AdminFeaturedPostCard;