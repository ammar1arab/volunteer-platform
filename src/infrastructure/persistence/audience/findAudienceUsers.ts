import { prisma } from "@/infrastructure/persistence/prisma";
import { EducationLevel, Gender, JordanianCity, UserRole } from "@prisma/client";
import type { Prisma } from "@prisma/client";
import { isAudienceTarget } from "@/core/domain/enums";
import type { EmailRecipientDto } from "@/core/application/dtos";

export interface AudienceQuery {
  target: string;
  targetValue?: string;
  userIds?: string[];
  requireVerifiedEmail?: boolean;
}

const PROFILE_SELECT = {
  city: true,
  gender: true,
  totalVolunteerHours: true,
  profilePictureUrl: true
} as const;

function parseFloor(value?: string): number | null {
  const n = parseFloat(value ?? "");
  return Number.isFinite(n) && n >= 0 ? n : null;
}

export async function findAudienceUsers(query: AudienceQuery): Promise<EmailRecipientDto[]> {
  if (!isAudienceTarget(query.target)) return [];
  const target = query.target;
  if (target === "USERS" && !query.userIds?.length) return [];

  const now = new Date();
  const profileWhere: Prisma.VolunteerProfileWhereInput = { isActive: true };

  if (target === "CITY" && query.targetValue) profileWhere.city = query.targetValue as JordanianCity;
  if (target === "GENDER" && query.targetValue) profileWhere.gender = query.targetValue as Gender;
  if (target === "EDUCATION" && query.targetValue) {
    profileWhere.educationLevel = query.targetValue as EducationLevel;
  }
  if (target === "EXPERIENCE" && (query.targetValue === "true" || query.targetValue === "false")) {
    profileWhere.hasVolunteerExperience = query.targetValue === "true";
  }
  if (target === "HOURS") {
    const hours = parseFloor(query.targetValue);
    if (hours == null) return [];
    profileWhere.totalVolunteerHours = { gte: hours };
  }
  if (target === "AGE") {
    const age = parseFloor(query.targetValue);
    if (age == null) return [];
    profileWhere.dateOfBirth = {
      lte: new Date(now.getFullYear() - age, now.getMonth(), now.getDate())
    };
  }
  if (target === "INTEREST" && query.targetValue) profileWhere.interests = { has: query.targetValue };
  if (target === "SKILL" && query.targetValue) profileWhere.skills = { has: query.targetValue };
  if (target === "LANGUAGE" && query.targetValue) profileWhere.languages = { has: query.targetValue };
  if (target === "VOLUNTEER_TYPE" && query.targetValue) {
    profileWhere.preferredVolunteerTypes = { has: query.targetValue };
  }

  if (
    (target === "CITY" ||
      target === "GENDER" ||
      target === "EDUCATION" ||
      target === "EXPERIENCE" ||
      target === "INTEREST" ||
      target === "SKILL" ||
      target === "LANGUAGE" ||
      target === "VOLUNTEER_TYPE" ||
      target === "ACTIVITY_PENDING" ||
      target === "ACTIVITY_APPROVED") &&
    !query.targetValue
  ) {
    return [];
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
