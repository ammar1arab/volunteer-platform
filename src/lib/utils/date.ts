import { DayOfWeek } from "@/core/domain/enums";

const DAYS_BY_UTC_INDEX: DayOfWeek[] = [
  DayOfWeek.SUNDAY,
  DayOfWeek.MONDAY,
  DayOfWeek.TUESDAY,
  DayOfWeek.WEDNESDAY,
  DayOfWeek.THURSDAY,
  DayOfWeek.FRIDAY,
  DayOfWeek.SATURDAY
];

/** Calendar day from a date-only value (YYYY-MM-DD or ISO), independent of local TZ. */
export const dayOfWeekFromDate = (input: Date | string): DayOfWeek => {
  const iso = (typeof input === "string" ? input : input.toISOString()).slice(0, 10);
  const [year, month, day] = iso.split("-").map(Number);
  return DAYS_BY_UTC_INDEX[new Date(Date.UTC(year, month - 1, day)).getUTCDay()];
};

export const formatDateForInput = (date: Date | string): string => {
  const d = typeof date === "string" ? new Date(date) : date;
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

export const calculateAge = (dateOfBirth: Date | string): number => {
  const today = new Date();
  const birthDate =
    typeof dateOfBirth === "string" ? new Date(dateOfBirth) : dateOfBirth;

  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();

  if (
    monthDiff < 0 ||
    (monthDiff === 0 && today.getDate() < birthDate.getDate())
  ) {
    age--;
  }

  return age;
};

export const getMinDateOfBirth = (): string => {
  const date = new Date();
  date.setFullYear(date.getFullYear() - 10);
  return formatDateForInput(date);
};

export const getMaxDateOfBirth = (): string => {
  const date = new Date();
  date.setFullYear(date.getFullYear() - 100);
  return formatDateForInput(date);
};

export const formatDate = (date: Date | string): string => {
  const d = typeof date === "string" ? new Date(date) : date;
  return new Intl.DateTimeFormat("en-GB", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(d);
};

export const formatShortDate = (date: Date | string): string => {
  const d = typeof date === "string" ? new Date(date) : date;
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
  }).format(d);
};

export const AMMAN_TIME_ZONE = "Asia/Amman";
const AMMAN_OFFSET_MS = 3 * 60 * 60 * 1000;

export function ammanDayKey(date: Date): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: AMMAN_TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit"
  }).format(date);
}

export function startOfAmmanDay(daysAgo = 0): Date {
  const [year, month, day] = ammanDayKey(new Date()).split("-").map(Number);
  return new Date(Date.UTC(year, month - 1, day - daysAgo, 0, 0, 0) - AMMAN_OFFSET_MS);
}

export function startOfAmmanMonth(): Date {
  const [year, month] = ammanDayKey(new Date()).split("-").map(Number);
  return new Date(Date.UTC(year, month - 1, 1, 0, 0, 0) - AMMAN_OFFSET_MS);
}

export const formatDateTime = (date: Date | string): string => {
  const d = typeof date === "string" ? new Date(date) : date;
  return new Intl.DateTimeFormat("en-GB", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  }).format(d).toUpperCase();
};

export const formatFullDateTime = (date: Date | string): string => {
  const d = typeof date === "string" ? new Date(date) : date;
  return new Intl.DateTimeFormat("en-GB", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  }).format(d).toUpperCase();
};

/** Date style printed on the issued certificate image, e.g. "2026 / 9 / 19". */
export const formatCertificateDate = (date: Date | string): string => {
  const d = typeof date === "string" ? new Date(date) : date;
  return `${d.getFullYear()} / ${d.getMonth() + 1} / ${d.getDate()}`;
};

export const formatTime = (date: Date | string): string => {
  const d = typeof date === "string" ? new Date(date) : date;
  return new Intl.DateTimeFormat("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  }).format(d);
};

// Kept for backward compatibility while migrating
export const formatDateArabic = formatDateTime;
