"use client";

import styles from "./AdminActivityCard.module.scss";
import Image from "next/image";

export type AdminActivityCardProps = {
  imageUrl: string;
  title: string;
  description: string;
  meta?: React.ReactNode;
  actions?: React.ReactNode;
};

const AdminActivityCard = ({ imageUrl, title, description, meta, actions }: AdminActivityCardProps) => {
  return (
    <article className={styles.card}>
      <div className={styles.image}>
        <Image src={imageUrl} alt={title} fill sizes="(max-width: 600px) 100vw, 33vw" />
      </div>

      <div className={styles.body}>
        <div className={styles.header}>
          <h3 className={styles.title}>{title}</h3>
          {meta && <div className={styles.meta}>{meta}</div>}
        </div>

        <p className={styles.desc}>{description}</p>

        {actions && <div className={styles.actions}>{actions}</div>}
      </div>
    </article>
  );
};

export default AdminActivityCard;