"use client";

import { useState } from "react";
import { Dropdown, Modal } from "@/presentation/components";
import type { TrafficBreakdownDto } from "@/core/application/dtos/report.dto";
import { formatNumber } from "@/lib/utils/text";
import {
  BROWSER_LABELS,
  CITY_LABELS,
  DEVICE_LABELS,
  OS_LABELS,
  SOURCE_LABELS
} from "./AnalyticsCharts.logic";
import styles from "./VisitorDetails.module.scss";

const GROUPS = [
  { key: "sources", label: "مصادر الزيارة" },
  { key: "devices", label: "الأجهزة" },
  { key: "countries", label: "الدول" },
  { key: "cities", label: "المدن" },
  { key: "browsers", label: "المتصفحات" },
  { key: "operatingSystems", label: "أنظمة التشغيل" }
] as const;
type Group = (typeof GROUPS)[number]["key"];

const CARD_ROWS = 5;
const COUNTRIES = new Intl.DisplayNames(["ar"], { type: "region" });

function itemLabel(group: Group, key: string): string {
  if (group === "devices") return DEVICE_LABELS[key] ?? key;
  if (group === "sources") return SOURCE_LABELS[key] ?? key;
  if (group === "browsers") return BROWSER_LABELS[key] ?? key;
  if (group === "operatingSystems") return OS_LABELS[key] ?? key;
  if (group === "cities") return CITY_LABELS[key] ?? key;
  if (group === "countries" && /^[A-Z]{2}$/.test(key)) return key === "PS" ? "فلسطين" : COUNTRIES.of(key) ?? key;
  return key;
}

type Row = { key: string; label: string; count: number };

function BreakdownList({ rows, total, fill = 0 }: { rows: Row[]; total: number; fill?: number }) {
  return (
    <ul className={styles.list}>
      {rows.map((row) => {
        const share = total ? (row.count / total) * 100 : 0;
        return (
          <li key={row.key} className={styles.row}>
            <div className={styles.rowTop}>
              <span className={styles.name}>{row.label}</span>
              <span className={styles.count}>{formatNumber(row.count)}</span>
              <span className={styles.percent}>{formatNumber(share, { maximumFractionDigits: 1 })}%</span>
            </div>
            <span className={styles.track} aria-hidden="true">
              <i style={{ width: `${Math.min(100, share)}%` }} />
            </span>
          </li>
        );
      })}
      {Array.from({ length: fill }, (_, index) => (
        <li key={`fill-${index}`} className={styles.filler} aria-hidden="true" />
      ))}
    </ul>
  );
}

export default function VisitorDetails({ data, unique }: { data: TrafficBreakdownDto; unique: boolean }) {
  const [group, setGroup] = useState<Group>("sources");
  const [isOpen, setIsOpen] = useState(false);
  const total = data.guests + data.members;
  const label = GROUPS.find((item) => item.key === group)?.label ?? "";
  const rows: Row[] = data[group]
    .map((row) => ({ key: row.key, label: itemLabel(group, row.key), count: row.count }))
    .sort((a, b) => b.count - a.count);
  const top = rows.slice(0, CARD_ROWS);
  const half = Math.ceil(rows.length / 2);

  return (
    <section className={styles.card} aria-label={label}>
      <header className={styles.head}>
        <div className={styles.picker}>
          <Dropdown
            items={GROUPS.map(({ key, label: text }) => ({ key, label: text }))}
            active={group}
            onChange={(key) => setGroup(key as Group)}
            compact
          />
        </div>
        <span className={styles.total}>{formatNumber(total)} {unique ? "زائر" : "زيارة"}</span>
      </header>

      {top.length ? (
        <BreakdownList rows={top} total={total} fill={CARD_ROWS - top.length} />
      ) : (
        <p className={styles.empty}>لا توجد بيانات</p>
      )}

      {rows.length > CARD_ROWS && (
        <button type="button" className={styles.more} onClick={() => setIsOpen(true)}>
          عرض الكل ({formatNumber(rows.length)})
        </button>
      )}

      <Modal isOpen={isOpen} onClose={() => setIsOpen(false)} title={`${label} (${formatNumber(rows.length)})`} size="xl" className={styles.dialog}>
        <div className={styles.columns}>
          <BreakdownList rows={rows.slice(0, half)} total={total} />
          <BreakdownList rows={rows.slice(half)} total={total} />
        </div>
      </Modal>
    </section>
  );
}
