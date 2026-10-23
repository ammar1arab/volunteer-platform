import { Prisma } from "@prisma/client";
import { prisma } from "@/infrastructure/persistence/prisma";
import type { NamedCount } from "@/core/application/dtos/report.dto";
import type { TrafficBreakdownDto, VisitorTrafficDto } from "@/core/application/dtos/report.dto";
import { ammanDayKey } from "@/lib/utils/date";
import type { TrafficDevice, TrafficSource } from "./ReportsRepository";

export interface RecordVisitorInput {
  visitorKey: string;
  volunteerKey: string | null;
  device: TrafficDevice;
  source: TrafficSource;
  country?: string;
  city?: string;
  browser: string;
  operatingSystem: string;
}

export interface VisitorDayRow {
  identity: string;
  member: boolean;
  visitorFirstSeen: Date;
  day: string;
  device: string;
  source: string;
  country: string | null;
  city: string | null;
  browser: string;
  operatingSystem: string;
}

export interface LegacyTrafficRow {
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
  countries: Prisma.JsonValue;
  cities: Prisma.JsonValue;
  browsers: Prisma.JsonValue;
  operatingSystems: Prisma.JsonValue;
}

export function summarizeLegacyTraffic(rows: LegacyTrafficRow[]): TrafficBreakdownDto {
  const sum = (key: "guests" | "members" | "mobile" | "desktop" | "tablet" | "google" | "instagram" | "facebook" | "other") =>
    rows.reduce((total, row) => total + row[key], 0);
  const dimension = (key: "countries" | "cities" | "browsers" | "operatingSystems") => {
    const counts = new Map<string, number>();
    for (const row of rows) {
      const value = row[key];
      if (!value || typeof value !== "object" || Array.isArray(value)) continue;
      for (const [name, count] of Object.entries(value)) {
        if (typeof count === "number" && Number.isFinite(count)) counts.set(name, (counts.get(name) ?? 0) + count);
      }
    }
    return [...counts].map(([key, count]) => ({ key, count })).sort((a, b) => b.count - a.count);
  };
  return {
    guests: sum("guests"), members: sum("members"),
    devices: (["mobile", "desktop", "tablet"] as const).map((key) => ({ key, count: sum(key) })).sort((a, b) => b.count - a.count),
    sources: (["google", "instagram", "facebook", "other"] as const).map((key) => ({ key, count: sum(key) })).sort((a, b) => b.count - a.count),
    countries: dimension("countries"), cities: dimension("cities"),
    browsers: dimension("browsers"), operatingSystems: dimension("operatingSystems"),
    daily: rows.map((row) => ({ date: row.day, guests: row.guests, members: row.members, total: row.guests + row.members }))
      .sort((a, b) => a.date.localeCompare(b.date))
  };
}

export function recordVisitorQuery(input: RecordVisitorInput, now = new Date()) {
  return Prisma.sql`
    WITH identity AS (
      INSERT INTO analytics_visitors (key, "volunteerKey", "firstSeen")
      VALUES (${input.visitorKey}, ${input.volunteerKey}, ${now})
      ON CONFLICT (key) DO UPDATE SET
        "volunteerKey" = COALESCE(EXCLUDED."volunteerKey", analytics_visitors."volunteerKey")
      WHERE analytics_visitors."volunteerKey" IS NULL
         OR EXCLUDED."volunteerKey" IS NULL
         OR analytics_visitors."volunteerKey" = EXCLUDED."volunteerKey"
      RETURNING key
    ), observation AS (
      INSERT INTO analytics_visitor_days
        ("visitorKey", day, "firstSeen", device, source, country, city, browser, "operatingSystem")
      SELECT key, ${ammanDayKey(now)}, ${now}, ${input.device}, ${input.source},
             ${input.country ?? null}, ${input.city ?? null}, ${input.browser}, ${input.operatingSystem}
      FROM identity
      ON CONFLICT ("visitorKey", day) DO NOTHING
    )
    SELECT EXISTS (SELECT 1 FROM identity) AS recorded
  `;
}

export function visitorDaysQuery(start: Date | null, end = new Date()) {
  return Prisma.sql`
    WITH identities AS (
      SELECT key, COALESCE("volunteerKey", key) AS identity,
             "volunteerKey" IS NOT NULL AS member,
             MIN("firstSeen") OVER (PARTITION BY COALESCE("volunteerKey", key)) AS "visitorFirstSeen"
      FROM analytics_visitors
    )
    SELECT i.identity, i.member, i."visitorFirstSeen", d.day, d.device, d.source,
           d.country, d.city, d.browser, d."operatingSystem"
    FROM analytics_visitor_days d JOIN identities i ON i.key = d."visitorKey"
    WHERE d.day >= ${start ? ammanDayKey(start) : "0000-01-01"} AND d.day <= ${ammanDayKey(end)}
    ORDER BY d."firstSeen", d."visitorKey"
  `;
}

function countDimension(rows: VisitorDayRow[], key: "device" | "source" | "country" | "city" | "browser" | "operatingSystem"): NamedCount[] {
  const counts = new Map<string, number>();
  for (const row of rows) {
    const value = row[key] ?? "غير محدد";
    counts.set(value, (counts.get(value) ?? 0) + 1);
  }
  return [...counts].map(([key, count]) => ({ key, count })).sort((a, b) => b.count - a.count);
}

export function summarizeVisitors(rows: VisitorDayRow[], start: Date | null, trackingStartedAt: string | null): VisitorTrafficDto {
  const visitors = new Map<string, VisitorDayRow>();
  const days = new Map<string, Map<string, boolean>>();
  for (const row of rows) {
    if (!visitors.has(row.identity)) visitors.set(row.identity, row);
    const day = days.get(row.day) ?? new Map<string, boolean>();
    day.set(row.identity, row.member);
    days.set(row.day, day);
  }
  const unique = [...visitors.values()];
  const members = unique.filter((row) => row.member).length;
  const newVisitors = unique.filter((row) => !start || row.visitorFirstSeen >= start).length;
  const daily = [...days].sort(([a], [b]) => a.localeCompare(b)).map(([date, visitors]) => {
    const members = [...visitors.values()].filter(Boolean).length;
    return { date, members, guests: visitors.size - members, total: visitors.size };
  });
  const peakDay = daily.reduce<VisitorTrafficDto["peakDay"]>((peak, row) =>
    !peak || row.total > peak.count ? { date: row.date, count: row.total } : peak, null);
  return {
    available: true,
    trackingStartedAt,
    newVisitors,
    returningVisitors: unique.length - newVisitors,
    peakDay,
    guests: unique.length - members,
    members,
    devices: countDimension(unique, "device"),
    sources: countDimension(unique, "source"),
    countries: countDimension(unique, "country"),
    cities: countDimension(unique, "city"),
    browsers: countDimension(unique, "browser"),
    operatingSystems: countDimension(unique, "operatingSystem"),
    daily
  };
}

export default class VisitorAnalyticsRepository {
  async record(input: RecordVisitorInput): Promise<boolean> {
    const [result] = await prisma.$queryRaw<Array<{ recorded: boolean }>>(recordVisitorQuery(input));
    return result?.recorded ?? false;
  }

  async getTraffic(start: Date | null): Promise<VisitorTrafficDto> {
    try {
      const [tables] = await prisma.$queryRaw<Array<{ ready: boolean }>>`
        SELECT to_regclass('analytics_visitors') IS NOT NULL
           AND to_regclass('analytics_visitor_days') IS NOT NULL AS ready
      `;
      if (!tables?.ready) return { ...summarizeVisitors([], start, null), available: false };
      const [rows, [first]] = await Promise.all([
        prisma.$queryRaw<VisitorDayRow[]>(visitorDaysQuery(start)),
        prisma.$queryRaw<Array<{ day: string | null }>>`SELECT MIN(day) AS day FROM analytics_visitor_days`
      ]);
      return summarizeVisitors(rows, start, first?.day ?? null);
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2010" && error.meta?.code === "42P01") {
        return { ...summarizeVisitors([], start, null), available: false };
      }
      throw error;
    }
  }
}
