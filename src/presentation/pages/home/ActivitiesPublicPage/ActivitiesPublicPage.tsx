"use client";
import styles from "./ActivitiesPublicPage.module.scss";
import { useActivitiesPublicPage } from "./ActivitiesPublicPage.logic";

import { ActivityCard, LoadingState, Button } from "@/presentation/components";

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
        <div className={styles.empty}>
          <p>لا توجد فرص متاحة حالياً</p>
        </div>
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