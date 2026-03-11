"use client";
import styles from "./ActivityCarousel.module.scss";
import { ActivityCard, Button, SectionHeader } from "@/presentation/components";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useActivityCarousel } from "./useActivityCarousel";

interface ActivityCarouselProps {
  activities: any[];
  getActionButton: (activity: any) => {
    variant: any;
    disabled: boolean;
    label: string;
    onClick?: () => void | Promise<void>;
  };
  submitting: boolean;
  onViewAll: () => void;
}

const ActivityCarousel = ({ activities, getActionButton, submitting, onViewAll }: ActivityCarouselProps) => {
  const { emblaRef, selectedIndex, scrollSnaps, canScrollPrev, canScrollNext, scrollPrev, scrollNext, scrollTo } =
    useActivityCarousel();

  return (
    <div className={styles.carouselRoot}>
      <div className={styles.carouselHeader}>
        <SectionHeader
          title="كن جزءاً من التغيير"
          subtitle="مبادرات تطوعية قائمة تنتظر شغفك ومهاراتك لتصنع الفرق"
        />
      </div>

      <div className={styles.carouselWrapper}>
        <button
          className={`${styles.arrowBtn} ${styles.arrowRight}`}
          onClick={scrollPrev}
          disabled={!canScrollPrev}
          aria-label="السابق"
        >
          <ChevronRight size={20} />
        </button>

        <div className={styles.viewport} ref={emblaRef}>
          <ul className={styles.carouselTrack}>
            {activities.map((activity: any) => {
              const action = getActionButton(activity);
              return (
                <li key={activity.id} className={styles.carouselItem}>
                  <ActivityCard
                    activity={activity}
                    actionButton={
                      <Button
                        variant={action.variant}
                        size="sm"
                        disabled={action.disabled}
                        loading={submitting && !action.disabled}
                        onClick={action.onClick}
                      >
                        {action.label}
                      </Button>
                    }
                  />
                </li>
              );
            })}
          </ul>
        </div>

        <button
          className={`${styles.arrowBtn} ${styles.arrowLeft}`}
          onClick={scrollNext}
          disabled={!canScrollNext}
          aria-label="التالي"
        >
          <ChevronLeft size={20} />
        </button>
      </div>

      {scrollSnaps.length > 1 && (
        <div className={styles.dots} role="tablist">
          {scrollSnaps.map((_, i) => (
            <button
              key={i}
              role="tab"
              aria-selected={i === selectedIndex}
              className={`${styles.dot} ${i === selectedIndex ? styles.dotActive : ""}`}
              onClick={() => scrollTo(i)}
              aria-label={`${i + 1}`}
            />
          ))}
        </div>
      )}

      <div className={styles.carouselFooter}>
        <Button variant="primary" size="md" onClick={onViewAll}>
          استكشف كافة الفرص
        </Button>
      </div>
    </div>
  );
};

export default ActivityCarousel;