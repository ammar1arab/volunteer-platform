"use client";

import { useState } from "react";
import type { ReportRange } from "@/presentation/types/reports";
import { Container, EmptyState } from "@/presentation/components";
import { WifiOff } from "lucide-react";
import { COPY } from "./AnalyticsCopy";
import { buildPulse, buildTotals, heroSummary, useAnalyticsStats } from "./AnalyticsPage.logic";
import AnalyticsHero from "./AnalyticsHero";
import AnalyticsPulse from "./AnalyticsPulse";
import AnalyticsCharts from "./AnalyticsCharts";
import styles from "./AnalyticsPage.module.scss";

export default function AnalyticsPage() {
  const [range, setRange] = useState<ReportRange>("30d");
  const { stats, isLoadingStats, statsError, refetchStats } = useAnalyticsStats(range);

  if (statsError && !stats) {
    return (
      <Container flush className={styles.page}>
        <EmptyState
          icon={WifiOff}
          title={COPY.errorTitle}
          message={COPY.errorMessage}
          action={{ label: COPY.retry, onClick: () => { void refetchStats(); } }}
        />
      </Container>
    );
  }

  return (
    <Container flush className={styles.page}>
      <AnalyticsHero
        summary={heroSummary(stats)}
        range={range}
        onRangeChange={setRange}
        totals={buildTotals(stats)}
        loading={isLoadingStats}
      />

      {statsError && stats ? (
        <p className={styles.error} role="alert">
          {COPY.staleError}
          <button type="button" onClick={() => { void refetchStats(); }}>
            {COPY.retry}
          </button>
        </p>
      ) : null}

      <AnalyticsPulse items={buildPulse(stats)} loading={isLoadingStats} />

      <AnalyticsCharts
        dailyPulse={stats?.dailyPulse ?? []}
        funnel={stats?.funnel}
        requestOutcomes={stats?.requestOutcomes ?? []}
        topCities={stats?.topCities ?? []}
        cityAge={stats?.cityAge ?? []}
        genderSplit={stats?.genderSplit ?? []}
        ageGroups={stats?.ageGroups ?? []}
        educationBands={stats?.educationBands ?? []}
        activityStatuses={stats?.activityStatuses ?? []}
        activityTypes={stats?.activityTypes ?? []}
        attendance={stats?.attendance ?? []}
        content={stats?.content ?? { posts: 0, postViews: 0, magazines: 0, magazineDownloads: 0, spotlights: 0, activityViews: 0 }}
        meetings={stats?.meetings ?? { withLink: 0, reports: [], attendees: [] }}
        comms={stats?.comms ?? { notifications: 0, unread: 0, pendingSignups: 0, notificationTypes: [], emails: [] }}
        traffic={stats?.traffic ?? { guests: 0, members: 0, devices: [], sources: [] }}
        rafiq={stats?.rafiq ?? { turns: 0, members: 0, guests: 0, tokens: 0, models: [] }}
        system={stats?.system ?? { operations: 0, errors: 0, byStatus: [], hourly: [], daily: [], latestAt: null }}
        chartDays={stats?.chartDays ?? 30}
        loading={isLoadingStats}
      />
    </Container>
  );
}
