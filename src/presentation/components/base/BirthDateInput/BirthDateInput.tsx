"use client";
import { useMemo, useState, useEffect } from "react";
import { SelectInput } from "@/presentation/components";
import styles from "./BirthDateInput.module.scss";

interface BirthDateInputProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
  error?: string;
  minAge?: number;
  maxAge?: number;
  allowFuture?: boolean;
}

const MONTHS = [
  { value: "01", label: "يناير" },
  { value: "02", label: "فبراير" },
  { value: "03", label: "مارس" },
  { value: "04", label: "أبريل" },
  { value: "05", label: "مايو" },
  { value: "06", label: "يونيو" },
  { value: "07", label: "يوليو" },
  { value: "08", label: "أغسطس" },
  { value: "09", label: "سبتمبر" },
  { value: "10", label: "أكتوبر" },
  { value: "11", label: "نوفمبر" },
  { value: "12", label: "ديسمبر" },
];

const BirthDateInput = ({
  label,
  value,
  onChange,
  required = false,
  error,
  minAge = 0,
  maxAge = 100,
  allowFuture = false,
}: BirthDateInputProps) => {
  const currentYear = new Date().getFullYear();
  
  const range = useMemo(() => {
    if (allowFuture) {
      return {
        min: currentYear,
        max: currentYear + 10 
      };
    }
    return {
      min: currentYear - maxAge,
      max: currentYear - minAge
    };
  }, [currentYear, minAge, maxAge, allowFuture]);

  const [year, setYear] = useState("");
  const [month, setMonth] = useState("");
  const [day, setDay] = useState("");

  useEffect(() => {
    if (!value) {
      setYear("");
      setMonth("");
      setDay("");
      return;
    }
    const [y, m, d] = value.split("-");
    setYear(y ?? "");
    setMonth(m ?? "");
    setDay(d ?? "");
  }, [value]);

  const years = useMemo(() =>
    Array.from({ length: range.max - range.min + 1 }, (_, i) => {
      const y = allowFuture ? range.min + i : range.max - i;
      return { value: String(y), label: String(y) };
    }),
  [range, allowFuture]);

  const days = useMemo(() => {
    if (!year || !month) return [];
    const count = new Date(Number(year), Number(month), 0).getDate();
    return Array.from({ length: count }, (_, i) => {
      const d = String(i + 1).padStart(2, "0");
      return { value: d, label: d };
    });
  }, [year, month]);

  const emit = (y: string, m: string, d: string) => {
    if (y && m && d) {
      onChange(`${y}-${m}-${d}`);
    }
  };

  const handleYearChange = (y: string) => {
    setYear(y);
    const maxDays = month ? new Date(Number(y), Number(month), 0).getDate() : 0;
    const validDay = maxDays && Number(day) <= maxDays ? day : "";
    if (!validDay) setDay("");
    emit(y, month, validDay);
  };

  const handleMonthChange = (m: string) => {
    setMonth(m);
    const maxDays = year ? new Date(Number(year), Number(m), 0).getDate() : 0;
    const validDay = maxDays && Number(day) <= maxDays ? day : "";
    if (!validDay) setDay("");
    emit(year, m, validDay);
  };

  const handleDayChange = (d: string) => {
    setDay(d);
    emit(year, month, d);
  };

  return (
    <div className={styles.wrapper}>
      {label && (
        <label className={styles.label}>
          {label}
          {required && <span className={styles.required}>*</span>}
        </label>
      )}
      <div className={styles.row}>
        <div className={styles.col}>
          <SelectInput
            label=""
            placeholder="السنة"
            value={year}
            options={years}
            onChange={handleYearChange}
          />
        </div>
        <div className={styles.col}>
          <SelectInput
            label=""
            placeholder="الشهر"
            value={month}
            options={MONTHS}
            onChange={handleMonthChange}
            disabled={!year}
          />
        </div>
        <div className={styles.col}>
          <SelectInput
            label=""
            placeholder="اليوم"
            value={day}
            options={days}
            onChange={handleDayChange}
            disabled={!year || !month}
          />
        </div>
      </div>
      {error && <span className={styles.errorText}>{error}</span>}
    </div>
  );
};

export default BirthDateInput;