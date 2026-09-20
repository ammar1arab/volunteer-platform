import type { CSSProperties } from "react";
import { Activity, Award, CalendarClock, Clock3, Users, UserRoundPlus } from "lucide-react";
import { COPY, RANGE_OPTIONS } from "./AnalyticsCopy";
import type { ReportRange } from "@/presentation/types/reports";
import styles from "./AnalyticsPage.module.scss";

const STAT_VISUALS = [
  { icon: Users, color: "#16a34a" },
  { icon: Activity, color: "#2563eb" },
  { icon: CalendarClock, color: "#f59e0b" },
  { icon: Clock3, color: "#8b5cf6" },
  { icon: Award, color: "#ec4899" },
  { icon: UserRoundPlus, color: "#14b8a6" }
] as const;

export default function AnalyticsHero({
  summary,
  range,
  onRangeChange,
  totals,
  pendingRequests,
  loading
}: {
  summary: string;
  range: ReportRange;
  onRangeChange: (value: ReportRange) => void;
  totals: Array<{ label: string; value: string }>;
  pendingRequests: number;
  loading: boolean;
}) {
  return (
    <section className={styles.hero}>
      <span className={styles.heroSheen} aria-hidden="true" />
      <div className={styles.heroMain}>
        <div className={styles.heroCopy}>
          <span className={styles.heroEyebrow}>لوحة المؤشرات</span>
          <h1>{COPY.title}</h1>
          <p>{summary}</p>
        </div>
        <div className={styles.range} aria-label={COPY.rangeAria}>
          {RANGE_OPTIONS.map((item) => (
            <button
              key={item.value}
              type="button"
              className={range === item.value ? styles.activeRange : undefined}
              onClick={() => onRangeChange(item.value)}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>
      <ul className={styles.heroStats}>
        {totals.map((item, index) => {
          const visual = STAT_VISUALS[index % STAT_VISUALS.length];
          const Icon = visual.icon;
          const showDot = (index === 2 && pendingRequests > 0) || index === 5;
          return (
            <li key={item.label} style={{ "--stat-accent": visual.color } as CSSProperties}>
              <span className={styles.heroStatIcon} aria-hidden="true"><Icon size={15} /></span>
              <span className={styles.heroStatCopy}>
                {loading ? <i className={styles.chipSkeleton} /> : <strong>{item.value}</strong>}
                <span>{item.label}</span>
              </span>
              {showDot ? <i className={styles.heroStatDot} aria-hidden="true" /> : null}
            </li>
          );
        })}
      </ul>
    </section>
  );
}
