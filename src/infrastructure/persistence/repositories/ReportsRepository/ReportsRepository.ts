import { prisma } from "@/infrastructure/persistence/prisma";
import { CertificateStatus, UserRole } from "@/core/domain/enums";
import type { Prisma } from "@prisma/client";
import { ammanDayKey } from "@/lib/utils/date";

export interface StatusCount {
  status: string;
  count: number;
}

export interface DashboardStatsQuery {
  totalUsers: number;
  pendingRequests: number;
  activityViews: number;
  postCount: number;
  postViews: number;
  magazineCount: number;
  magazineDownloads: number;
  spotlightCount: number;
  newVolunteersThisMonth: number;
  totalHours: number;
  certificatesCount: number;
  cityGroups: { city: string | null; count: number }[];
  genderGroups: { gender: string | null; count: number }[];
  ageGroups: { key: string; count: number }[];
  educationGroups: { level: string | null; count: number }[];
  cityAge: { city: string; age: string; count: number }[];
  volunteerDays: { day: string; count: number }[];
  requestDays: { day: string; count: number }[];
  systemDays: { day: string; count: number }[];
  currentVolunteers: number;
  previousVolunteers: number | null;
  currentActivities: number;
  previousActivities: number | null;
  currentRequests: number;
  previousRequests: number | null;
  currentHours: number;
  previousHours: number | null;
  currentCertificates: number;
  previousCertificates: number | null;
  currentAttendance: StatusCount[];
  previousAttendance: StatusCount[] | null;
  funnelStatuses: StatusCount[];
  funnelAttendance: StatusCount[];
  activityStatuses: StatusCount[];
  activityTypes: { type: string; count: number }[];
  systemLogs: StatusCount[];
  meetingsWithLink: number;
  meetingReports: StatusCount[];
  meetingAttendees: StatusCount[];
  notificationsInRange: number;
  unreadNotifications: number;
  pendingSignups: number;
  notificationTypes: StatusCount[];
  otpEmails: StatusCount[];
  latestLogAt: Date | null;
  traffic: {
    guests: number;
    members: number;
    mobile: number;
    desktop: number;
    tablet: number;
    google: number;
    instagram: number;
    facebook: number;
    other: number;
  };
  rafiq: {
    turns: number;
    members: number;
    guests: number;
    tokens: number;
    models: Record<string, number>;
  };
  trafficDays: Array<{ day: string; guests: number; members: number; total: number }>;
  rafiqDays: Array<{ day: string; turns: number; members: number; guests: number; tokens: number }>;
}

export interface ReportsWindow {
  start: Date | null;
  previousStart: Date | null;
  previousEnd: Date | null;
  chartStart: Date;
  monthStart: Date;
}

const liveActivity = { deletedAt: null };
const completedCert = { isActive: true, status: CertificateStatus.COMPLETED };

export type TrafficDevice = "mobile" | "desktop" | "tablet";
export type TrafficSource = "google" | "instagram" | "facebook" | "other";

function emptyTraffic() {
  return {
    guests: 0,
    members: 0,
    mobile: 0,
    desktop: 0,
    tablet: 0,
    google: 0,
    instagram: 0,
    facebook: 0,
    other: 0
  };
}

type AnalyticsRow = {
  day: string;
  guests: number;
  members: number;
  mobile: number;
  desktop: number;
  tablet: number;
  google: number;
  instagram: number;
  facebook: number;
  other: number;
  chatTurns: number;
  chatMembers: number;
  chatGuests: number;
  tokens: number;
  models: Prisma.JsonValue;
};

function modelCounts(value: Prisma.JsonValue | null): Record<string, number> {
  if (!value || typeof value !== "object" || Array.isArray(value)) return {};
  const counts: Record<string, number> = {};
  for (const [key, count] of Object.entries(value)) {
    if (typeof count === "number" && Number.isFinite(count)) counts[key] = count;
  }
  return counts;
}

function asStatusCounts(rows: Array<{ status: string; _count: { _all: number } }>): StatusCount[] {
  return rows.map((row) => ({ status: row.status, count: row._count._all }));
}

export default class ReportsRepository {
  async getDashboardStats(window: ReportsWindow): Promise<DashboardStatsQuery> {
    const currentDate = window.start ? { gte: window.start } : undefined;
    const previousDate = window.previousStart && window.previousEnd
      ? { gte: window.previousStart, lt: window.previousEnd }
      : undefined;
    const logDate = currentDate ? { createdAt: currentDate } : undefined;
    const [
      totalUsers,
      pendingRequests,
      systemLogs,
      activityViewsAgg,
      postsAgg,
      magazinesAgg,
      spotlightCount,
      newVolunteersThisMonth,
      hoursAgg,
      certificatesCount,
      cityGroups,
      genderGroups,
      ageGroups,
      educationGroups,
      cityAge,
      volunteerDays,
      requestDays,
      currentVolunteers,
      previousVolunteers,
      currentActivities,
      previousActivities,
      currentRequests,
      previousRequests,
      currentHours,
      previousHours,
      currentCertificates,
      previousCertificates,
      currentAttendance,
      previousAttendance,
      funnelStatuses,
      funnelAttendance,
      activityStatuses,
      activityTypes,
      meetingsWithLink,
      meetingReports,
      meetingAttendees,
      notificationsInRange,
      unreadNotifications,
      pendingSignups,
      notificationTypes,
      otpEmails,
      systemDays,
      latestLog,
      analyticsRows
    ] = await Promise.all([
      prisma.user.count(),
      prisma.activityParticipation.count({ where: { status: "PENDING" } }),
      prisma.systemLog.groupBy({ by: ["status"], where: logDate, _count: { _all: true } }),
      prisma.activity.aggregate({ where: liveActivity, _sum: { views: true } }),
      prisma.featuredPost.aggregate({ _count: { _all: true }, _sum: { views: true } }),
      prisma.monthlyMagazine.aggregate({ _count: { _all: true }, _sum: { downloads: true } }),
      prisma.volunteerSpotlight.count({ where: { isActive: true } }),
      prisma.user.count({ where: { role: UserRole.VOLUNTEER, createdAt: { gte: window.monthStart } } }),
      prisma.volunteerProfile.aggregate({ _sum: { totalVolunteerHours: true } }),
      prisma.certificate.count({ where: completedCert }),
      prisma.volunteerProfile.groupBy({
        by: ["city"],
        _count: { _all: true },
        orderBy: { _count: { city: "desc" } }
      }),
      prisma.volunteerProfile.groupBy({ by: ["gender"], _count: { _all: true } }),
      prisma.$queryRaw<Array<{ key: string; count: number }>>`
        SELECT key, COUNT(*)::int AS count
        FROM (
          SELECT CASE
            WHEN EXTRACT(YEAR FROM AGE(CURRENT_DATE, "dateOfBirth")) < 18 THEN 'under18'
            WHEN EXTRACT(YEAR FROM AGE(CURRENT_DATE, "dateOfBirth")) < 25 THEN '18_24'
            WHEN EXTRACT(YEAR FROM AGE(CURRENT_DATE, "dateOfBirth")) < 35 THEN '25_34'
            ELSE '35_plus'
          END AS key
          FROM volunteer_profiles
        ) ages
        GROUP BY key
      `,
      prisma.volunteerProfile.groupBy({ by: ["educationLevel"], _count: { _all: true } }),
      prisma.$queryRaw<Array<{ city: string; age: string; count: number }>>`
        SELECT city, age, COUNT(*)::int AS count
        FROM (
          SELECT city::text AS city,
            CASE
              WHEN EXTRACT(YEAR FROM AGE(CURRENT_DATE, "dateOfBirth")) < 18 THEN 'under18'
              WHEN EXTRACT(YEAR FROM AGE(CURRENT_DATE, "dateOfBirth")) < 25 THEN '18_24'
              WHEN EXTRACT(YEAR FROM AGE(CURRENT_DATE, "dateOfBirth")) < 35 THEN '25_34'
              ELSE '35_plus'
            END AS age
          FROM volunteer_profiles
        ) rows
        GROUP BY city, age
      `,
      prisma.$queryRaw<Array<{ day: string; count: number }>>`
        SELECT to_char(("createdAt" AT TIME ZONE 'Asia/Amman'), 'YYYY-MM-DD') AS day,
               COUNT(*)::int AS count
        FROM users
        WHERE role::text = ${UserRole.VOLUNTEER} AND "createdAt" >= ${window.chartStart}
        GROUP BY 1
      `,
      prisma.$queryRaw<Array<{ day: string; count: number }>>`
        SELECT to_char(("requestedAt" AT TIME ZONE 'Asia/Amman'), 'YYYY-MM-DD') AS day,
               COUNT(*)::int AS count
        FROM activity_participations
        WHERE "requestedAt" >= ${window.chartStart}
        GROUP BY 1
      `,
      prisma.user.count({ where: { role: UserRole.VOLUNTEER, createdAt: currentDate } }),
      previousDate ? prisma.user.count({ where: { role: UserRole.VOLUNTEER, createdAt: previousDate } }) : Promise.resolve(null),
      prisma.activity.count({ where: { ...liveActivity, createdAt: currentDate } }),
      previousDate ? prisma.activity.count({ where: { ...liveActivity, createdAt: previousDate } }) : Promise.resolve(null),
      prisma.activityParticipation.count({ where: { requestedAt: currentDate } }),
      previousDate ? prisma.activityParticipation.count({ where: { requestedAt: previousDate } }) : Promise.resolve(null),
      prisma.activityParticipation.aggregate({ where: { markedAt: currentDate }, _sum: { volunteerHours: true } }),
      previousDate ? prisma.activityParticipation.aggregate({ where: { markedAt: previousDate }, _sum: { volunteerHours: true } }) : Promise.resolve(null),
      prisma.certificate.count({ where: { ...completedCert, issuedAt: currentDate } }),
      previousDate ? prisma.certificate.count({ where: { ...completedCert, issuedAt: previousDate } }) : Promise.resolve(null),
      prisma.activityParticipation.groupBy({ by: ["attendanceStatus"], where: { markedAt: currentDate }, _count: { _all: true } }),
      previousDate
        ? prisma.activityParticipation.groupBy({ by: ["attendanceStatus"], where: { markedAt: previousDate }, _count: { _all: true } })
        : Promise.resolve(null),
      prisma.activityParticipation.groupBy({ by: ["status"], where: { requestedAt: currentDate }, _count: { _all: true } }),
      prisma.activityParticipation.groupBy({ by: ["attendanceStatus"], where: { requestedAt: currentDate }, _count: { _all: true } }),
      prisma.activity.groupBy({ by: ["status"], where: liveActivity, _count: { _all: true } }),
      prisma.activity.groupBy({ by: ["activityType"], where: liveActivity, _count: { _all: true } }),
      prisma.activity.count({ where: { ...liveActivity, meetingLink: { not: null } } }),
      prisma.activityMeetingReport.groupBy({ by: ["status"], _count: { _all: true } }),
      prisma.activityMeetingAttendee.groupBy({ by: ["matchStatus"], _count: { _all: true } }),
      prisma.notification.count({ where: { isActive: true, createdAt: currentDate } }),
      prisma.notification.count({ where: { isActive: true, isRead: false } }),
      prisma.pendingRegistration.count({ where: { expiresAt: { gt: new Date() } } }),
      prisma.notification.groupBy({
        by: ["type"],
        where: { isActive: true, createdAt: currentDate },
        _count: { _all: true }
      }),
      prisma.otpCode.groupBy({
        by: ["type"],
        where: currentDate ? { createdAt: currentDate } : undefined,
        _count: { _all: true }
      }),
      prisma.$queryRaw<Array<{ day: string; count: number }>>`
        SELECT to_char(("createdAt" AT TIME ZONE 'Asia/Amman'), 'YYYY-MM-DD') AS day,
               COUNT(*)::int AS count
        FROM system_logs
        WHERE "createdAt" >= ${window.chartStart}
        GROUP BY 1
      `,
      prisma.systemLog.findFirst({ orderBy: { createdAt: "desc" }, select: { createdAt: true } }),
      prisma.$queryRaw<AnalyticsRow[]>`
        SELECT day, guests, members, mobile, desktop, tablet, google, instagram, facebook, other,
               "chatTurns", "chatMembers", "chatGuests", tokens, models
        FROM analytics_daily
        WHERE day >= ${window.start ? ammanDayKey(window.start) : "0000-01-01"}
      `
    ]);

    const traffic = emptyTraffic();
    const rafiq = { turns: 0, members: 0, guests: 0, tokens: 0, models: {} as Record<string, number> };
    const trafficDays: Array<{ day: string; guests: number; members: number; total: number }> = [];
    const rafiqDays: Array<{ day: string; turns: number; members: number; guests: number; tokens: number }> = [];
    for (const row of analyticsRows) {
      traffic.guests += row.guests;
      traffic.members += row.members;
      traffic.mobile += row.mobile;
      traffic.desktop += row.desktop;
      traffic.tablet += row.tablet;
      traffic.google += row.google;
      traffic.instagram += row.instagram;
      traffic.facebook += row.facebook;
      traffic.other += row.other;
      rafiq.turns += row.chatTurns;
      rafiq.members += row.chatMembers;
      rafiq.guests += row.chatGuests;
      rafiq.tokens += row.tokens;
      for (const [key, count] of Object.entries(modelCounts(row.models))) {
        rafiq.models[key] = (rafiq.models[key] ?? 0) + count;
      }
      trafficDays.push({
        day: row.day,
        guests: row.guests,
        members: row.members,
        total: row.guests + row.members
      });
      rafiqDays.push({
        day: row.day,
        turns: row.chatTurns,
        members: row.chatMembers,
        guests: row.chatGuests,
        tokens: row.tokens
      });
    }

    return {
      totalUsers,
      pendingRequests,
      activityViews: activityViewsAgg._sum.views ?? 0,
      postCount: postsAgg._count._all,
      postViews: postsAgg._sum.views ?? 0,
      magazineCount: magazinesAgg._count._all,
      magazineDownloads: magazinesAgg._sum.downloads ?? 0,
      spotlightCount,
      newVolunteersThisMonth,
      totalHours: hoursAgg._sum.totalVolunteerHours ?? 0,
      certificatesCount,
      cityGroups: cityGroups.map((row) => ({ city: row.city, count: row._count._all })),
      genderGroups: genderGroups.map((row) => ({ gender: row.gender, count: row._count._all })),
      ageGroups: ageGroups.map((row) => ({ key: row.key, count: Number(row.count) })),
      educationGroups: educationGroups.map((row) => ({ level: row.educationLevel, count: row._count._all })),
      cityAge: cityAge.map((row) => ({ city: row.city, age: row.age, count: Number(row.count) })),
      volunteerDays: volunteerDays.map((row) => ({ day: row.day, count: Number(row.count) })),
      requestDays: requestDays.map((row) => ({ day: row.day, count: Number(row.count) })),
      systemDays: systemDays.map((row) => ({ day: row.day, count: Number(row.count) })),
      currentVolunteers,
      previousVolunteers,
      currentActivities,
      previousActivities,
      currentRequests,
      previousRequests,
      currentHours: currentHours._sum.volunteerHours ?? 0,
      previousHours: previousHours?._sum.volunteerHours ?? (previousHours === null ? null : 0),
      currentCertificates,
      previousCertificates,
      currentAttendance: currentAttendance.map((row) => ({ status: row.attendanceStatus, count: row._count._all })),
      previousAttendance: previousAttendance?.map((row) => ({ status: row.attendanceStatus, count: row._count._all })) ?? null,
      funnelStatuses: asStatusCounts(funnelStatuses),
      funnelAttendance: funnelAttendance.map((row) => ({ status: row.attendanceStatus, count: row._count._all })),
      activityStatuses: asStatusCounts(activityStatuses),
      activityTypes: activityTypes.map((row) => ({ type: row.activityType, count: row._count._all })),
      systemLogs: asStatusCounts(systemLogs),
      meetingsWithLink,
      meetingReports: asStatusCounts(meetingReports),
      meetingAttendees: meetingAttendees.map((row) => ({ status: row.matchStatus, count: row._count._all })),
      notificationsInRange,
      unreadNotifications,
      pendingSignups,
      notificationTypes: notificationTypes.map((row) => ({ status: row.type, count: row._count._all })),
      otpEmails: otpEmails.map((row) => ({ status: row.type, count: row._count._all })),
      latestLogAt: latestLog?.createdAt ?? null,
      traffic,
      rafiq,
      trafficDays,
      rafiqDays
    };
  }

  async incrementTraffic(input: { guest: boolean; device: TrafficDevice; source: TrafficSource }) {
    const day = ammanDayKey(new Date());
    await prisma.$executeRaw`
      INSERT INTO analytics_daily (day, guests, members, mobile, desktop, tablet, google, instagram, facebook, other)
      VALUES (
        ${day},
        ${input.guest ? 1 : 0},
        ${input.guest ? 0 : 1},
        ${input.device === "mobile" ? 1 : 0},
        ${input.device === "desktop" ? 1 : 0},
        ${input.device === "tablet" ? 1 : 0},
        ${input.source === "google" ? 1 : 0},
        ${input.source === "instagram" ? 1 : 0},
        ${input.source === "facebook" ? 1 : 0},
        ${input.source === "other" ? 1 : 0}
      )
      ON CONFLICT (day) DO UPDATE SET
        guests = analytics_daily.guests + EXCLUDED.guests,
        members = analytics_daily.members + EXCLUDED.members,
        mobile = analytics_daily.mobile + EXCLUDED.mobile,
        desktop = analytics_daily.desktop + EXCLUDED.desktop,
        tablet = analytics_daily.tablet + EXCLUDED.tablet,
        google = analytics_daily.google + EXCLUDED.google,
        instagram = analytics_daily.instagram + EXCLUDED.instagram,
        facebook = analytics_daily.facebook + EXCLUDED.facebook,
        other = analytics_daily.other + EXCLUDED.other
    `;
  }

  async incrementChat(input: { guest: boolean; tokens: number; model: string }) {
    const day = ammanDayKey(new Date());
    const existing = await prisma.$queryRaw<Array<{ models: Prisma.JsonValue }>>`
      SELECT models FROM analytics_daily WHERE day = ${day}
    `;
    const models = modelCounts(existing[0]?.models ?? null);
    models[input.model] = (models[input.model] ?? 0) + 1;
    const payload = JSON.stringify(models);
    await prisma.$executeRaw`
      INSERT INTO analytics_daily (day, "chatTurns", "chatMembers", "chatGuests", tokens, models)
      VALUES (
        ${day},
        1,
        ${input.guest ? 0 : 1},
        ${input.guest ? 1 : 0},
        ${input.tokens},
        CAST(${payload} AS JSONB)
      )
      ON CONFLICT (day) DO UPDATE SET
        "chatTurns" = analytics_daily."chatTurns" + 1,
        "chatMembers" = analytics_daily."chatMembers" + EXCLUDED."chatMembers",
        "chatGuests" = analytics_daily."chatGuests" + EXCLUDED."chatGuests",
        tokens = analytics_daily.tokens + EXCLUDED.tokens,
        models = CAST(${payload} AS JSONB)
    `;
  }
}
