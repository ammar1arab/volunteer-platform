"use client";
import { useParams, useRouter } from "next/navigation";
import { useSpotlightDetails } from "@/presentation/hooks";
import { LoadingState } from "@/presentation/components";
import Image from "next/image";
import { ArrowRight, MapPin, Calendar } from "lucide-react";
import { getCityLabel } from "@/presentation/constants/labels";
import styles from "./VolunteerSpotlightDetailsPage.module.scss";

const VolunteerSpotlightDetailsPage = () => {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { spotlight, loading, error } = useSpotlightDetails(id);

  if (loading) return <div className={styles.loadingContainer}><LoadingState /></div>;
  if (!spotlight) return (
    <div className={styles.loadingContainer}>
      <p className={styles.errorText}>{error || "لم يتم العثور على المتطوع"}</p>
    </div>
  );

  const formattedDate = new Date(spotlight.spotlightDate).toLocaleDateString("ar", {
    year: "numeric", month: "long", day: "numeric",
  });

  return (
    <div className={styles.container}>
      <button className={styles.back} onClick={() => router.back()}>
        <ArrowRight size={16} /> العودة
      </button>
      <div className={styles.imageWrapper}>
        <Image src={spotlight.imageUrl} alt={spotlight.name} fill
          sizes="(max-width: 768px) 100vw, 800px" style={{ objectFit: "cover" }} />
      </div>
      <div className={styles.body}>
        <h1 className={styles.name}>{spotlight.name}</h1>
        <div className={styles.info}>
          <span className={styles.infoItem}><MapPin size={13} />{getCityLabel(spotlight.city)}</span>
          <span className={styles.infoItem}><Calendar size={13} />{formattedDate}</span>
        </div>
        <p className={styles.description}>{spotlight.description}</p>
      </div>
    </div>
  );
};

export default VolunteerSpotlightDetailsPage;