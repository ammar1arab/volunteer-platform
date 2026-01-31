import Image from "next/image";
import type { ReactNode } from "react";
import styles from "./ActivityCard.module.scss";

type Props = {
  imageUrl: string;
  title: string;
  description: string;
  meta?: ReactNode;
  actions?: ReactNode;
  variant?: "default" | "featured";
};

const ActivityCard = ({ imageUrl, title, description, meta, actions, variant = "default" }: Props) => {
  return (
    <article className={`${styles.card} ${variant === "featured" ? styles.featured : ""}`}>
      <div className={styles.media}>
        <Image
          src={imageUrl}
          alt={title}
          fill
          className={styles.image}
          sizes="(max-width: 640px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
      </div>
      
      <div className={styles.body}>
        <div className={styles.content}>
          <h3 className={styles.title}>{title}</h3>
          <p className={styles.desc}>{description}</p>
        </div>
        
        {meta && <div className={styles.meta}>{meta}</div>}
        {actions && <div className={styles.actions}>{actions}</div>}
      </div>
    </article>
  );
};

export default ActivityCard;