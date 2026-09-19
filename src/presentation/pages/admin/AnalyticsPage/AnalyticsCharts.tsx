"use client";

import { useState, type ReactNode } from "react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ReferenceDot,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";
import { ChartColumn } from "lucide-react";
import { EmptyState } from "@/presentation/components";
import { formatDateTime, formatShortDate } from "@/lib/utils/date";
import { formatNumber } from "@/lib/utils/text";
import type {
  CityAgeCount,
  CityCount,
  DailyPulse,
  GenderCount,
  JoinFunnel,
  NamedCount
} from "@/presentation/types/reports";
import { formatCount } from "./AnalyticsPage.logic";
import { COPY } from "./AnalyticsCopy";
import {
  AMBER,
  BLUE,
  GREEN,
  PINK,
  PURPLE,
  TEAL,
  activityStatusRows,
  activityTypeRows,
  ageRows,
  attendanceRows,
  cityAgeStacks,
  cityRows,
  dailyPoints,
  DEVICE_LABELS,
  educationRows,
  emailRows,
  funnelRows,
  genderRows,
  joinedCounts,
  loadDayRows,
  logRows,
  matchRows,
  notificationRows,
  outcomeRows,
  percent,
  RAFIQ_MODEL_LABELS,
  rafiqWavePoints,
  SOURCE_LABELS,
  trafficWavePoints,
  type ChartRow
} from "./AnalyticsCharts.logic";
import styles from "./AnalyticsCharts.module.scss";

const Y_AXIS = { width: 52, tick: { fontSize: 11, fill: "#4b5563" } };
const CHART_MARGIN = { top: 8, right: 8, left: 8, bottom: 4 };

function Panel({
  title,
  subtitle,
  wide,
  children
}: {
  title: string;
  subtitle?: string;
  wide?: boolean;
  children: ReactNode;
}) {
  return (
    <section className={`${styles.panel} ${wide ? styles.wide : ""}`}>
      <header>
        <h2>{title}</h2>
        {subtitle ? <p>{subtitle}</p> : null}
      </header>
      {children}
    </section>
  );
}

function ChartEmpty({ message = COPY.emptyChart }: { message?: string }) {
  return <EmptyState compact icon={ChartColumn} message={message} />;
}

function ChartTooltip({
  active,
  payload,
  label
}: {
  active?: boolean;
  payload?: ReadonlyArray<{ value?: number; name?: string; color?: string }>;
  label?: string;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div className={styles.tooltip}>
      {label ? <strong>{label}</strong> : null}
      {payload.map((row) => (
        <span key={row.name}>
          <i style={{ background: row.color }} />
          {row.name}: {formatNumber(row.value ?? 0)}
        </span>
      ))}
    </div>
  );
}

function ColumnChart({ rows, empty = COPY.emptyChart }: { rows: ChartRow[]; empty?: string }) {
  if (!rows.length) return <ChartEmpty message={empty} />;
  return (
    <div className={styles.chart} dir="ltr">
      <ResponsiveContainer width="100%" height={230}>
        <BarChart data={rows} margin={CHART_MARGIN} tabIndex={-1}>
          <CartesianGrid stroke="rgba(0,0,0,.05)" vertical={false} />
          <XAxis
            dataKey="label"
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 11 }}
            interval={rows.length > 12 ? 2 : 0}
          />
          <YAxis allowDecimals={false} axisLine={false} tickLine={false} width={Y_AXIS.width} tick={Y_AXIS.tick} />
          <Tooltip content={<ChartTooltip />} cursor={{ fill: "rgba(0,0,0,.03)" }} />
          <Bar dataKey="value" name="العدد" radius={[8, 8, 0, 0]} maxBarSize={42}>
            {rows.map((row) => (
              <Cell key={row.label} fill={row.color} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

function GroupedWeek({ points }: { points: DailyPulse[] }) {
  const rows = points.slice(-8).map((row) => ({
    label: formatShortDate(new Date(`${row.date}T00:00:00+03:00`)),
    volunteers: row.volunteers,
    requests: row.requests
  }));
  if (!rows.length) return <ChartEmpty message={COPY.emptyDaily} />;
  return (
    <div className={styles.chart} dir="ltr">
      <ResponsiveContainer width="100%" height={230}>
        <BarChart data={rows} margin={CHART_MARGIN} barGap={4} tabIndex={-1}>
          <CartesianGrid stroke="rgba(0,0,0,.05)" vertical={false} />
          <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{ fontSize: 11 }} />
          <YAxis allowDecimals={false} axisLine={false} tickLine={false} width={Y_AXIS.width} tick={Y_AXIS.tick} />
          <Tooltip content={<ChartTooltip />} cursor={{ fill: "rgba(0,0,0,.03)" }} />
          <Bar dataKey="volunteers" name="متطوعون" fill={PURPLE} radius={[8, 8, 0, 0]} maxBarSize={18} />
          <Bar dataKey="requests" name="طلبات" fill={PINK} radius={[8, 8, 0, 0]} maxBarSize={18} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

function weekdayLabel(date: string) {
  return new Date(`${date}T00:00:00+03:00`).toLocaleDateString("ar-JO", { weekday: "short" });
}

function JourneyCurve({ points, accept, attend }: { points: DailyPulse[]; accept: number; attend: number }) {
  const rows = points.slice(-7).map((row) => ({
    label: weekdayLabel(row.date),
    date: formatShortDate(new Date(`${row.date}T00:00:00+03:00`)),
    volunteers: row.volunteers,
    requests: row.requests
  }));
  if (!rows.length) return <ChartEmpty />;
  const mid = rows[Math.floor(rows.length / 2)];
  return (
    <div className={styles.curveBox}>
      <div className={styles.curveBadge}>
        <b>قبول {formatNumber(accept)}%</b>
        <span>
          حضور {formatNumber(attend)}% · {mid.date}
        </span>
      </div>
      <div className={styles.chart} dir="ltr">
        <ResponsiveContainer width="100%" height={210}>
          <LineChart data={rows} margin={{ top: 28, right: 16, left: 8, bottom: 0 }} tabIndex={-1}>
            <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "#9ca3af" }} />
            <YAxis hide />
            <Tooltip content={<ChartTooltip />} />
            <Line
              type="natural"
              dataKey="requests"
              name="طلبات"
              stroke={AMBER}
              strokeWidth={2.4}
              dot={false}
              activeDot={{ r: 5 }}
              isAnimationActive={false}
            />
            <Line
              type="natural"
              dataKey="volunteers"
              name="متطوعون"
              stroke={BLUE}
              strokeWidth={2.4}
              dot={false}
              activeDot={{ r: 5 }}
              isAnimationActive={false}
            />
            <ReferenceDot x={mid.label} y={mid.requests} r={5} fill={AMBER} stroke="#fff" strokeWidth={2} />
            <ReferenceDot x={mid.label} y={mid.volunteers} r={6} fill="#fff" stroke={BLUE} strokeWidth={2} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

function LoadWave({ rows, total }: { rows: ChartRow[]; total: number }) {
  if (!rows.some((row) => row.value > 0)) return <ChartEmpty message={COPY.emptySystem} />;
  const peak = rows.reduce((best, row, index) => (row.value > best.row.value ? { row, index } : best), {
    row: rows[0],
    index: 0
  });
  return (
    <div className={styles.curveBox} dir="ltr">
      <div className={styles.loadBadge} style={{ left: `${(peak.index / Math.max(rows.length - 1, 1)) * 100}%` }}>
        {formatNumber(total)}
      </div>
      <div className={`${styles.chart} ${styles.chartTall}`}>
        <ResponsiveContainer width="100%" height={270}>
          <AreaChart data={rows} margin={{ top: 28, right: 16, left: 8, bottom: 0 }} tabIndex={-1}>
            <defs>
              <linearGradient id="loadWave" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#0b3a4a" />
                <stop offset="55%" stopColor="#128a8a" />
                <stop offset="100%" stopColor="#2dd4bf" />
              </linearGradient>
            </defs>
            <XAxis
              dataKey="label"
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 11, fill: "#9ca3af" }}
              minTickGap={28}
            />
            <YAxis hide />
            <Tooltip content={<ChartTooltip />} />
            <Area
              type="natural"
              dataKey="value"
              name="عمليات"
              stroke="#0b3a4a"
              strokeWidth={2}
              fill="url(#loadWave)"
              isAnimationActive={false}
              activeDot={{ r: 6, fill: "#facc15", stroke: "#0b3a4a", strokeWidth: 1 }}
              dot={{ r: 4, fill: "#facc15", stroke: "#0b3a4a", strokeWidth: 1 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

function SlimAgeBars({ rows }: { rows: ChartRow[] }) {
  if (!rows.length) return <ChartEmpty />;
  return (
    <div className={styles.chart} dir="ltr">
      <ResponsiveContainer width="100%" height={230}>
        <BarChart data={rows} margin={{ top: 20, right: 12, left: 12, bottom: 4 }} barCategoryGap="28%" tabIndex={-1}>
          <defs>
            <linearGradient id="slimAge" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#8b5cf6" />
              <stop offset="1" stopColor="#6366f1" />
            </linearGradient>
          </defs>
          <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "#9ca3af" }} />
          <YAxis hide />
          <Tooltip content={<ChartTooltip />} cursor={{ fill: "rgba(139,92,246,.04)" }} />
          <Bar dataKey="value" name="العدد" fill="url(#slimAge)" radius={[8, 8, 8, 8]} maxBarSize={8} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

function CityAgeRadial({ rows }: { rows: CityAgeCount[] }) {
  const { data, ageTotals, grand } = cityAgeStacks(rows);
  const ages = ageTotals.filter((row) => row.count > 0);
  const largest = ages.reduce((best, row) => (row.count > best.count ? row : best), ages[0]);
  const [selectedKey, setSelectedKey] = useState(largest?.key ?? "");
  if (!data.length || !grand || !ages.length) return <ChartEmpty />;
  const featured = ages.find((row) => row.key === selectedKey) ?? largest;
  const featuredIndex = ages.findIndex((row) => row.key === featured.key);
  const width = 1100;
  const height = Math.max(420, data.length * 36 + 40);
  const orb = { x: 96, y: height / 2 };
  const ageX = 290;
  const cityX = 720;
  const ageSpacing = 56;
  const ageStartY = (height - (ages.length - 1) * ageSpacing) / 2;
  const ageYs = ages.map((_, index) => ageStartY + index * ageSpacing);
  const cityPadY = 28;
  const cityYs = data.map((_, index) => cityPadY + (index * (height - cityPadY * 2)) / Math.max(data.length - 1, 1));

  return (
    <div className={styles.radialWrap} dir="ltr">
      <svg className={styles.radial} viewBox={`0 0 ${width} ${height}`} role="img" aria-label={COPY.panels.cityAge}>
        <defs>
          <radialGradient id="cityAgeOrb" cx="50%" cy="42%" r="58%">
            <stop offset="0%" stopColor="#86efac" />
            <stop offset="100%" stopColor={GREEN} />
          </radialGradient>
        </defs>
        {ages.map((age, index) => (
          <line
            key={`hub-${age.key}`}
            x1={orb.x + 28}
            y1={orb.y}
            x2={ageX - 86}
            y2={ageYs[index]}
            stroke={age.color}
            strokeWidth={age.key === featured.key ? 2 : 1}
            strokeOpacity={age.key === featured.key ? 0.65 : 0.25}
          />
        ))}
        {data.map((city, index) => {
          const countInAge = city[featured.key] ?? 0;
          if (countInAge <= 0) return null;
          const ratio = countInAge / Math.max(featured.count, 1);
          return (
            <line
              key={`fan-${city.cityKey}`}
              x1={ageX + 86}
              y1={ageYs[featuredIndex]}
              x2={cityX}
              y2={cityYs[index]}
              stroke={featured.color}
              strokeWidth={Math.max(1, Math.min(3.5, 1 + ratio * 3.5))}
              strokeOpacity={0.22 + Math.min(0.68, ratio * 1.5)}
            />
          );
        })}
        <circle cx={orb.x} cy={orb.y} r={32} fill="url(#cityAgeOrb)" />
        <text x={orb.x} y={orb.y + 5} textAnchor="middle" fill="#fff" fontSize="14" fontWeight="700">
          {formatNumber(grand)}
        </text>
        {ages.map((age, index) => {
          const active = age.key === featured.key;
          return (
            <g
              key={age.key}
              role="button"
              tabIndex={0}
              style={{ cursor: "pointer", outline: "none" }}
              aria-pressed={active}
              onClick={() => setSelectedKey(age.key)}
              onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === " ") {
                  event.preventDefault();
                  setSelectedKey(age.key);
                }
              }}
            >
              <rect
                x={ageX - 86}
                y={ageYs[index] - 17}
                width="172"
                height="34"
                rx="10"
                fill={active ? age.color : "#fff"}
                stroke={age.color}
                style={{ outline: "none" }}
              />
              <circle cx={ageX - 70} cy={ageYs[index]} r="4" fill={active ? "#fff" : age.color} />
              <text x={ageX - 58} y={ageYs[index] + 4} fill={active ? "#fff" : "#111827"} fontSize="12" fontWeight={active ? "600" : "400"}>
                {`${formatNumber(age.count)} · ${age.label}`}
              </text>
            </g>
          );
        })}
        {data.map((city, index) => {
          const countInAge = city[featured.key] ?? 0;
          const isConnected = countInAge > 0;
          return (
            <g key={city.cityKey}>
              <circle
                cx={cityX}
                cy={cityYs[index]}
                r={isConnected ? 4.5 : 3}
                fill={isConnected ? featured.color : "#cbd5e1"}
              />
              <text
                x={cityX + 16}
                y={cityYs[index] + 4}
                fill={isConnected ? "#0f172a" : "#64748b"}
                fontSize="13"
                fontWeight={isConnected ? "600" : "400"}
              >
                {city.city}
              </text>
              <text
                x={width - 24}
                y={cityYs[index] + 4}
                textAnchor="end"
                fill={isConnected ? featured.color : "#94a3b8"}
                fontSize="12"
                fontWeight={isConnected ? "700" : "500"}
              >
                {isConnected
                  ? `${formatNumber(countInAge)} من ${formatNumber(city.total)}`
                  : `${formatNumber(city.total)} متطوع`}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}

function GradientPie({ id, rows, center, hint }: { id: string; rows: ChartRow[]; center: string; hint: string }) {
  const total = rows.reduce((sum, row) => sum + row.value, 0);
  if (!total) return <ChartEmpty />;
  return (
    <div className={styles.donut}>
      <div className={styles.donutChart}>
        <ResponsiveContainer width="100%" height={210}>
          <PieChart tabIndex={-1}>
            <defs>
              {rows.map((row, index) => (
                <linearGradient key={`${id}-${index}`} id={`${id}-${index}`} x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor={row.color} />
                  <stop offset="100%" stopColor={row.color} stopOpacity=".82" />
                </linearGradient>
              ))}
            </defs>
            <Pie
              data={rows}
              dataKey="value"
              nameKey="label"
              innerRadius={54}
              outerRadius={84}
              paddingAngle={3}
              stroke="none"
              isAnimationActive={false}
            >
              {rows.map((row, index) => (
                <Cell key={row.label} fill={`url(#${id}-${index})`} />
              ))}
            </Pie>
            <Tooltip content={<ChartTooltip />} />
          </PieChart>
        </ResponsiveContainer>
        <b>
          {center}
          <small>{hint}</small>
        </b>
      </div>
      <ul className={styles.legend}>
        {rows.map((row) => (
          <li key={row.label} className={styles.legendItem}>
            <span className={styles.legendLabel}>
              <i className={styles.legendDot} style={{ background: row.color }} />
              {row.label}
            </span>
            <strong>{formatNumber(row.value)}</strong>
          </li>
        ))}
      </ul>
    </div>
  );
}

function StatGrid({ rows }: { rows: Array<{ label: string; value: string }> }) {
  return (
    <div className={styles.statGrid}>
      {rows.map((row) => (
        <div key={row.label}>
          <span>{row.label}</span>
          <strong>{row.value}</strong>
        </div>
      ))}
    </div>
  );
}

function TrafficWaveChart({
  traffic,
  chartDays
}: {
  traffic: {
    guests: number;
    members: number;
    devices: NamedCount[];
    sources: NamedCount[];
    daily?: Array<{ date: string; guests: number; members: number; total: number }>;
  };
  chartDays: number;
}) {
  const points = trafficWavePoints(traffic.daily);
  const totalVisitors = traffic.guests + traffic.members;

  return (
    <div className={styles.wavePanel}>
      <div className={styles.waveStats}>
        <div className={styles.waveStatCard}>
          <span className={styles.waveStatLabel}>إجمالي الزوار</span>
          <span className={styles.waveStatVal} style={{ color: TEAL }}>
            {formatNumber(totalVisitors)}
          </span>
          <span className={styles.waveStatSub}>خلال {formatNumber(chartDays)} يوماً</span>
        </div>
        <div className={styles.waveStatCard}>
          <span className={styles.waveStatLabel}>بدون حساب</span>
          <span className={styles.waveStatVal} style={{ color: TEAL }}>
            {formatNumber(traffic.guests)}
          </span>
          <span className={styles.waveStatSub}>
            {percent(traffic.guests, totalVisitors || 1)}% من الإجمالي
          </span>
        </div>
        <div className={styles.waveStatCard}>
          <span className={styles.waveStatLabel}>أعضاء بحسابات</span>
          <span className={styles.waveStatVal} style={{ color: PURPLE }}>
            {formatNumber(traffic.members)}
          </span>
          <span className={styles.waveStatSub}>
            {percent(traffic.members, totalVisitors || 1)}% من الإجمالي
          </span>
        </div>
        <div className={styles.waveStatCard}>
          <span className={styles.waveStatLabel}>الجهاز الأكثر</span>
          <span className={styles.waveStatVal} style={{ color: BLUE }}>
            {traffic.devices[0] ? DEVICE_LABELS[traffic.devices[0].name as keyof typeof DEVICE_LABELS] || traffic.devices[0].name : "—"}
          </span>
          <span className={styles.waveStatSub}>
            {traffic.devices[0] ? `${formatNumber(traffic.devices[0].count)} زيارة` : "بانتظار البيانات"}
          </span>
        </div>
      </div>

      <div className={styles.waveChartBox} dir="ltr">
        {points.length ? (
          <ResponsiveContainer width="100%" height={210}>
            <AreaChart data={points} margin={{ top: 12, right: 10, left: -10, bottom: 0 }} tabIndex={-1}>
              <defs>
                <linearGradient id="trafficGuestsGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={TEAL} stopOpacity={0.42} />
                  <stop offset="100%" stopColor={TEAL} stopOpacity={0.02} />
                </linearGradient>
                <linearGradient id="trafficMembersGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={PURPLE} stopOpacity={0.36} />
                  <stop offset="100%" stopColor={PURPLE} stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke="rgba(0,0,0,0.05)" strokeDasharray="3 3" vertical={false} />
              <XAxis
                dataKey="label"
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 10, fill: "#9ca3af" }}
                minTickGap={20}
              />
              <YAxis
                allowDecimals={false}
                axisLine={false}
                tickLine={false}
                width={36}
                tick={{ fontSize: 10, fill: "#9ca3af" }}
              />
              <Tooltip content={<ChartTooltip />} />
              <Area
                type="monotone"
                dataKey="guests"
                name="زوار بدون تسجيل"
                stroke={TEAL}
                strokeWidth={2.5}
                fill="url(#trafficGuestsGrad)"
                activeDot={{ r: 5, strokeWidth: 2, stroke: "#fff" }}
                dot={false}
                isAnimationActive={false}
              />
              <Area
                type="monotone"
                dataKey="members"
                name="أعضاء مسجلين"
                stroke={PURPLE}
                strokeWidth={2.5}
                fill="url(#trafficMembersGrad)"
                activeDot={{ r: 5, strokeWidth: 2, stroke: "#fff" }}
                dot={false}
                isAnimationActive={false}
              />
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <ChartEmpty message="لا توجد بيانات زوار كافية للرسم البياني" />
        )}
      </div>

      <div className={styles.waveFooterSources}>
        <span className={styles.waveFooterTitle}>المصادر والأجهزة:</span>
        {traffic.sources.map((s) => (
          <span key={s.name} className={styles.sourceTag}>
            {SOURCE_LABELS[s.name as keyof typeof SOURCE_LABELS] || s.name}: <strong>{formatNumber(s.count)}</strong>
          </span>
        ))}
        {traffic.devices.map((d) => (
          <span key={d.name} className={styles.wavePill}>
            {DEVICE_LABELS[d.name as keyof typeof DEVICE_LABELS] || d.name}: <strong>{formatNumber(d.count)}</strong>
          </span>
        ))}
      </div>
    </div>
  );
}

function RafiqWaveChart({
  rafiq,
  chartDays
}: {
  rafiq: {
    turns: number;
    members: number;
    guests: number;
    tokens: number;
    models: NamedCount[];
    daily?: Array<{ date: string; turns: number; members: number; guests: number; tokens: number }>;
  };
  chartDays: number;
}) {
  const points = rafiqWavePoints(rafiq.daily);
  const totalUsers = rafiq.members + rafiq.guests;

  return (
    <div className={styles.wavePanel}>
      <div className={styles.waveStats}>
        <div className={styles.waveStatCard}>
          <span className={styles.waveStatLabel}>عدد الأسئلة</span>
          <span className={styles.waveStatVal} style={{ color: PURPLE }}>
            {formatNumber(rafiq.turns)}
          </span>
          <span className={styles.waveStatSub}>محادثات المساعد</span>
        </div>
        <div className={styles.waveStatCard}>
          <span className={styles.waveStatLabel}>المستخدمون</span>
          <span className={styles.waveStatVal} style={{ color: TEAL }}>
            {formatNumber(totalUsers)}
          </span>
          <span className={styles.waveStatSub}>
            حساب {formatNumber(rafiq.members)} · ضيف {formatNumber(rafiq.guests)}
          </span>
        </div>
        <div className={styles.waveStatCard}>
          <span className={styles.waveStatLabel}>التوكنز المستهلكة</span>
          <span className={styles.waveStatVal} style={{ color: AMBER }}>
            {formatNumber(rafiq.tokens)}
          </span>
          <span className={styles.waveStatSub}>استهلاك الذكاء الاصطناعي</span>
        </div>
        <div className={styles.waveStatCard}>
          <span className={styles.waveStatLabel}>النماذج المستخدمة</span>
          <span className={styles.waveStatVal} style={{ color: BLUE }}>
            {rafiq.models[0]
              ? RAFIQ_MODEL_LABELS[rafiq.models[0].name as keyof typeof RAFIQ_MODEL_LABELS] || rafiq.models[0].name
              : "رد جاهز"}
          </span>
          <span className={styles.waveStatSub}>
            {rafiq.models[0] ? `${formatNumber(rafiq.models[0].count)} استجابة` : "جاهز للرد"}
          </span>
        </div>
      </div>

      <div className={styles.waveChartBox} dir="ltr">
        {points.length ? (
          <ResponsiveContainer width="100%" height={210}>
            <AreaChart data={points} margin={{ top: 12, right: 10, left: -10, bottom: 0 }} tabIndex={-1}>
              <defs>
                <linearGradient id="rafiqTurnsGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={PURPLE} stopOpacity={0.45} />
                  <stop offset="100%" stopColor={PURPLE} stopOpacity={0.02} />
                </linearGradient>
                <linearGradient id="rafiqUsersGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={TEAL} stopOpacity={0.30} />
                  <stop offset="100%" stopColor={TEAL} stopOpacity={0.01} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke="rgba(0,0,0,0.05)" strokeDasharray="3 3" vertical={false} />
              <XAxis
                dataKey="label"
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 10, fill: "#9ca3af" }}
                minTickGap={20}
              />
              <YAxis
                allowDecimals={false}
                axisLine={false}
                tickLine={false}
                width={36}
                tick={{ fontSize: 10, fill: "#9ca3af" }}
              />
              <Tooltip content={<ChartTooltip />} />
              <Area
                type="monotone"
                dataKey="turns"
                name="الأسئلة"
                stroke={PURPLE}
                strokeWidth={2.5}
                fill="url(#rafiqTurnsGrad)"
                activeDot={{ r: 5, strokeWidth: 2, stroke: "#fff" }}
                dot={false}
                isAnimationActive={false}
              />
              <Area
                type="monotone"
                dataKey="users"
                name="المستخدمون"
                stroke={TEAL}
                strokeWidth={2}
                fill="url(#rafiqUsersGrad)"
                activeDot={{ r: 4, strokeWidth: 1.5, stroke: "#fff" }}
                dot={false}
                isAnimationActive={false}
              />
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <ChartEmpty message="لا توجد بيانات محادثات كافية للرسم البياني" />
        )}
      </div>

      <div className={styles.waveFooterSources}>
        <span className={styles.waveFooterTitle}>نماذج الرد:</span>
        {rafiq.models.map((m) => (
          <span key={m.name} className={styles.sourceTag}>
            {RAFIQ_MODEL_LABELS[m.name as keyof typeof RAFIQ_MODEL_LABELS] || m.name}: <strong>{formatNumber(m.count)}</strong>
          </span>
        ))}
      </div>
    </div>
  );
}

export default function AnalyticsCharts({
  dailyPulse,
  funnel,
  requestOutcomes,
  topCities,
  cityAge,
  genderSplit,
  ageGroups,
  educationBands,
  activityStatuses,
  activityTypes,
  attendance,
  content,
  meetings,
  comms,
  traffic,
  rafiq,
  system,
  chartDays,
  loading
}: {
  dailyPulse: DailyPulse[];
  funnel?: JoinFunnel;
  requestOutcomes: NamedCount[];
  topCities: CityCount[];
  cityAge: CityAgeCount[];
  genderSplit: GenderCount[];
  ageGroups: NamedCount[];
  educationBands: NamedCount[];
  activityStatuses: NamedCount[];
  activityTypes: NamedCount[];
  attendance: NamedCount[];
  content: {
    posts: number;
    postViews: number;
    magazines: number;
    magazineDownloads: number;
    spotlights: number;
    activityViews: number;
  };
  meetings: { withLink: number; reports: NamedCount[]; attendees: NamedCount[] };
  comms: {
    notifications: number;
    unread: number;
    pendingSignups: number;
    notificationTypes: NamedCount[];
    emails: NamedCount[];
  };
  traffic: {
    guests: number;
    members: number;
    devices: NamedCount[];
    sources: NamedCount[];
    daily?: Array<{ date: string; guests: number; members: number; total: number }>;
  };
  rafiq: {
    turns: number;
    members: number;
    guests: number;
    tokens: number;
    models: NamedCount[];
    daily?: Array<{ date: string; turns: number; members: number; guests: number; tokens: number }>;
  };
  system: {
    operations: number;
    errors: number;
    byStatus: NamedCount[];
    hourly: NamedCount[];
    daily: NamedCount[];
    latestAt: string | null;
  };
  chartDays: number;
  loading: boolean;
}) {
  if (loading) {
    return (
      <div className={styles.grid}>
        <div className={`${styles.panel} ${styles.wide} ${styles.skeleton}`} />
        <div className={`${styles.panel} ${styles.skeleton}`} />
        <div className={`${styles.panel} ${styles.skeleton}`} />
        <div className={`${styles.panel} ${styles.wide} ${styles.skeleton}`} />
        <div className={`${styles.panel} ${styles.skeleton}`} />
        <div className={`${styles.panel} ${styles.skeleton}`} />
      </div>
    );
  }

  const points = dailyPoints(dailyPulse);
  const genders = genderRows(genderSplit);
  const genderTotal = genders.reduce((sum, row) => sum + row.value, 0);
  const conversions = funnel
    ? [
        { label: "قبول الطلبات", value: percent(funnel.approved, funnel.requested), color: TEAL },
        { label: "الحضور بعد القبول", value: percent(funnel.attended, funnel.approved), color: PURPLE }
      ]
    : [];
  const attendeeRows = matchRows(meetings.attendees);
  const noticeRows = notificationRows(comms.notificationTypes ?? []);
  const mailRows = emailRows(comms.emails ?? []);
  const dayLoad = loadDayRows(system.daily ?? []);
  const systemStatus = logRows(system.byStatus);

  return (
    <div className={styles.grid}>
      <Panel title={COPY.panels.daily} subtitle={COPY.panels.dailySub(formatNumber(chartDays))} wide>
        {points.length ? (
          <div className={`${styles.chart} ${styles.chartTall}`} dir="ltr">
            <ResponsiveContainer width="100%" height={270}>
              <AreaChart data={points} margin={{ top: 12, right: 8, left: 4, bottom: 0 }} tabIndex={-1}>
                <defs>
                  <linearGradient id="volunteerGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0" stopColor={GREEN} stopOpacity=".75" />
                    <stop offset="1" stopColor={GREEN} stopOpacity=".08" />
                  </linearGradient>
                  <linearGradient id="requestGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0" stopColor={PURPLE} stopOpacity=".62" />
                    <stop offset="1" stopColor={PURPLE} stopOpacity=".08" />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="rgba(0,0,0,.06)" vertical={false} />
                <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{ fontSize: 11 }} minTickGap={24} />
                <YAxis
                  allowDecimals={false}
                  axisLine={false}
                  tickLine={false}
                  width={Y_AXIS.width}
                  tick={Y_AXIS.tick}
                />
                <Tooltip content={<ChartTooltip />} />
                <Area
                  dataKey="requests"
                  name="طلبات"
                  stroke={PURPLE}
                  strokeWidth={2}
                  fill="url(#requestGradient)"
                  dot={false}
                  isAnimationActive={false}
                />
                <Area
                  dataKey="volunteers"
                  name="متطوعون"
                  stroke={GREEN}
                  strokeWidth={3}
                  fill="url(#volunteerGradient)"
                  dot={false}
                  isAnimationActive={false}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <ChartEmpty message={COPY.emptyDaily} />
        )}
      </Panel>

      <Panel title={COPY.panels.recentDays} subtitle={COPY.panels.recentDaysSub}>
        <GroupedWeek points={dailyPulse} />
      </Panel>

      <Panel title={COPY.panels.conversion} subtitle={COPY.panels.conversionSub}>
        {conversions.length ? (
          <JourneyCurve points={dailyPulse} accept={conversions[0].value} attend={conversions[1].value} />
        ) : (
          <ChartEmpty />
        )}
      </Panel>

      <Panel title={COPY.panels.journey} subtitle={COPY.panels.journeySub}>
        <ColumnChart rows={funnelRows(funnel)} />
      </Panel>

      <Panel title={COPY.panels.outcomes} subtitle={COPY.panels.outcomesSub}>
        <ColumnChart rows={outcomeRows(requestOutcomes)} />
      </Panel>

      <Panel title={COPY.panels.gender} subtitle={COPY.panels.genderSub}>
        <GradientPie id="genderPie" rows={genders} center={formatNumber(genderTotal)} hint="متطوع" />
      </Panel>

      <Panel title={COPY.panels.ages} subtitle={COPY.panels.agesSub}>
        <SlimAgeBars rows={ageRows(ageGroups)} />
      </Panel>

      <Panel title={COPY.panels.cityAge} subtitle={COPY.panels.cityAgeSub} wide>
        <CityAgeRadial rows={cityAge} />
      </Panel>

      <Panel title={COPY.panels.education} subtitle={COPY.panels.educationSub}>
        <GradientPie
          id="educationPie"
          rows={educationRows(educationBands)}
          center={formatNumber(educationBands.reduce((sum, row) => sum + row.count, 0))}
          hint="ملف"
        />
      </Panel>

      <Panel title={COPY.panels.cities} subtitle={COPY.panels.citiesSub}>
        <ColumnChart rows={cityRows(topCities)} />
      </Panel>

      <Panel title={COPY.panels.activityStatus} subtitle={COPY.panels.activityStatusSub}>
        <ColumnChart rows={activityStatusRows(activityStatuses)} />
      </Panel>

      <Panel title={COPY.panels.activityType} subtitle={COPY.panels.activityTypeSub}>
        <ColumnChart rows={activityTypeRows(activityTypes)} />
      </Panel>

      <Panel title={COPY.panels.attendance} subtitle={COPY.panels.attendanceSub}>
        <ColumnChart rows={attendanceRows(attendance)} />
      </Panel>

      <Panel title={COPY.panels.content} subtitle={COPY.panels.contentSub}>
        <StatGrid
          rows={[
            { label: "مشاهدات الأنشطة", value: formatCount(content.activityViews) },
            { label: "المقالات", value: formatCount(content.posts) },
            { label: "مشاهدات المقالات", value: formatCount(content.postViews) },
            { label: "أعداد المجلة", value: formatCount(content.magazines) },
            { label: "تحميلات المجلة", value: formatCount(content.magazineDownloads) },
            { label: "تسليط الضوء", value: formatCount(content.spotlights) }
          ]}
        />
      </Panel>

      <Panel title={COPY.panels.visitors} subtitle={COPY.panels.visitorsSub}>
        <TrafficWaveChart traffic={traffic} chartDays={chartDays} />
      </Panel>

      <Panel title={COPY.panels.rafiq} subtitle={COPY.panels.rafiqSub}>
        <RafiqWaveChart rafiq={rafiq} chartDays={chartDays} />
      </Panel>

      {attendeeRows.length ? (
        <Panel title={COPY.panels.match} subtitle={COPY.panels.matchSub}>
          <ColumnChart rows={attendeeRows} />
        </Panel>
      ) : null}

      <Panel title={COPY.panels.notifications} subtitle={COPY.panels.notificationsSub}>
        <StatGrid
          rows={[
            { label: "إشعارات الفترة", value: formatCount(comms.notifications) },
            { label: "غير مقروءة الآن", value: formatCount(comms.unread) }
          ]}
        />
        <ColumnChart rows={noticeRows} />
      </Panel>

      <Panel title={COPY.panels.emails} subtitle={COPY.panels.emailsSub}>
        <ColumnChart rows={mailRows} empty="ما في إيميلات تحقق أو استعادة في هذه الفترة" />
      </Panel>

      <Panel title={COPY.panels.load} subtitle={COPY.panels.loadSub} wide>
        <LoadWave rows={dayLoad} total={system.operations} />
      </Panel>

      <Panel title={COPY.panels.health} subtitle={COPY.panels.healthSub}>
        <StatGrid
          rows={[
            { label: "قاعدة البيانات", value: "متصلة" },
            { label: "الموقع", value: "يعمل" },
            { label: "آخر عملية", value: system.latestAt ? formatDateTime(system.latestAt) : "ما في بعد" },
            { label: "نسبة الأخطاء", value: `${formatNumber(percent(system.errors, system.operations))}%` }
          ]}
        />
      </Panel>

      <Panel title={COPY.panels.system} subtitle={COPY.panels.systemSub}>
        {system.operations ? (
          <>
            <StatGrid
              rows={[
                { label: "عمليات", value: formatCount(system.operations) },
                { label: "أخطاء", value: formatCount(system.errors) }
              ]}
            />
            <ColumnChart rows={systemStatus} empty={COPY.emptySystem} />
          </>
        ) : (
          <ChartEmpty message={COPY.emptySystem} />
        )}
      </Panel>
    </div>
  );
}
