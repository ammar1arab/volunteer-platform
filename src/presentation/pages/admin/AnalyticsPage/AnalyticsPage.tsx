"use client";

import { useState } from "react";
import type { LucideIcon } from "lucide-react";
import { Activity, Users, Clock, Eye, FileText, Download, UserPlus, Timer, Award } from "lucide-react";
import styles from "./AnalyticsPage.module.scss";
import { formatCount, formatHours, useAnalyticsStats } from "./AnalyticsPage.logic";
import AnalyticsCharts from "./AnalyticsCharts";
import { SharedDataModal, Container } from "@/presentation/components";
import { ANALYTICS_MODAL_CONFIGS, type AnalyticsModalId } from "./AnalyticsModalsConfig";

type MetricTone = "green" | "red" | "black";

type MetricItem = {
  title: string;
  value: string;
  icon: LucideIcon;
  tone: MetricTone;
  modal?: AnalyticsModalId;
};

export default function AnalyticsPage() {
  const { stats, isLoadingStats } = useAnalyticsStats();
  const [activeModal, setActiveModal] = useState<AnalyticsModalId | null>(null);

  const metrics: MetricItem[] = [
    { title: "المستخدمون", value: formatCount(stats?.totalUsers), icon: Users, tone: "black", modal: "users" },
    { title: "الأنشطة", value: formatCount(stats?.totalActivities), icon: Activity, tone: "green", modal: "activities" },
    { title: "مشاهدات الأنشطة", value: formatCount(stats?.activityViews), icon: Eye, tone: "black", modal: "activityViews" },
    { title: "تفاعل المقالات", value: formatCount(stats?.postViews), icon: FileText, tone: "black", modal: "postViews" },
    { title: "تحميلات المجلة", value: formatCount(stats?.magazineDownloads), icon: Download, tone: "green", modal: "magazineDownloads" },
    { title: "طلبات معلقة", value: formatCount(stats?.pendingRequests), icon: Clock, tone: "red", modal: "pending" },
    { title: "متطوعون هذا الشهر", value: formatCount(stats?.newVolunteersThisMonth), icon: UserPlus, tone: "green" },
    { title: "ساعات التطوع", value: formatHours(stats?.totalHours), icon: Timer, tone: "black" },
    { title: "الشهادات", value: formatCount(stats?.certificatesCount), icon: Award, tone: "green" },
  ];

  return (
    <Container flush className={styles.page}>
      <div className={styles.metrics}>
        {metrics.map((item) => {
          const Icon = item.icon;
          const clickable = Boolean(item.modal);
          return (
            <div
              key={item.title}
              className={`${styles.metric} ${styles[item.tone]} ${clickable ? styles.clickable : ""}`}
              role={clickable ? "button" : undefined}
              tabIndex={clickable ? 0 : undefined}
              onClick={item.modal ? () => setActiveModal(item.modal) : undefined}
            >
              <Icon size={18} strokeWidth={1.75} />
              <div>
                <span className={styles.metricValue}>{isLoadingStats ? "—" : item.value}</span>
                <span className={styles.metricLabel}>{item.title}</span>
              </div>
            </div>
          );
        })}
      </div>

      <AnalyticsCharts
        dailySignups={stats?.dailySignups ?? []}
        topCities={stats?.topCities ?? []}
        genderSplit={stats?.genderSplit ?? []}
        loading={isLoadingStats}
      />

      {activeModal === "users" && (
        <SharedDataModal key="users" isOpen onClose={() => setActiveModal(null)} {...ANALYTICS_MODAL_CONFIGS.users} />
      )}
      {activeModal === "activities" && (
        <SharedDataModal key="activities" isOpen onClose={() => setActiveModal(null)} {...ANALYTICS_MODAL_CONFIGS.activities} />
      )}
      {activeModal === "pending" && (
        <SharedDataModal key="pending" isOpen onClose={() => setActiveModal(null)} {...ANALYTICS_MODAL_CONFIGS.pending} />
      )}
      {activeModal === "activityViews" && (
        <SharedDataModal key="activityViews" isOpen onClose={() => setActiveModal(null)} {...ANALYTICS_MODAL_CONFIGS.activityViews} />
      )}
      {activeModal === "postViews" && (
        <SharedDataModal key="postViews" isOpen onClose={() => setActiveModal(null)} {...ANALYTICS_MODAL_CONFIGS.postViews} />
      )}
      {activeModal === "magazineDownloads" && (
        <SharedDataModal key="magazineDownloads" isOpen onClose={() => setActiveModal(null)} {...ANALYTICS_MODAL_CONFIGS.magazineDownloads} />
      )}
    </Container>
  );
}
