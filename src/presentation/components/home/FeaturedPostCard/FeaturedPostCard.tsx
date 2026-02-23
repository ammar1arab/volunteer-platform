"use client";
import styles from "./FeaturedPostCard.module.scss";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { ROUTES } from "@/presentation/constants";
import { formatForDisplay } from "@/lib/utils";

type Props = {
  id: string;
  imageUrl: string;
  title: string;
  description: string;
  variant?: "base" | "glass";
};

const FeaturedPostCard = ({ id, imageUrl, title, description, variant = "base" }: Props) => {
  const router = useRouter();
  const handleNavigate = () => router.push(ROUTES.POST_DETAILS(id));

  return (
    <article className={styles.card} data-variant={variant} onClick={handleNavigate}>

      <div className={styles.imageWrapper}>
        <div className={styles.imageInner}>
          <Image src={imageUrl} alt={title} fill sizes="(max-width: 640px) 100vw, 33vw" />
        </div>
      </div>

      <div className={styles.content}>
        <div className={styles.titleGroup}>
          <h3 className={styles.title}>{title}</h3>
          <div className={styles.titleLine} />
        </div>
        <p className={styles.description}>{formatForDisplay(description)}</p>
        <button className={styles.readMore} onClick={(e) => { e.stopPropagation(); handleNavigate(); }}>
          اقرأ المزيد
          <ArrowLeft size={16} />
        </button>
      </div>

    </article>
  );
};

export default FeaturedPostCard;