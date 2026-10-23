"use client";

import { useState } from "react";
import { Search } from "@/presentation/components";
import type { TrafficBreakdownDto } from "@/core/application/dtos/report.dto";
import { formatNumber } from "@/lib/utils/text";
import { DEVICE_LABELS, SOURCE_LABELS } from "./AnalyticsCharts.logic";
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
const COUNTRIES = new Intl.DisplayNames(["ar"], { type: "region" });

function itemLabel(group: Group, key: string): string {
  if (group === "devices") return DEVICE_LABELS[key] ?? key;
  if (group === "sources") return SOURCE_LABELS[key] ?? key;
  if (group === "countries" && /^[A-Z]{2}$/.test(key)) return key === "PS" ? "فلسطين" : COUNTRIES.of(key) ?? key;
  return key;
}

export default function VisitorDetails({ data, unique }: { data: TrafficBreakdownDto; unique: boolean }) {
  const [group, setGroup] = useState<Group>("sources");
  const [query, setQuery] = useState("");
  const [expanded, setExpanded] = useState(false);
  const rows = data[group].map((row) => ({ ...row, label: itemLabel(group, row.key) }))
    .sort((a, b) => b.count - a.count);
  const filtered = rows.filter((row) => row.label.toLocaleLowerCase().includes(query.trim().toLocaleLowerCase()));
  const visible = expanded || query.trim() ? filtered : filtered.slice(0, 8);
  const total = data.guests + data.members;

  return (
    <div className={styles.details}>
      <div className={styles.toolbar}>
        <div className={styles.categories} role="group" aria-label="تفاصيل الزيارات">
          {GROUPS.map((item) => (
            <button key={item.key} type="button" aria-pressed={group === item.key}
              onClick={() => { setGroup(item.key); setQuery(""); setExpanded(false); }}>
              {item.label}
            </button>
          ))}
        </div>
        {rows.length > 8 && <div className={styles.search}>
          <Search value={query} onChange={setQuery} onSearch={setQuery} placeholder="ابحث في النتائج" />
        </div>}
      </div>
      <div className={styles.scroll}>
        <table className={styles.table}>
          <caption className={styles.caption}>{GROUPS.find((item) => item.key === group)?.label}</caption>
          <thead><tr><th scope="col">الاسم</th><th scope="col">{unique ? "الزوار" : "الزيارات"}</th><th scope="col">النسبة</th></tr></thead>
          <tbody>
            {visible.map((row) => <tr key={row.key}>
              <th scope="row">{row.label}</th>
              <td>{formatNumber(row.count)}</td>
              <td><div className={styles.share}>
                <span>{total ? formatNumber(row.count / total * 100, { maximumFractionDigits: 2 }) : "0"}%</span>
                <span className={styles.track} aria-hidden="true"><i style={{ width: `${total ? Math.min(100, row.count / total * 100) : 0}%` }} /></span>
              </div></td>
            </tr>)}
            {!visible.length && <tr><td colSpan={3} className={styles.empty}>لا توجد نتائج</td></tr>}
          </tbody>
        </table>
      </div>
      {!query.trim() && rows.length > 8 && <button type="button" className={styles.expand} onClick={() => setExpanded((value) => !value)}>
        {expanded ? "عرض أقل" : `عرض الكل (${formatNumber(rows.length)})`}
      </button>}
    </div>
  );
}
