import { UserRepository } from "@/infrastructure/persistence/repositories";
import { prisma } from "@/infrastructure/persistence/prisma";
import { InputSanitizer, SecurityValidator } from "@/infrastructure/security";
import { serviceError, guard } from "@/core/application/common";
import {
  ok,
  fail,
  GetAllUsersResponse,
  GetUserDetailsResponse,
  GetUserActivitiesResponse,
  UserAnalyticsDto,
  UserActivityDto,
  UpdateUserRequest,
  UpdateUserResponse,
  VolunteerProfileSummaryDto
} from "@/core/application/dtos";
import { logger } from "@/lib/utils";

const USER_WITH_ANALYTICS_INCLUDE = {
  volunteerProfile: {
    select: {
      profilePictureUrl: true,
      city: true,
      dateOfBirth: true,
      gender: true,
      bio: true,
      skills: true,
      interests: true
    }
  },
  participations: {
    include: { activity: { select: { id: true, title: true, date: true } } }
  }
} as const;

function mapVolunteerProfile(
  vp: {
    profilePictureUrl: string | null;
    city: string | null;
    dateOfBirth: Date | null;
    gender: string | null;
    bio: string | null;
    skills: string[];
    interests: string[];
  } | null
): VolunteerProfileSummaryDto | undefined {
  if (!vp) return undefined;
  return {
    profilePictureUrl: vp.profilePictureUrl ?? undefined,
    city: vp.city ?? undefined,
    dateOfBirth: vp.dateOfBirth?.toISOString(),
    gender: vp.gender ?? undefined,
    bio: vp.bio ?? undefined,
    skills: vp.skills ?? [],
    interests: vp.interests ?? []
  };
}

function computeStats(participations: Array<{ status: string }>) {
  return {
    totalActivities: participations.length,
    pendingRequests: participations.filter((p) => p.status === "PENDING").length,
    approvedActivities: participations.filter((p) => p.status === "APPROVED").length,
    rejectedRequests: participations.filter((p) => p.status === "REJECTED").length
  };
}

function toUserAnalyticsDto(u: {
  id: string;
  email: string;
  fullName: string;
  phone: string;
  role: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  volunteerProfile: Parameters<typeof mapVolunteerProfile>[0];
  participations: Array<{ status: string }>;
}): UserAnalyticsDto {
  return {
    id: u.id,
    email: u.email,
    fullName: u.fullName,
    phone: u.phone,
    role: u.role,
    isActive: u.isActive,
    createdAt: u.createdAt.toISOString(),
    updatedAt: u.updatedAt.toISOString(),
    volunteerProfile: mapVolunteerProfile(u.volunteerProfile),
    stats: computeStats(u.participations)
  };
}

class UserUseCase {
  private static readonly SCOPE = "UserUseCase";

  constructor(private userRepository: UserRepository) {}

  async getAllWithAnalytics(): Promise<GetAllUsersResponse> {
    try {
      const users = await prisma.user.findMany({
        include: USER_WITH_ANALYTICS_INCLUDE,
        orderBy: { createdAt: "desc" }
      });

      const result = users.map(toUserAnalyticsDto);
      logger.info(UserUseCase.SCOPE, "getAllWithAnalytics", `Found ${result.length} users`);

      return ok({ users: result });
    } catch (error) {
      return serviceError(UserUseCase.SCOPE, "getAllWithAnalytics", error, "حدث خطأ أثناء جلب المستخدمين");
    }
  }

  async getUserDetails(userId: string): Promise<GetUserDetailsResponse> {
    try {
      guard(userId, "معرّف المستخدم مطلوب");

      const user = await prisma.user.findUnique({
        where: { id: userId },
        include: USER_WITH_ANALYTICS_INCLUDE
      });

      if (!user) return fail("NOT_FOUND", "المستخدم غير موجود");

      return ok({ user: toUserAnalyticsDto(user) });
    } catch (error) {
      return serviceError(UserUseCase.SCOPE, "getUserDetails", error, "حدث خطأ أثناء جلب تفاصيل المستخدم");
    }
  }

  async getUserActivities(userId: string): Promise<GetUserActivitiesResponse> {
    try {
      guard(userId, "معرّف المستخدم مطلوب");

      const participations = await prisma.activityParticipation.findMany({
        where: { volunteerId: userId },
        include: {
          activity: {
            select: {
              id: true,
              title: true,
              description: true,
              date: true,
              startTime: true,
              endTime: true,
              placeName: true
            }
          }
        },
        orderBy: { requestedAt: "desc" }
      });

      const activities: UserActivityDto[] = participations.map((p) => ({
        id: p.id,
        status: p.status,
        requestedAt: p.requestedAt.toISOString(),
        respondedAt: p.respondedAt?.toISOString() ?? null,
        activity: {
          id: p.activity.id,
          title: p.activity.title,
          description: p.activity.description,
          date: p.activity.date.toISOString(),
          startTime: p.activity.startTime,
          endTime: p.activity.endTime,
          placeName: p.activity.placeName
        }
      }));

      logger.info(UserUseCase.SCOPE, "getUserActivities", `Found ${activities.length} for: ${userId}`);
      return ok({ activities });
    } catch (error) {
      return serviceError(UserUseCase.SCOPE, "getUserActivities", error, "حدث خطأ أثناء جلب فرص المستخدم");
    }
  }

  async updateBasicInfo(userId: string, data: UpdateUserRequest): Promise<UpdateUserResponse> {
    try {
      const user = await this.userRepository.findById(userId);
      if (!user) return fail("NOT_FOUND", "المستخدم غير موجود");

      const updates: Partial<{
        email: string;
        phone: string;
        fullName: string;
      }> = {};

      if (data.email && data.email !== user.email) {
        const sanitized = InputSanitizer.sanitizeEmail(data.email);
        if (!SecurityValidator.isValidEmail(sanitized)) return fail("VALIDATION_ERROR", "البريد الإلكتروني غير صحيح");

        const existing = await this.userRepository.findByEmail(sanitized);
        if (existing && existing.id !== userId) return fail("CONFLICT", "البريد الإلكتروني مستخدم مسبقاً");

        updates.email = sanitized;
      }

      if (data.phone && data.phone !== user.phone) {
        const sanitized = InputSanitizer.sanitizePhone(data.phone);
        const v = SecurityValidator.isValidPhone(sanitized);
        if (!v.valid) return fail("VALIDATION_ERROR", v.message ?? "خطأ في التحقق");
        updates.phone = sanitized;
      }

      if (data.fullName && data.fullName !== user.fullName) {
        const sanitized = InputSanitizer.sanitizeString(data.fullName);
        const v = SecurityValidator.isValidName(sanitized);
        if (!v.valid) return fail("VALIDATION_ERROR", v.message ?? "خطأ في التحقق");
        updates.fullName = sanitized;
      }

      if (Object.keys(updates).length > 0) {
        user.update(updates);
      }

      const updated = await this.userRepository.update(user);
      logger.info(UserUseCase.SCOPE, "updateBasicInfo", `User updated: ${userId}`);

      return ok({
        user: {
          id: updated.id,
          email: updated.email,
          fullName: updated.fullName,
          phone: updated.phone
        }
      });
    } catch (error) {
      return serviceError(UserUseCase.SCOPE, "updateBasicInfo", error, "حدث خطأ أثناء تحديث البيانات");
    }
  }
}

export default UserUseCase;
