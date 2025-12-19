import Image from "next/image";
import styles from "./FeaturedPostCard.module.scss";
import type { FeaturedPostCardProps } from "@/lib";

const FeaturedPostCard: React.FC<FeaturedPostCardProps> = ({ imageUrl, title, description, meta, actions, variant = "base", }) => {
  return (
    <article className={styles.card} data-variant={variant}>
      <div className={styles.image}>
        <Image src={imageUrl} alt={title} fill sizes="(max-width: 600px) 100vw, (max-width: 900px) 50vw, 33vw" />
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

export default FeaturedPostCard;