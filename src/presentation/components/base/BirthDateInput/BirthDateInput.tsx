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
  const today = new Date();
  const currentYear = today.getFullYear();
  const currentMonth = today.getMonth() + 1;
  const currentDay = today.getDate();

  const MIN_YEAR = allowFuture ? currentYear : currentYear - maxAge;
  const MAX_YEAR = allowFuture ? currentYear + 2 : currentYear - minAge;

  const [year, setYear] = useState("");
  const [month, setMonth] = useState("");
  const [day, setDay] = useState("");

  useEffect(() => {
    if (value) {
      const [y, m, d] = value.split("-");
      setYear(y || "");
      setMonth(m || "");
      setDay(d || "");
    }
  }, [value]);

  const years = useMemo(
    () =>
      Array.from({ length: MAX_YEAR - MIN_YEAR + 1 }, (_, i) => {
        const y = allowFuture ? MIN_YEAR + i : MAX_YEAR - i;
        return { value: String(y), label: String(y) };
      }),
    [MIN_YEAR, MAX_YEAR, allowFuture]
  );

  const ALL_MONTHS = [
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

  const months = useMemo(() => {
    if (!allowFuture && Number(year) === MAX_YEAR) {
      return ALL_MONTHS.filter((m) => Number(m.value) <= currentMonth);
    }
    return ALL_MONTHS;
  }, [year, MAX_YEAR, currentMonth, allowFuture]);

  const daysInMonth = (y: number, m: number) => new Date(y, m, 0).getDate();

  const days = useMemo(() => {
    if (!year || !month) return [];
    const count = daysInMonth(Number(year), Number(month));
    const maxDay =
      !allowFuture && Number(year) === MAX_YEAR && Number(month) === currentMonth
        ? currentDay
        : count;
    return Array.from({ length: maxDay }, (_, i) => {
      const d = String(i + 1).padStart(2, "0");
      return { value: d, label: d };
    });
  }, [year, month, MAX_YEAR, currentMonth, currentDay, allowFuture]);

  const handleYearChange = (y: string) => {
    setYear(y);
    if (y && month && day) {
      const maxDays = daysInMonth(Number(y), Number(month));
      const validDay = Number(day) <= maxDays ? day : "";
      if (validDay) onChange(`${y}-${month}-${validDay}`);
    }
  };

  const handleMonthChange = (m: string) => {
    setMonth(m);
    if (year && m && day) {
      const maxDays = daysInMonth(Number(year), Number(m));
      const validDay = Number(day) <= maxDays ? day : "";
      if (validDay) onChange(`${year}-${m}-${validDay}`);
    }
  };

  const handleDayChange = (d: string) => {
    setDay(d);
    if (year && month && d) onChange(`${year}-${month}-${d}`);
  };

  return (
    <div className={styles.wrapper}>
      <label className={styles.label}>
        {label}
        {required && <span className={styles.required}>*</span>}
      </label>
      <div className={styles.row}>
        <div className={styles.col}>
          <SelectInput
            label=""
            value={year}
            options={years}
            placeholder="السنة"
            onChange={handleYearChange}
          />
        </div>
        <div className={styles.col}>
          <SelectInput
            label=""
            value={month}
            options={months}
            placeholder="الشهر"
            onChange={handleMonthChange}
          />
        </div>
        <div className={styles.col}>
          <SelectInput
            label=""
            value={day}
            options={days}
            placeholder="اليوم"
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