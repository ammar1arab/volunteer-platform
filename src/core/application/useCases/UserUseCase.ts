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
  UpdatePermissionsResponse,
  UserAnalyticsDto,
  UserActivityDto,
  UpdateUserRequest,
  UpdateUserResponse,
  VolunteerProfileSummaryDto,
  CreateAdminRequest,
  CreateAdminResponse,
  ToggleUserActiveResponse,
  Result
} from "@/core/application/dtos";
import { logger } from "@/lib/utils";
import { ParticipationStatus, ADMIN_PERMISSIONS, UserRole } from "@/core/domain/enums";
import { User } from "@/core/domain/entities";

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
  },
  certificates: {
    select: { id: true }
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

function computeStats(
  participations: Array<{ status: string; volunteerHours?: number | null }>,
  certificatesCount: number
) {
  return {
    totalActivities: participations.length,
    pendingRequests: participations.filter((p) => p.status === "PENDING").length,
    approvedActivities: participations.filter((p) => p.status === "APPROVED").length,
    rejectedRequests: participations.filter((p) => p.status === "REJECTED").length,
    certificatesCount,
    totalHours:
      Math.round(
        participations.filter((p) => p.status === "APPROVED").reduce((sum, p) => sum + (p.volunteerHours ?? 0), 0) * 100
      ) / 100
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
  permissions: string[];
  volunteerProfile: Parameters<typeof mapVolunteerProfile>[0];
  participations: Array<{ status: string; volunteerHours?: number | null }>;
  certificates: Array<{ id: string }>;
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
    permissions: u.permissions ?? [],
    volunteerProfile: mapVolunteerProfile(u.volunteerProfile),
    stats: computeStats(u.participations, u.certificates.length)
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
        status: p.status as ParticipationStatus,
        requestedAt: p.requestedAt.toISOString(),
        respondedAt: p.respondedAt?.toISOString() ?? null,
        volunteerHours: p.volunteerHours ?? 0,
        activity: {
          id: p.activity.id,
          title: p.activity.title,
          description: p.activity.description,
          date: p.activity.date.toISOString(),
          startTime: p.activity.startTime,
          endTime: p.activity.endTime,
          placeName: p.activity.placeName ?? ""
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

      const updates: Partial<{ email: string; phone: string; fullName: string }> = {};

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

      if (Object.keys(updates).length > 0) user.update(updates);

      if (data.password?.trim()) {
        const v = SecurityValidator.isValidPassword(data.password);
        if (!v.valid) return fail("VALIDATION_ERROR", v.message ?? "كلمة مرور غير صحيحة");
        user.updatePassword(data.password);
        user.incrementTokenVersion();
      }

      const updated = await this.userRepository.update(user);
      logger.info(UserUseCase.SCOPE, "updateBasicInfo", `User updated: ${userId}`);

      return ok({
        user: { id: updated.id, email: updated.email, fullName: updated.fullName, phone: updated.phone }
      });
    } catch (error) {
      return serviceError(UserUseCase.SCOPE, "updateBasicInfo", error, "حدث خطأ أثناء تحديث البيانات");
    }
  }

  async toggleActive(requesterId: string, targetUserId: string, isActive: boolean): Promise<ToggleUserActiveResponse> {
    try {
      const requester = await this.userRepository.findById(requesterId);
      if (!requester) return fail("NOT_FOUND", "المستخدم غير موجود");
      if (!requester.isSuperAdmin) return fail("FORBIDDEN", "غير مصرح لك بتغيير حالة المستخدم");

      const target = await this.userRepository.findById(targetUserId);
      if (!target) return fail("NOT_FOUND", "المستخدم غير موجود");
      if (target.isSuperAdmin) return fail("FORBIDDEN", "لا يمكن تعديل حالة السوبر أدمن");

      target.update({ isActive });
      await this.userRepository.update(target);

      logger.info(UserUseCase.SCOPE, "toggleActive", `User ${targetUserId} isActive=${isActive} by=${requesterId}`);
      return ok({ isActive });
    } catch (error) {
      return serviceError(UserUseCase.SCOPE, "toggleActive", error, "حدث خطأ أثناء تغيير حالة المستخدم");
    }
  }

  async updatePermissions(
    requesterId: string,
    targetUserId: string,
    permissions: string[]
  ): Promise<UpdatePermissionsResponse> {
    try {
      const requester = await this.userRepository.findById(requesterId);
      if (!requester) return fail("NOT_FOUND", "المستخدم غير موجود");
      if (!requester.isSuperAdmin) return fail("FORBIDDEN", "غير مصرح لك بتعديل الصلاحيات");

      const target = await this.userRepository.findById(targetUserId);
      if (!target) return fail("NOT_FOUND", "المستخدم غير موجود");
      if (target.isSuperAdmin) return fail("FORBIDDEN", "لا يمكن تعديل صلاحيات السوبر أدمن");

      const validated = permissions.filter((p) => (ADMIN_PERMISSIONS as readonly string[]).includes(p));

      target.updatePermissions(validated);
      await this.userRepository.update(target);

      logger.info(UserUseCase.SCOPE, "updatePermissions", `Updated permissions for ${targetUserId}`);
      return ok({ permissions: validated });
    } catch (error) {
      return serviceError(UserUseCase.SCOPE, "updatePermissions", error, "حدث خطأ أثناء تحديث الصلاحيات");
    }
  }

  async createAdmin(requesterId: string, data: CreateAdminRequest): Promise<CreateAdminResponse> {
    try {
      const requester = await this.userRepository.findById(requesterId);
      if (!requester) return fail("NOT_FOUND", "المستخدم غير موجود");
      if (!requester.isSuperAdmin) return fail("FORBIDDEN", "غير مصرح لك بإنشاء أدمن");

      const emailStr = InputSanitizer.sanitizeEmail(data.email);
      if (!SecurityValidator.isValidEmail(emailStr)) return fail("VALIDATION_ERROR", "البريد الإلكتروني غير صحيح");

      const existing = await this.userRepository.findByEmail(emailStr);
      if (existing) return fail("CONFLICT", "البريد الإلكتروني مستخدم مسبقاً");

      const nameValidation = SecurityValidator.isValidName(InputSanitizer.sanitizeString(data.fullName));
      if (!nameValidation.valid) return fail("VALIDATION_ERROR", nameValidation.message ?? "اسم غير صحيح");

      const passwordValidation = SecurityValidator.isValidPassword(data.password);
      if (!passwordValidation.valid)
        return fail("VALIDATION_ERROR", passwordValidation.message ?? "كلمة مرور غير صحيحة");

      const newAdmin = User.create({
        email: emailStr,
        fullName: InputSanitizer.sanitizeString(data.fullName),
        phone: InputSanitizer.sanitizePhone(data.phone),
        password: data.password,
        role: UserRole.ADMIN,
        isActive: true
      });

      const validated = data.permissions.filter((p) => (ADMIN_PERMISSIONS as readonly string[]).includes(p));
      newAdmin.updatePermissions(validated);

      const created = await this.userRepository.create(newAdmin);
      logger.info(UserUseCase.SCOPE, "createAdmin", `Admin created: ${created.id}`);

      return ok({ user: { id: created.id, email: created.email, fullName: created.fullName, phone: created.phone } });
    } catch (error) {
      return serviceError(UserUseCase.SCOPE, "createAdmin", error, "حدث خطأ أثناء إنشاء الأدمن");
    }
  }

  async deleteUser(targetUserId: string): Promise<Result<{ success: boolean }>> {
    try {
      const success = await this.userRepository.delete(targetUserId);
      if (!success) return fail("NOT_FOUND", "المستخدم غير موجود");
      logger.info(UserUseCase.SCOPE, "deleteUser", `Deleted: ${targetUserId}`);
      return ok({ success: true });
    } catch (error) {
      return serviceError(UserUseCase.SCOPE, "deleteUser", error, "حدث خطأ أثناء الحذف");
    }
  }
}

export default UserUseCase;
