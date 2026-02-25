"use client";
import { useVolunteerSpotlightPublicPage } from "./VolunteerSpotlightPublicPage.logic";
import { LoadingState, EmptyState } from "@/presentation/components";
import { VolunteerSpotlightCard } from "@/presentation/components";
import { Star } from "lucide-react";
import styles from "./VolunteerSpotlightPublicPage.module.scss";

const VolunteerSpotlightPublicPage = () => {
  const { spotlights, loading } = useVolunteerSpotlightPublicPage();

  if (loading) return <div className={styles.loadingContainer}><LoadingState /></div>;

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.title}>أبرز المتطوعين</h1>
        <p className={styles.subtitle}>وجوه أضاءت مجتمعها بعطائها وإخلاصها</p>
      </header>
      {spotlights.length === 0 ? (
        <EmptyState icon={Star} title="لا توجد قصص بعد" message="سيتم إضافة أبرز المتطوعين قريباً" />
      ) : (
        <div className={styles.grid}>
          {spotlights.map((s) => <VolunteerSpotlightCard key={s.id} spotlight={s} />)}
        </div>
      )}
    </div>
  );
};

export default VolunteerSpotlightPublicPage;