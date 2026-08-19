"use client";

import React from "react";
import { Modal, LoadingState, EmptyState, Badge } from "@/presentation/components";
import { Activity } from "lucide-react";
import { useFetchData } from "@/presentation/hooks";
import { getActivityStatusLabel } from "@/presentation/constants";
import { ActivityStatus } from "@/core/domain/enums";
import styles from "./AnalyticsModals.module.scss";

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

const ActivitiesAnalyticsModal: React.FC<Props> = ({ isOpen, onClose }) => {
  const { data, isLoading } = useFetchData<{ recentActivities: { id: string; title: string; status: ActivityStatus; date: string; }[] }>({
    queryKey: ["admin", "activities", "recent"],
    request: async () => {
      const res = await fetch("/api/activities");
      if (!res.ok) throw new Error("Failed to fetch activities");
      const json = await res.json();
      return { recentActivities: json.data?.activities?.slice(0, 10) || [] };
    },
  });

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="إحصائيات الأنشطة" size="md">
      <div className={styles.container}>
        <h3 className={styles.title}>أحدث الأنشطة</h3>
        {isLoading ? (
          <LoadingState />
        ) : data?.recentActivities.length === 0 ? (
          <EmptyState
            icon={Activity}
            title="لا توجد أنشطة"
            message="لم يتم إنشاء أي أنشطة بعد."
          />
        ) : (
          <div className={styles.list}>
            {data?.recentActivities.map((activity) => (
              <div key={activity.id} className={styles.listItem}>
                <div className={styles.iconWrapper}>
                  <Activity size={20} />
                </div>
                <div className={styles.content}>
                  <div className={styles.primaryText}>{activity.title}</div>
                  <div className={styles.metaText} dir="ltr" style={{ marginTop: "4px" }}>
                    {new Date(activity.date).toLocaleDateString("ar-EG")}
                  </div>
                </div>
                <div>
                  <Badge variant={activity.status === ActivityStatus.PUBLISHED ? "success" : activity.status === ActivityStatus.DRAFT ? "warning" : "danger"}>
                    {getActivityStatusLabel(activity.status)}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Modal>
  );
};

export default ActivitiesAnalyticsModal;
