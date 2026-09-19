"use client";

import { useState } from "react";
import styles from "./AnalyticsPage.module.scss";
import { useAnalyticsStats } from "./AnalyticsPage.logic";
import { StatsCard, SharedDataModal, Container } from "@/presentation/components";
import { ANALYTICS_MODAL_CONFIGS, type AnalyticsModalId } from "./AnalyticsModalsConfig";
import { Activity, Users, Clock, Eye, FileText, Download } from "lucide-react";

export default function AnalyticsPage() {
  const { stats, isLoadingStats } = useAnalyticsStats();
  const [activeModal, setActiveModal] = useState<AnalyticsModalId | null>(null);

  const statItems = [
    { id: "users" as const, title: "إجمالي المستخدمين", value: stats?.totalUsers, icon: Users, variant: "primary" as const },
    { id: "activities" as const, title: "الأنشطة التطوعية", value: stats?.totalActivities, icon: Activity, variant: "success" as const },
    { id: "activityViews" as const, title: "مشاهدات الأنشطة", value: stats?.activityViews, icon: Eye, variant: "teal" as const },
    { id: "postViews" as const, title: "تفاعل المقالات", value: stats?.postViews, icon: FileText, variant: "warning" as const },
    { id: "magazineDownloads" as const, title: "تحميلات المجلة", value: stats?.magazineDownloads, icon: Download, variant: "violet" as const },
    { id: "pending" as const, title: "الطلبات المعلقة", value: stats?.pendingRequests, icon: Clock, variant: "orange" as const },
  ];

  return (
    <Container flush className={styles.page}>
      <div className={styles.statsGrid}>
        {statItems.map((item) => (
          <StatsCard
            key={item.id}
            title={item.title}
            value={item.value ?? "-"}
            icon={item.icon}
            variant={item.variant}
            loading={isLoadingStats}
            onClick={() => setActiveModal(item.id)}
          />
        ))}
      </div>

      {activeModal && (
        <SharedDataModal
          key={activeModal}
          isOpen
          onClose={() => setActiveModal(null)}
          {...ANALYTICS_MODAL_CONFIGS[activeModal]}
        />
      )}
    </Container>
  );
}
