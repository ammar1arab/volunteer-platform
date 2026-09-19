import { ReportsRepository, type TrafficDevice, type TrafficSource } from "@/infrastructure/persistence/repositories";
import { serviceError } from "@/core/application/common";
import { ok, type GetReportStatsResponse, type NamedCount, type PulseMetric, type ReportRange } from "@/core/application/dtos";
import {
  ActivityStatus,
  ActivityType,
  AttendanceStatus,
  EducationLevel,
  MeetingAttendeeMatchStatus,
  MeetingReportStatus,
  NotificationType,
  OtpType,
  ParticipationStatus,
  SystemLogStatus,
  isEducationLevel,
  isGender,
  isJordanianCity,
  type JordanianCity
} from "@/core/domain/enums";
import { ammanDayKey, startOfAmmanDay, startOfAmmanMonth } from "@/lib/utils/date";

const RANGE_DAYS: Record<Exclude<ReportRange, "all">, number> = { "7d": 7, "30d": 30, "90d": 90 };
const AGE_KEYS = ["under18", "18_24", "25_34", "35_plus"] as const;
const SCHOOL_LEVELS = new Set<EducationLevel>([
  EducationLevel.KINDERGARTEN,
  EducationLevel.GRADE_1,
  EducationLevel.GRADE_2,
  EducationLevel.GRADE_3,
  EducationLevel.GRADE_4,
  EducationLevel.GRADE_5,
  EducationLevel.GRADE_6,
  EducationLevel.GRADE_7,
  EducationLevel.GRADE_8,
  EducationLevel.GRADE_9,
  EducationLevel.GRADE_10,
  EducationLevel.GRADE_11,
  EducationLevel.GRADE_12
]);

function educationBand(level: string | null) {
  if (!level || !isEducationLevel(level) || level === EducationLevel.OTHER) return "unspecified";
  if (SCHOOL_LEVELS.has(level)) return "school";
  if (level === EducationLevel.DIPLOMA) return "diploma";
  if (level === EducationLevel.BACHELOR) return "bachelor";
  return "postgraduate";
}

function educationBands(rows: { level: string | null; count: number }[]): NamedCount[] {
  const totals = new Map<string, number>();
  for (const row of rows) {
    const key = educationBand(row.level);
    totals.set(key, (totals.get(key) ?? 0) + row.count);
  }
  return [...totals].map(([key, count]) => ({ key, count }));
}

function fillDays(rows: { day: string; count: number }[], days: number) {
  const counts = new Map(rows.map((row) => [row.day, row.count]));
  const series: NamedCount[] = [];
  const cursor = startOfAmmanDay(days - 1);
  for (let i = 0; i < days; i += 1) {
    const key = ammanDayKey(new Date(cursor.getTime() + i * 24 * 60 * 60 * 1000));
    series.push({ key, count: counts.get(key) ?? 0 });
  }
  return series;
}

function buildDailyPulse(volunteerDays: { day: string; count: number }[], requestDays: { day: string; count: number }[], days: number) {
  const volunteers = fillDays(volunteerDays, days);
  const requests = fillDays(requestDays, days);
  return volunteers.map((row, index) => ({
    date: row.key,
    volunteers: row.count,
    requests: requests[index]?.count ?? 0
  }));
}

function metric(current: number, previous: number | null): PulseMetric {
  const change = previous === null ? null : previous === 0 ? (current === 0 ? 0 : 100) : ((current - previous) / previous) * 100;
  return { current, previous, change };
}

function statusCount(rows: { status: string; count: number }[], status: string) {
  return rows.find((row) => row.status === status)?.count ?? 0;
}

function attendanceRate(rows: { status: string; count: number }[]) {
  const attended = statusCount(rows, AttendanceStatus.ATTENDED);
  const marked = attended + statusCount(rows, AttendanceStatus.ABSENT);
  return marked ? (attended / marked) * 100 : 0;
}

function namedFrom<T extends string>(
  rows: { status?: string; type?: string; key?: string; count: number }[],
  allowed: readonly T[],
  pick: (row: { status?: string; type?: string; key?: string }) => string
): NamedCount[] {
  const allowedSet = new Set<string>(allowed);
  return rows
    .filter((row) => allowedSet.has(pick(row)))
    .map((row) => ({ key: pick(row), count: row.count }));
}

class ReportsUseCase {
  private static readonly SCOPE = "ReportsUseCase";

  constructor(private reportsRepository: ReportsRepository) {}

  async getDashboardStats(range: ReportRange = "30d"): Promise<GetReportStatsResponse> {
    try {
      const chartDays = range === "all" ? 90 : RANGE_DAYS[range];
      const start = range === "all" ? null : startOfAmmanDay(chartDays - 1);
      const previousEnd = start;
      const previousStart = start ? startOfAmmanDay(chartDays * 2 - 1) : null;
      const raw = await this.reportsRepository.getDashboardStats({
        start,
        previousStart,
        previousEnd,
        chartStart: startOfAmmanDay(chartDays - 1),
        monthStart: startOfAmmanMonth()
      });
      const currentRate = attendanceRate(raw.currentAttendance);
      const previousRate = raw.previousAttendance ? attendanceRate(raw.previousAttendance) : null;
      const systemErrors = raw.systemLogs
        .filter((row) => row.status === SystemLogStatus.ERROR || row.status === SystemLogStatus.FAILURE)
        .reduce((sum, row) => sum + row.count, 0);

      return ok({
        range,
        chartDays,
        pulse: {
          volunteers: metric(raw.currentVolunteers, raw.previousVolunteers),
          activities: metric(raw.currentActivities, raw.previousActivities),
          requests: metric(raw.currentRequests, raw.previousRequests),
          hours: metric(raw.currentHours, raw.previousHours),
          certificates: metric(raw.currentCertificates, raw.previousCertificates),
          attendanceRate: metric(currentRate, previousRate)
        },
        funnel: {
          requested: raw.currentRequests,
          approved: statusCount(raw.funnelStatuses, ParticipationStatus.APPROVED),
          attended: statusCount(raw.funnelAttendance, AttendanceStatus.ATTENDED)
        },
        requestOutcomes: namedFrom(raw.funnelStatuses, Object.values(ParticipationStatus), (row) => row.status ?? ""),
        dailyPulse: buildDailyPulse(raw.volunteerDays, raw.requestDays, chartDays),
        topCities: raw.cityGroups
          .filter((row): row is { city: JordanianCity; count: number } =>
            row.city !== null && isJordanianCity(row.city)
          )
          .map((row) => ({ city: row.city, count: row.count })),
        cityAge: raw.cityAge
          .filter((row): row is { city: JordanianCity; age: string; count: number } =>
            isJordanianCity(row.city) && AGE_KEYS.includes(row.age as (typeof AGE_KEYS)[number])
          )
          .map((row) => ({ city: row.city, age: row.age, count: row.count })),
        genderSplit: raw.genderGroups.map((row) => ({
          gender: row.gender && isGender(row.gender) ? row.gender : null,
          count: row.count
        })),
        ageGroups: namedFrom(raw.ageGroups, AGE_KEYS, (row) => row.key ?? ""),
        educationBands: educationBands(raw.educationGroups),
        activityStatuses: namedFrom(raw.activityStatuses, Object.values(ActivityStatus), (row) => row.status ?? ""),
        activityTypes: namedFrom(
          raw.activityTypes.map((row) => ({ status: row.type, count: row.count })),
          Object.values(ActivityType),
          (row) => row.status ?? ""
        ),
        attendance: namedFrom(raw.currentAttendance, Object.values(AttendanceStatus), (row) => row.status ?? ""),
        content: {
          posts: raw.postCount,
          postViews: raw.postViews,
          magazines: raw.magazineCount,
          magazineDownloads: raw.magazineDownloads,
          spotlights: raw.spotlightCount,
          activityViews: raw.activityViews
        },
        meetings: {
          withLink: raw.meetingsWithLink,
          reports: namedFrom(raw.meetingReports, Object.values(MeetingReportStatus), (row) => row.status ?? ""),
          attendees: namedFrom(raw.meetingAttendees, Object.values(MeetingAttendeeMatchStatus), (row) => row.status ?? "")
        },
        comms: {
          notifications: raw.notificationsInRange,
          unread: raw.unreadNotifications,
          pendingSignups: raw.pendingSignups,
          notificationTypes: namedFrom(raw.notificationTypes, Object.values(NotificationType), (row) => row.status ?? ""),
          emails: namedFrom(raw.otpEmails, Object.values(OtpType), (row) => row.status ?? "")
        },
        traffic: {
          guests: raw.traffic.guests,
          members: raw.traffic.members,
          devices: [
            { key: "mobile", count: raw.traffic.mobile },
            { key: "desktop", count: raw.traffic.desktop },
            { key: "tablet", count: raw.traffic.tablet }
          ],
          sources: [
            { key: "google", count: raw.traffic.google },
            { key: "instagram", count: raw.traffic.instagram },
            { key: "facebook", count: raw.traffic.facebook },
            { key: "other", count: raw.traffic.other }
          ]
        },
        rafiq: {
          turns: raw.rafiq.turns,
          members: raw.rafiq.members,
          guests: raw.rafiq.guests,
          tokens: raw.rafiq.tokens,
          models: Object.entries(raw.rafiq.models).map(([key, count]) => ({ key, count }))
        },
        system: {
          operations: raw.systemLogs.reduce((sum, row) => sum + row.count, 0),
          errors: systemErrors,
          byStatus: namedFrom(raw.systemLogs, Object.values(SystemLogStatus), (row) => row.status ?? ""),
          hourly: [],
          daily: fillDays(raw.systemDays, chartDays),
          latestAt: raw.latestLogAt ? raw.latestLogAt.toISOString() : null
        },
        lifetime: {
          users: raw.genderGroups.reduce((sum, row) => sum + row.count, 0),
          activities: raw.activityStatuses.reduce((sum, row) => sum + row.count, 0),
          pendingRequests: raw.pendingRequests,
          hours: raw.totalHours,
          certificates: raw.certificatesCount,
          newVolunteersThisMonth: raw.newVolunteersThisMonth
        }
      });
    } catch (error) {
      return serviceError(ReportsUseCase.SCOPE, "getDashboardStats", error, "Failed to fetch stats");
    }
  }

  async recordTraffic(input: { guest: boolean; device: TrafficDevice; source: TrafficSource }) {
    try {
      await this.reportsRepository.incrementTraffic(input);
    } catch (error) {
      serviceError(ReportsUseCase.SCOPE, "recordTraffic", error, "Failed to record traffic");
    }
  }

  async recordChatTurn(input: { guest: boolean; tokens: number; model: string }) {
    try {
      await this.reportsRepository.incrementChat(input);
    } catch (error) {
      serviceError(ReportsUseCase.SCOPE, "recordChatTurn", error, "Failed to record chat");
    }
  }
}

export default ReportsUseCase;
