"use client";
import styles from "./ActivitiesPublicPage.module.scss";
import { useActivitiesPublicPage } from "./ActivitiesPublicPage.logic";
import { CalendarX } from "lucide-react";
import { ActivityCard, LoadingState, Button, EmptyState } from "@/presentation/components";

const ActivitiesPublicPage = () => {
  const { activities, loading, submitting, getActionButton } = useActivitiesPublicPage();

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <LoadingState />
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.title}>بادر الآن</h1>
        <p className={styles.subtitle}>جميع المسارات التطوعية المتاحة.. اختر ما يشبه طموحك وابدأ رحلتك معنا</p>
      </header>

      {activities.length === 0 ? (
        <EmptyState
          icon={CalendarX}
          title="لا توجد فرص متاحة"
          message="لا توجد فرص تطوعية متاحة حالياً، تابعنا لاحقاً"
        />
      ) : (
        <div className={styles.grid}>
          {activities.map((activity) => {
            const action = getActionButton(activity);
            return (
              <ActivityCard
                key={activity.id}
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
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ActivitiesPublicPage;