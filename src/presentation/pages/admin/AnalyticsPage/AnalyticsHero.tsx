import { COPY, RANGE_OPTIONS } from "./AnalyticsCopy";
import type { ReportRange } from "@/presentation/types/reports";
import styles from "./AnalyticsPage.module.scss";

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
      <div className={styles.heroMain}>
        <div>
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
        {totals.map((item) => (
          <li key={item.label}>
            {loading ? <i className={styles.chipSkeleton} /> : <strong>{item.value}</strong>}
            <span>{item.label}</span>
          </li>
        ))}
      </ul>
      {pendingRequests > 0 ? (
        <p className={styles.pendingAlert} role="status">
          <span className={styles.pendingDot} aria-hidden="true" />
          {pendingRequests} طلباً بانتظار المراجعة
        </p>
      ) : null}
    </section>
  );
}
