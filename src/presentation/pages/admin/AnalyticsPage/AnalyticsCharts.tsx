"use client";

import type { ReactNode } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { formatShortDate } from "@/lib/utils/date";
import { formatNumber } from "@/lib/utils/text";
import { getCityLabel, getGenderLabel } from "@/presentation/constants";
import { Gender } from "@/core/domain/enums";
import type { CityCount, DailySignup, GenderCount } from "@/presentation/types/reports";
import styles from "./AnalyticsCharts.module.scss";

const GREEN = "#16a34a";
const RED = "#ef4444";
const BLACK = "#000000";
const MUTED = "#666666";
const GRID = "rgba(0, 0, 0, 0.06)";

type TooltipRow = { value?: number; name?: string; color?: string };

function ChartTooltip({
  active,
  label,
  payload,
}: {
  active?: boolean;
  label?: string;
  payload?: ReadonlyArray<TooltipRow>;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div className={styles.tooltip} dir="rtl">
      {label ? <p className={styles.tooltipLabel}>{label}</p> : null}
      {payload.map((row) => (
        <p key={`${row.name}-${row.value}`} className={styles.tooltipValue}>
          <span style={{ background: row.color ?? GREEN }} />
          {formatNumber(row.value ?? 0)}
        </p>
      ))}
    </div>
  );
}

function Panel({
  title,
  empty,
  wide,
  children,
}: {
  title: string;
  empty?: boolean;
  wide?: boolean;
  children: ReactNode;
}) {
  return (
    <section className={`${styles.panel} ${wide ? styles.wide : ""}`}>
      <h2 className={styles.title}>{title}</h2>
      {empty ? <p className={styles.empty}>لا توجد بيانات كافية بعد</p> : children}
    </section>
  );
}

export default function AnalyticsCharts({
  dailySignups,
  topCities,
  genderSplit,
  loading,
}: {
  dailySignups: DailySignup[];
  topCities: CityCount[];
  genderSplit: GenderCount[];
  loading: boolean;
}) {
  const signupPoints = dailySignups.map((row) => {
    const [year, month, day] = row.date.split("-").map(Number);
    return { ...row, label: formatShortDate(new Date(year, month - 1, day)) };
  });
  const cityRows = topCities.map((row) => ({
    key: row.city,
    label: getCityLabel(row.city),
    count: row.count,
  }));
  const genderRows = genderSplit.map((row) => ({
    key: row.gender ?? "UNSET",
    label: row.gender ? getGenderLabel(row.gender) : "غير محدد",
    count: row.count,
    color: row.gender === Gender.MALE ? GREEN : row.gender === Gender.FEMALE ? RED : BLACK,
  }));
  const genderTotal = genderRows.reduce((sum, row) => sum + row.count, 0);
  const cityMax = Math.max(...cityRows.map((row) => row.count), 1);

  if (loading) {
    return (
      <div className={styles.grid}>
        <div className={`${styles.panel} ${styles.wide} ${styles.skeleton}`} />
        <div className={`${styles.panel} ${styles.skeleton}`} />
        <div className={`${styles.panel} ${styles.skeleton}`} />
      </div>
    );
  }

  return (
    <div className={styles.grid}>
      <Panel title="تسجيلات المتطوعين - 30 يوماً" wide>
        <div className={styles.lineChart} dir="ltr">
          <ResponsiveContainer width="100%" height={240}>
            <AreaChart data={signupPoints} margin={{ top: 8, right: 8, left: 4, bottom: 0 }}>
              <defs>
                <linearGradient id="signupFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={GREEN} stopOpacity={0.28} />
                  <stop offset="100%" stopColor={GREEN} stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke={GRID} vertical={false} />
              <XAxis dataKey="label" tick={{ fill: MUTED, fontSize: 11 }} interval={4} axisLine={false} tickLine={false} />
              <YAxis
                allowDecimals={false}
                tick={{ fill: MUTED, fontSize: 11 }}
                axisLine={false}
                tickLine={false}
                width={36}
                tickFormatter={(value: number) => formatNumber(value)}
              />
              <Tooltip content={<ChartTooltip />} />
              <Area
                type="monotone"
                dataKey="count"
                name="تسجيلات"
                stroke={GREEN}
                strokeWidth={2.5}
                fill="url(#signupFill)"
                dot={false}
                activeDot={{ r: 4 }}
                isAnimationActive={false}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </Panel>

      <Panel title="توزيع الجنس" empty={genderTotal === 0}>
        <div className={styles.donutWrap}>
          <div className={styles.donut} dir="ltr">
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={genderRows}
                  dataKey="count"
                  nameKey="label"
                  innerRadius={52}
                  outerRadius={74}
                  paddingAngle={2}
                  stroke="none"
                  isAnimationActive={false}
                >
                  {genderRows.map((row) => (
                    <Cell key={row.key} fill={row.color} />
                  ))}
                </Pie>
                <Tooltip content={<ChartTooltip />} />
              </PieChart>
            </ResponsiveContainer>
            <div className={styles.donutCenter}>
              <strong>{formatNumber(genderTotal)}</strong>
              <span>متطوع</span>
            </div>
          </div>
          <ul className={styles.legend}>
            {genderRows.map((row) => (
              <li key={row.key}>
                <span style={{ background: row.color }} />
                {row.label}
                <strong>{formatNumber(row.count)}</strong>
              </li>
            ))}
          </ul>
        </div>
      </Panel>

      <Panel title="أكثر 5 مدن" empty={cityRows.length === 0}>
        <ul className={styles.bars}>
          {cityRows.map((row) => (
            <li key={row.key}>
              <span className={styles.barLabel}>{row.label}</span>
              <strong>{formatNumber(row.count)}</strong>
              <span className={styles.barTrack}>
                <span className={styles.barFill} style={{ width: `${(row.count / cityMax) * 100}%` }} />
              </span>
            </li>
          ))}
        </ul>
      </Panel>
    </div>
  );
}
