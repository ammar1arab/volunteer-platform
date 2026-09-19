import type { Gender, JordanianCity } from "@/core/domain/enums";
import type { Result } from "./base.dto";

export interface CityCount {
  city: JordanianCity;
  count: number;
}

export interface GenderCount {
  gender: Gender | null;
  count: number;
}

export type ReportRange = "7d" | "30d" | "90d" | "all";

export interface DailyPulse {
  date: string;
  volunteers: number;
  requests: number;
}

export interface PulseMetric {
  current: number;
  previous: number | null;
  change: number | null;
}

export interface JoinFunnel {
  requested: number;
  approved: number;
  attended: number;
}

export interface NamedCount {
  key: string;
  count: number;
}

export interface CityAgeCount {
  city: JordanianCity;
  age: string;
  count: number;
}

export interface DashboardStatsDto {
  range: ReportRange;
  chartDays: number;
  pulse: {
    volunteers: PulseMetric;
    activities: PulseMetric;
    requests: PulseMetric;
    hours: PulseMetric;
    certificates: PulseMetric;
    attendanceRate: PulseMetric;
  };
  funnel: JoinFunnel;
  requestOutcomes: NamedCount[];
  dailyPulse: DailyPulse[];
  topCities: CityCount[];
  cityAge: CityAgeCount[];
  genderSplit: GenderCount[];
  ageGroups: NamedCount[];
  educationBands: NamedCount[];
  activityStatuses: NamedCount[];
  activityTypes: NamedCount[];
  attendance: NamedCount[];
  content: {
    posts: number;
    postViews: number;
    magazines: number;
    magazineDownloads: number;
    spotlights: number;
    activityViews: number;
  };
  meetings: {
    withLink: number;
    reports: NamedCount[];
    attendees: NamedCount[];
  };
  comms: {
    notifications: number;
    unread: number;
    pendingSignups: number;
    notificationTypes: NamedCount[];
    emails: NamedCount[];
  };
  traffic: {
    guests: number;
    members: number;
    devices: NamedCount[];
    sources: NamedCount[];
  };
  rafiq: {
    turns: number;
    members: number;
    guests: number;
    tokens: number;
    models: NamedCount[];
  };
  system: {
    operations: number;
    errors: number;
    byStatus: NamedCount[];
    hourly: NamedCount[];
    daily: NamedCount[];
    latestAt: string | null;
  };
  lifetime: {
    users: number;
    activities: number;
    pendingRequests: number;
    hours: number;
    certificates: number;
    newVolunteersThisMonth: number;
  };
}

export type GetReportStatsResponse = Result<DashboardStatsDto>;
