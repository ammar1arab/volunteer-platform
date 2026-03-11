"use client";
import styles from "./VolunteerSpotlightPublicPage.module.scss";
import { useVolunteerSpotlightPublicPage } from "./VolunteerSpotlightPublicPage.logic";
import { LoadingState, EmptyState, VolunteerSpotlightCard, Search, Dropdown } from "@/presentation/components";
import { Star } from "lucide-react";

const VolunteerSpotlightPublicPage = () => {
  const {
    spotlights, loading,
    searchQuery, setSearchQuery, setAppliedSearch,
    activeCity, setActiveCity, cityOptions,
  } = useVolunteerSpotlightPublicPage();

  if (loading) return <div className={styles.loadingContainer}><LoadingState /></div>;

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.title}>أبرز المتطوعين</h1>
        <p className={styles.subtitle}>وجوه أضاءت مجتمعها بعطائها وإخلاصها</p>
      </header>

      <div className={styles.toolbar}>
        <Search
          value={searchQuery}
          onChange={setSearchQuery}
          onSearch={setAppliedSearch}
          placeholder="ابحث عن متطوع..."
        />
        <Dropdown
          items={cityOptions}
          active={activeCity}
          onChange={setActiveCity}
          placeholder="المدينة"
          compact
        />
      </div>

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