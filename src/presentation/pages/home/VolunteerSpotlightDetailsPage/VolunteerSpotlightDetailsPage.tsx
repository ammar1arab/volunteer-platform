"use client";

import styles from "./VolunteerSpotlightDetailsPage.module.scss";
import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import { ArrowRight, MapPin, Calendar } from "lucide-react";
import { getCityLabel, getMonthLabel } from "@/presentation/constants";
import { LoadingState, Button } from "@/presentation/components";
import { useSpotlightDetails } from "@/presentation/hooks";

const VolunteerSpotlightDetailsPage = () => {
  const router = useRouter();
  const { spotlight, loading, error } = useSpotlightDetails(useParams()?.id as string);

  if (loading) return <div className={styles.loadingContainer}><LoadingState /></div>;

  if (error || !spotlight) return (
    <div className={styles.empty}>
      <p>{error || "لم يتم العثور على المتطوع"}</p>
      <Button onClick={() => router.back()}>العودة</Button>
    </div>
  );

  const date = new Date(spotlight.spotlightDate);
  const formattedDate = `${getMonthLabel(date.getMonth() + 1)} ${date.getFullYear()}`;

  return (
    <div className={styles.container}>
      <Button
        variant="ghost"
        size="sm"
        icon={<ArrowRight size={18} />}
        onClick={() => router.back()}
        className={styles.backBtn}
      >
        العودة
      </Button>

      <article className={styles.article}>
        <div className={styles.hero}>
          <Image
            src={spotlight.imageUrl}
            alt={spotlight.name}
            fill
            className={styles.heroImage}
            sizes="(max-width: 600px) 100vw, 800px"
            priority
          />
        </div>

        <div className={styles.content}>
          <header className={styles.header}>
            <h1 className={styles.name}>{spotlight.name}</h1>

            <div className={styles.meta}>
              <span className={styles.infoItem}>
                <MapPin size={14} />
                {getCityLabel(spotlight.city)}
              </span>
              <span className={styles.infoItem}>
                <Calendar size={14} />
                {formattedDate} 
              </span>
            </div>
          </header>

          <p className={styles.description}>{spotlight.description}</p>
        </div>
      </article>
    </div>
  );
};

export default VolunteerSpotlightDetailsPage;