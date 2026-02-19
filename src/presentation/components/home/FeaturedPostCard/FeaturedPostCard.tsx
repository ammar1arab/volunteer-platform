"use client";
import styles from "./FeaturedPostCard.module.scss";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { ROUTES } from "@/presentation/constants";
import { formatForDisplay } from "@/lib/utils";

type FeaturedPostCardProps = {
  id: string;
  imageUrl: string;
  title: string;
  description: string;
  variant?: "base" | "glass";
};

const FeaturedPostCard = ({
  id,
  imageUrl,
  title,
  description,
  variant = "base",
}: FeaturedPostCardProps) => {
  const router = useRouter();

  const handleNavigate = () => {
    router.push(ROUTES.POST_DETAILS(id));
  };

  return (
    <article className={styles.card} data-variant={variant} onClick={handleNavigate}>
      <div className={styles.imageWrapper}>
        <Image
          src={imageUrl}
          alt={title}
          fill
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
        />
      </div>

      <div className={styles.content}>
        <h3 className={styles.title}>{title}</h3>
        <p className={styles.description}>{formatForDisplay(description)}</p>

        <button
          className={styles.readMore}
          onClick={(e) => {
            e.stopPropagation();
            handleNavigate();
          }}
        >
          اقرأ المزيد
          <ArrowLeft size={16} />
        </button>
      </div>
    </article>
  );
};

export default FeaturedPostCard;