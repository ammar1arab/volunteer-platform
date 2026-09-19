import { prisma } from "@/infrastructure/persistence/prisma";
import { Gender, JordanianCity, UserRole } from "@prisma/client";
import type { Prisma } from "@prisma/client";
import { isAudienceTarget } from "@/core/domain/enums";
import type { EmailRecipientDto } from "@/core/application/dtos";

export interface AudienceQuery {
  target: string;
  targetValue?: string;
  userIds?: string[];
  genderFilter?: string;
  cityFilter?: string;
  minHours?: number;
  minAge?: number;
  maxAge?: number;
  interests?: string[];
  hasExperience?: boolean;
  requireVerifiedEmail?: boolean;
}

const PROFILE_SELECT = {
  city: true,
  gender: true,
  totalVolunteerHours: true,
  profilePictureUrl: true
} as const;

export async function findAudienceUsers(query: AudienceQuery): Promise<EmailRecipientDto[]> {
  if (!isAudienceTarget(query.target)) return [];
  const target = query.target;
  if (target === "USERS" && !query.userIds?.length) return [];
  if (
    (target === "CITY" ||
      target === "GENDER" ||
      target === "ACTIVITY_PENDING" ||
      target === "ACTIVITY_APPROVED") &&
    !query.targetValue
  ) {
    return [];
  }
  if (target === "HOURS") {
    const n = parseFloat(query.targetValue ?? "");
    if (!Number.isFinite(n) || n < 0) return [];
  }

  const now = new Date();
  const profileWhere: Prisma.VolunteerProfileWhereInput = { isActive: true };

  if (target === "CITY" && query.targetValue) profileWhere.city = query.targetValue as JordanianCity;
  if (target === "GENDER" && query.targetValue) profileWhere.gender = query.targetValue as Gender;
  if (query.genderFilter) profileWhere.gender = query.genderFilter as Gender;
  if (query.cityFilter) profileWhere.city = query.cityFilter as JordanianCity;

  const hoursFloors: number[] = [];
  if (target === "HOURS") hoursFloors.push(parseFloat(query.targetValue ?? "0"));
  if (query.minHours != null && Number.isFinite(query.minHours)) hoursFloors.push(query.minHours);
  if (hoursFloors.length) profileWhere.totalVolunteerHours = { gte: Math.max(...hoursFloors) };

  if (query.hasExperience !== undefined) profileWhere.hasVolunteerExperience = query.hasExperience;

  const dobFilter: Prisma.DateTimeFilter = {};
  if (query.minAge) {
    dobFilter.lte = new Date(now.getFullYear() - query.minAge, now.getMonth(), now.getDate());
  }
  if (query.maxAge) {
    dobFilter.gte = new Date(now.getFullYear() - query.maxAge, now.getMonth(), now.getDate());
  }
  if (Object.keys(dobFilter).length) profileWhere.dateOfBirth = dobFilter;

  if (query.interests?.length) {
    profileWhere.OR = [
      { interests: { hasSome: query.interests } },
      { skills: { hasSome: query.interests } }
    ];
  }

  const userWhere: Prisma.UserWhereInput = {
    role: UserRole.VOLUNTEER,
    isActive: true,
    volunteerProfile: profileWhere
  };
  if (query.requireVerifiedEmail) userWhere.emailVerified = true;
  if (target === "USERS" && query.userIds?.length) userWhere.id = { in: query.userIds };
  if (target === "ACTIVITY_PENDING" || target === "ACTIVITY_APPROVED") {
    userWhere.participations = {
      some: {
        activityId: query.targetValue,
        status: target === "ACTIVITY_PENDING" ? "PENDING" : "APPROVED"
      }
    };
  }

  const rows = await prisma.user.findMany({
    where: userWhere,
    select: {
      id: true,
      fullName: true,
      email: true,
      phone: true,
      volunteerProfile: { select: PROFILE_SELECT },
      _count: { select: { certificates: true } }
    }
  });

  return rows.map((r) => ({
    id: r.id,
    name: r.fullName,
    email: r.email,
    phone: r.phone,
    city: r.volunteerProfile?.city ?? null,
    gender: r.volunteerProfile?.gender ?? null,
    hours: r.volunteerProfile?.totalVolunteerHours ?? 0,
    avatarUrl: r.volunteerProfile?.profilePictureUrl ?? undefined,
    certifications: r._count.certificates
  }));
}
