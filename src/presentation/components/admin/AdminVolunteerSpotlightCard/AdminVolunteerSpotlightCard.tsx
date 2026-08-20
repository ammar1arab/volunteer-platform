"use client";
import styles from "./AdminVolunteerSpotlightCard.module.scss";
import Image from "next/image";
import { JordanianCity } from "@/core/domain/enums";
import { getCityLabel } from "@/presentation/constants/labels";
import { formatDate } from "@/lib/utils/date";
import { MapPin, Calendar } from "lucide-react";

type Props = {
  imageUrl: string;
  name: string;
  description: string;
  city: JordanianCity;
  spotlightDate: string | Date;
  meta?: React.ReactNode;
  actions?: React.ReactNode;
};

const AdminVolunteerSpotlightCard = ({ imageUrl, name, description, city, spotlightDate, meta, actions }: Props) => {
  const formattedDate = formatDate(spotlightDate);

  return (
    <article className={styles.card}>
      <div className={styles.body}>

        <div className={styles.header}>
          <div className={styles.avatarWrap}>
            <div className={styles.avatar}>
              <Image src={imageUrl} alt={name} fill sizes="80px" className={styles.avatarImg} />
            </div>
            <div className={styles.glow} />
          </div>
          {meta && <div className={styles.meta}>{meta}</div>}
        </div>

        <div className={styles.content}>
          <div className={styles.nameWrapper}>
            <h3 className={styles.name}>{name}</h3>
            <div className={styles.nameUnderline} />
          </div>

          <div className={styles.info}>
            <span className={styles.infoItem}><MapPin size={11} />{getCityLabel(city)}</span>
            <span className={styles.infoItem}><Calendar size={11} />{formattedDate}</span>
          </div>

          <p className={styles.description}>{description}</p>
        </div>
      </div>

      {actions && <div className={styles.actions}>{actions}</div>}
    </article>
  );
};

export default AdminVolunteerSpotlightCard;