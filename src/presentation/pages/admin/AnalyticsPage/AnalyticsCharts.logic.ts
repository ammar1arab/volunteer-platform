import {
  ActivityStatus,
  ActivityType,
  AttendanceStatus,
  Gender,
  MeetingAttendeeMatchStatus,
  MeetingReportStatus,
  NotificationType,
  OtpType,
  ParticipationStatus,
  SystemLogStatus,
  type JordanianCity
} from "@/core/domain/enums";
import {
  getActivityStatusLabel,
  getActivityTypeLabel,
  getAttendanceStatusLabel,
  getCityLabel,
  getGenderLabel,
  getNotificationTypeLabel,
  getParticipationStatusLabel
} from "@/presentation/constants";
import type { CityAgeCount, CityCount, DailyPulse, GenderCount, JoinFunnel, NamedCount } from "@/presentation/types/reports";
import { formatShortDate } from "@/lib/utils/date";
import { formatNumber } from "@/lib/utils/text";

export const GREEN = "#22c55e";
export const TEAL = "#14d4c4";
export const PURPLE = "#8b5cf6";
export const PINK = "#fb4b8d";
export const BLUE = "#3b82f6";
export const AMBER = "#f59e0b";
export const RED = "#ef4444";
export const INK = "#111111";

export const AGE_ORDER = ["under18", "18_24", "25_34", "35_plus"] as const;
export const AGE_LABELS: Record<string, string> = {
  under18: "أقل من 18",
  "18_24": "18-24",
  "25_34": "25-34",
  "35_plus": "35+"
};
export const EDUCATION_LABELS: Record<string, string> = {
  school: "مدرسي",
  diploma: "دبلوم",
  bachelor: "بكالوريوس",
  postgraduate: "دراسات عليا",
  unspecified: "غير محدد"
};
export const AGE_COLORS: Record<string, string> = {
  under18: TEAL,
  "18_24": PURPLE,
  "25_34": PINK,
  "35_plus": AMBER
};
export const EDUCATION_COLORS: Record<string, string> = {
  school: GREEN,
  diploma: BLUE,
  bachelor: PURPLE,
  postgraduate: TEAL,
  unspecified: AMBER
};

export const REPORT_LABELS: Record<MeetingReportStatus, string> = {
  [MeetingReportStatus.PENDING]: "بانتظار",
  [MeetingReportStatus.IMPORTED]: "مستورد",
  [MeetingReportStatus.REVIEWED]: "مراجع",
  [MeetingReportStatus.UNAVAILABLE]: "غير متاح",
  [MeetingReportStatus.FAILED]: "فشل"
};

export const MATCH_LABELS: Record<MeetingAttendeeMatchStatus, string> = {
  [MeetingAttendeeMatchStatus.UNMATCHED]: "غير مطابق",
  [MeetingAttendeeMatchStatus.MATCHED]: "مطابق",
  [MeetingAttendeeMatchStatus.CONFIRMED]: "مؤكد",
  [MeetingAttendeeMatchStatus.REJECTED]: "مرفوض"
};

export const LOG_LABELS: Record<SystemLogStatus, string> = {
  [SystemLogStatus.SUCCESS]: "نجاح",
  [SystemLogStatus.ERROR]: "خطأ",
  [SystemLogStatus.FAILURE]: "فشل"
};

export type ChartRow = { label: string; value: number; color: string };

export function labeled<T extends string>(
  rows: NamedCount[],
  isKey: (value: string) => value is T,
  labelOf: (key: T) => string,
  colorOf: (key: T) => string
): ChartRow[] {
  return (rows ?? [])
    .filter((row): row is NamedCount & { key: T } => isKey(row.key))
    .map((row) => ({ label: labelOf(row.key), value: row.count, color: colorOf(row.key) }));
}

export const isActivityStatus = (value: string): value is ActivityStatus =>
  Object.values(ActivityStatus).includes(value as ActivityStatus);
export const isActivityType = (value: string): value is ActivityType =>
  Object.values(ActivityType).includes(value as ActivityType);
export const isAttendance = (value: string): value is AttendanceStatus =>
  Object.values(AttendanceStatus).includes(value as AttendanceStatus);
export const isParticipation = (value: string): value is ParticipationStatus =>
  Object.values(ParticipationStatus).includes(value as ParticipationStatus);
export const isReportStatus = (value: string): value is MeetingReportStatus =>
  Object.values(MeetingReportStatus).includes(value as MeetingReportStatus);
export const isMatchStatus = (value: string): value is MeetingAttendeeMatchStatus =>
  Object.values(MeetingAttendeeMatchStatus).includes(value as MeetingAttendeeMatchStatus);
export const isLogStatus = (value: string): value is SystemLogStatus =>
  Object.values(SystemLogStatus).includes(value as SystemLogStatus);

export function dailyPoints(dailyPulse: DailyPulse[]) {
  return dailyPulse.map((row) => ({
    ...row,
    label: formatShortDate(new Date(`${row.date}T00:00:00+03:00`))
  }));
}

export function funnelRows(funnel?: JoinFunnel): ChartRow[] {
  if (!funnel) return [];
  return [
    { label: "طلبات", value: funnel.requested, color: PURPLE },
    { label: "مقبولة", value: funnel.approved, color: TEAL },
    { label: "حضور", value: funnel.attended, color: PINK }
  ];
}

export function cityRows(topCities: CityCount[]): ChartRow[] {
  return [...topCities].reverse().map((row, index) => ({
    label: getCityLabel(row.city),
    value: row.count,
    color: [GREEN, PURPLE, PINK, BLUE, TEAL, AMBER][index % 6]
  }));
}

export const DEVICE_LABELS: Record<string, string> = {
  mobile: "جوال",
  desktop: "كمبيوتر",
  tablet: "لوحي"
};

export const SOURCE_LABELS: Record<string, string> = {
  google: "Google",
  instagram: "إنستغرام",
  facebook: "فيسبوك",
  other: "غير ذلك"
};

export const RAFIQ_MODEL_LABELS: Record<string, string> = {
  faq: "رد جاهز",
  nebula: "Nebula",
  quasar: "Quasar",
  andromeda: "Andromeda",
  polaris: "Polaris"
};

export function joinedCounts(rows: NamedCount[], labels: Record<string, string>) {
  return rows
    .filter((row) => row.count > 0)
    .map((row) => `${labels[row.key] ?? row.key} ${formatNumber(row.count)}`)
    .join(" · ");
}

export function genderRows(genderSplit: GenderCount[]) {
  return genderSplit.map((row) => ({
    label: row.gender ? getGenderLabel(row.gender) : "غير محدد",
    value: row.count,
    color: row.gender === Gender.MALE ? BLUE : row.gender === Gender.FEMALE ? PINK : AMBER
  }));
}

export function ageRows(ageGroups: NamedCount[]): ChartRow[] {
  return AGE_ORDER.flatMap((key) => {
    const row = ageGroups.find((item) => item.key === key);
    return row ? [{ label: AGE_LABELS[key], value: row.count, color: AGE_COLORS[key] }] : [];
  });
}

export function educationRows(educationBands: NamedCount[]): ChartRow[] {
  return educationBands.map((row) => ({
    label: EDUCATION_LABELS[row.key] ?? row.key,
    value: row.count,
    color: EDUCATION_COLORS[row.key] ?? INK
  }));
}

export function outcomeRows(requestOutcomes: NamedCount[]) {
  return labeled(
    requestOutcomes,
    isParticipation,
    getParticipationStatusLabel,
    (key) =>
      key === ParticipationStatus.APPROVED
        ? TEAL
        : key === ParticipationStatus.REJECTED
          ? RED
          : key === ParticipationStatus.PENDING
            ? AMBER
            : PURPLE
  );
}

export function activityStatusRows(rows: NamedCount[]) {
  return labeled(
    rows,
    isActivityStatus,
    getActivityStatusLabel,
    (key) => (key === ActivityStatus.PUBLISHED ? GREEN : key === ActivityStatus.CANCELLED ? RED : BLUE)
  );
}

export function activityTypeRows(rows: NamedCount[]) {
  return labeled(rows, isActivityType, getActivityTypeLabel, (key) => (key === ActivityType.IN_PERSON ? PURPLE : PINK));
}

export function attendanceRows(rows: NamedCount[]) {
  return labeled(
    rows,
    isAttendance,
    getAttendanceStatusLabel,
    (key) => (key === AttendanceStatus.ATTENDED ? TEAL : key === AttendanceStatus.ABSENT ? RED : AMBER)
  );
}

export function reportRows(rows: NamedCount[]) {
  return labeled(
    rows,
    isReportStatus,
    (key) => REPORT_LABELS[key],
    (key) => (key === MeetingReportStatus.FAILED ? RED : key === MeetingReportStatus.REVIEWED ? TEAL : PURPLE)
  );
}

export function matchRows(rows: NamedCount[]) {
  return labeled(
    rows,
    isMatchStatus,
    (key) => MATCH_LABELS[key],
    (key) => (key === MeetingAttendeeMatchStatus.UNMATCHED ? RED : key === MeetingAttendeeMatchStatus.CONFIRMED ? TEAL : BLUE)
  );
}

export function logRows(rows: NamedCount[]) {
  return labeled(rows, isLogStatus, (key) => LOG_LABELS[key], (key) => (key === SystemLogStatus.SUCCESS ? GREEN : RED));
}

const isNotification = (value: string): value is NotificationType =>
  Object.values(NotificationType).includes(value as NotificationType);
const isOtp = (value: string): value is OtpType => Object.values(OtpType).includes(value as OtpType);

export function notificationRows(rows: NamedCount[]) {
  return labeled(
    rows,
    isNotification,
    getNotificationTypeLabel,
    (key) =>
      key === NotificationType.PARTICIPATION_APPROVED || key === NotificationType.CERTIFICATE_ISSUED || key === NotificationType.WELCOME
        ? TEAL
        : key === NotificationType.PARTICIPATION_REJECTED || key === NotificationType.ACTIVITY_CANCELLED
          ? RED
          : key === NotificationType.ANNOUNCEMENT
            ? AMBER
            : PURPLE
  );
}

export function emailRows(rows: NamedCount[]) {
  return labeled(
    rows,
    isOtp,
    (key) => (key === OtpType.EMAIL_VERIFY ? "تفعيل الحساب" : "استعادة كلمة المرور"),
    (key) => (key === OtpType.EMAIL_VERIFY ? BLUE : AMBER)
  );
}

export function hourRows(rows: NamedCount[]): ChartRow[] {
  return rows.map((row) => ({
    label: `${row.key}:00`,
    value: row.count,
    color: PURPLE
  }));
}

export function loadDayRows(rows: NamedCount[]): ChartRow[] {
  return rows.map((row) => ({
    label: formatShortDate(new Date(`${row.key}T00:00:00+03:00`)),
    value: row.count,
    color: TEAL
  }));
}

export type CityAgeRow = { city: string } & Record<(typeof AGE_ORDER)[number], number>;

export function cityAgeStacks(rows: CityAgeCount[]) {
  const totals = new Map<JordanianCity, number>();
  for (const row of rows) totals.set(row.city, (totals.get(row.city) ?? 0) + row.count);
  const top = [...totals.entries()].sort((a, b) => b[1] - a[1]).slice(0, 8).map(([city]) => city);
  const byCity = new Map<JordanianCity, CityAgeRow>();
  for (const city of top) {
    byCity.set(city, { city: getCityLabel(city), under18: 0, "18_24": 0, "25_34": 0, "35_plus": 0 });
  }
  for (const row of rows) {
    const current = byCity.get(row.city);
    if (!current || !AGE_ORDER.includes(row.age as (typeof AGE_ORDER)[number])) continue;
    current[row.age as (typeof AGE_ORDER)[number]] = row.count;
  }
  const data = top.flatMap((city) => {
    const item = byCity.get(city);
    return item ? [item] : [];
  });
  const ageTotals = AGE_ORDER.map((age) => ({
    key: age,
    label: AGE_LABELS[age],
    color: AGE_COLORS[age],
    count: data.reduce((sum, row) => sum + row[age], 0)
  }));
  const grand = ageTotals.reduce((sum, row) => sum + row.count, 0);
  return { data, ageTotals, grand };
}

export function percent(value: number, total: number) {
  return total > 0 ? Math.round((value / total) * 100) : 0;
}
