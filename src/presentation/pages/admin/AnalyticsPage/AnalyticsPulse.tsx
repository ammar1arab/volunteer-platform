import type { CSSProperties } from "react";
import { TrendingDown, TrendingUp } from "lucide-react";
import { Area, AreaChart, ResponsiveContainer } from "recharts";
import { formatNumber } from "@/lib/utils/text";
import type { PulseMetric } from "@/presentation/types/reports";
import { COPY } from "./AnalyticsCopy";
import { formatPulseValue, type PulseItem } from "./AnalyticsPage.logic";
import styles from "./AnalyticsPage.module.scss";

const SPARK = ["#8b5cf6", "#14d4c4", "#fb4b8d", "#3b82f6", "#f59e0b", "#22c55e"] as const;

function Delta({ metric }: { metric?: PulseMetric }) {
  if (metric?.change == null) return <span className={styles.flat}>{COPY.fullRange}</span>;
  const rising = metric.change > 0;
  const falling = metric.change < 0;
  return (
    <span className={rising ? styles.up : falling ? styles.down : styles.flat}>
      {rising ? <TrendingUp size={13} /> : falling ? <TrendingDown size={13} /> : null}
      {formatNumber(Math.abs(metric.change), { maximumFractionDigits: 1 })}% {COPY.vsPrevious}
    </span>
  );
}

function Sparkline({ values, color, id }: { values: number[]; color: string; id: string }) {
  if (values.length < 2) return <div className={styles.spark} />;
  const data = values.map((value, index) => ({ index, value }));
  return (
    <div className={styles.spark} dir="ltr">
      <ResponsiveContainer width="100%" height={38}>
        <AreaChart data={data} margin={{ top: 4, right: 0, left: 0, bottom: 0 }} tabIndex={-1}>
          <defs>
            <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity=".7" />
              <stop offset="100%" stopColor={color} stopOpacity=".05" />
            </linearGradient>
          </defs>
          <Area dataKey="value" stroke={color} strokeWidth={2} fill={`url(#${id})`} dot={false} isAnimationActive={false} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

export default function AnalyticsPulse({ items, loading }: { items: PulseItem[]; loading: boolean }) {
  return (
    <section className={styles.pulse}>
      {items.map((item, index) => {
        const Icon = item.icon;
        const color = SPARK[index % SPARK.length];
        return (
          <article key={item.label} className={styles.pulseMetric} style={{ "--accent": color } as CSSProperties}>
            <div className={styles.pulseTop}>
              <span className={styles.metricIcon}>
                <Icon size={16} />
              </span>
              <Delta metric={loading ? undefined : item.metric} />
            </div>
            <strong>{loading ? "جاري التحميل" : formatPulseValue(item)}</strong>
            <span>{item.label}</span>
            <Sparkline values={item.values} color={color} id={`spark-${index}`} />
          </article>
        );
      })}
    </section>
  );
}
