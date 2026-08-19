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

export const formatDateArabic = (date: Date | string): string => {
  const d = typeof date === "string" ? new Date(date) : date;
  return new Intl.DateTimeFormat("en-GB", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  }).format(d).replace(/, /g, " at "); // e.g. "11 Aug 2024 at 10:30 am"
};
