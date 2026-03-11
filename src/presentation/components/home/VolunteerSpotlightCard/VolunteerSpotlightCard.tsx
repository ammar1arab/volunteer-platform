"use client";
import { useRef } from "react";
import styles from "./VolunteerSpotlightCard.module.scss";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { ArrowLeft, Calendar, MapPin } from "lucide-react";
import { ROUTES } from "@/presentation/constants";
import { VolunteerSpotlightDto } from "@/core/application/dtos";
import { getCityLabel, getMonthLabel } from "@/presentation/constants/labels";

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

  const date = new Date(spotlight.spotlightDate);
  const month = getMonthLabel(date.getMonth() + 1);
  const year = date.getFullYear();
  const formattedDate = `${month} ${year}`;

  return (
    <article ref={cardRef} className={styles.card} onMouseMove={handleMouseMove}
      onClick={() => router.push(ROUTES.SPOTLIGHT.DETAILS(spotlight.id))}>

      <div className={styles.body}>
        <div className={styles.avatarWrap}>
          <div className={styles.avatar}>
            <Image src={spotlight.imageUrl} alt={spotlight.name} fill sizes="80px" className={styles.avatarImg} />
          </div>
          <div className={styles.glow} />
        </div>

        <div className={styles.content}>
          <div className={styles.nameWrapper}>
            <h3 className={styles.name}>{spotlight.name}</h3>
            <div className={styles.nameUnderline} />
          </div>

          <div className={styles.info}>
            <span className={styles.infoItem}><MapPin size={11} />{getCityLabel(spotlight.city)}</span>
            <span className={styles.infoItem}>
              <Calendar size={11} />
              {formattedDate}
            </span>
          </div>


          <div className={styles.cta}>
            <span>تعرّف عليه</span>
            <ArrowLeft size={14} className={styles.arrow} />
          </div>
        </div>
      </div>

      <div className={styles.shimmer} />
    </article>
  );
};

export default VolunteerSpotlightCard;