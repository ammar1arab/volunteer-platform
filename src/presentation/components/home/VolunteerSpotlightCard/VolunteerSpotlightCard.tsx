"use client";
import { useRef } from "react";
import styles from "./VolunteerSpotlightCard.module.scss";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { ArrowLeft, Calendar, MapPin } from "lucide-react";
import { ROUTES } from "@/presentation/constants";
import { VolunteerSpotlightDto } from "@/core/application/dtos";
import { getCityLabel } from "@/presentation/constants/labels";

type Props = { spotlight: VolunteerSpotlightDto };

const VolunteerSpotlightCard = ({ spotlight }: Props) => {
  const router = useRouter();
  const cardRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const { left, top } = cardRef.current.getBoundingClientRect();
    cardRef.current.style.setProperty("--x", `${e.clientX - left}px`);
    cardRef.current.style.setProperty("--y", `${e.clientY - top}px`);
  };

  const formattedDate = new Date(spotlight.spotlightDate).toLocaleDateString("ar", {
    year: "numeric", month: "long", day: "numeric",
  });

  return (
    <article 
      ref={cardRef}
      className={styles.card} 
      onMouseMove={handleMouseMove}
      onClick={() => router.push(ROUTES.SPOTLIGHT.DETAILS(spotlight.id))}
    >
      <div className={styles.imageWrapper}>
        <Image 
          src={spotlight.imageUrl} 
          alt={spotlight.name} 
          fill 
          sizes="(max-width: 768px) 100vw, 300px" 
          className={styles.img} 
        />
      </div>

      <div className={styles.content}>
        <div className={styles.nameWrapper}>
          <h3 className={styles.name}>{spotlight.name}</h3>
          <div className={styles.nameUnderline} />
        </div>

        <div className={styles.info}>
          <span className={styles.infoItem}><MapPin size={11} />{getCityLabel(spotlight.city)}</span>
          <span className={styles.infoItem}><Calendar size={11} />{formattedDate}</span>
        </div>

        <p className={styles.bio}>{spotlight.description}</p>

        <div className={styles.cta}>
          <span>تعرّف عليه</span>
          <ArrowLeft size={16} className={styles.arrow} />
        </div>
      </div>
    </article>
  );
};

export default VolunteerSpotlightCard;