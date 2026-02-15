"use client";
import Image from "next/image";
import styles from "./AdminFeaturedPostCard.module.scss";

type AdminFeaturedPostCardProps = {
  imageUrl: string;
  title: string;
  description: string;
  meta?: React.ReactNode;
  actions?: React.ReactNode;
};

const AdminFeaturedPostCard = ({ imageUrl, title, description, meta, actions }: AdminFeaturedPostCardProps) => {
  return (
    <article className={styles.card}>
      <div className={styles.imageWrapper}>
        <Image
          src={imageUrl}
          alt={title}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
        />
      </div>
      <div className={styles.content}>
        <div className={styles.header}>
          <h3 className={styles.title}>{title}</h3>
          {meta && <div className={styles.meta}>{meta}</div>}
        </div>
        <p className={styles.description}>{description}</p>
        {actions && <div className={styles.actions}>{actions}</div>}
      </div>
    </article>
  );
};

export default AdminFeaturedPostCard;