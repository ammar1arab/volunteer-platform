import { UserRepository } from "@/infrastructure/persistence/repositories";
import { prisma } from "@/infrastructure/persistence/prisma";
import { serviceError } from "@/core/application/helpers";
import type {
  GetAllUsersResponse,
  GetUserDetailsResponse,
  GetUserActivitiesResponse,
  UserAnalyticsDto,
  UserActivityDto,
  UpdateUserResponse,
  UpdateUserRequest,
} from "@/core/application/dtos";
import { InputSanitizer, SecurityValidator } from "@/infrastructure/security";

class UserService {
  private static readonly SCOPE = "UserService";

  constructor(private userRepository: UserRepository) {}

  async getAllWithAnalytics(): Promise<GetAllUsersResponse> {
    try {
      const users = await prisma.user.findMany({
        include: {
          volunteerProfile: {
            select: {
              profilePictureUrl: true,
              city: true,
              dateOfBirth: true,
              gender: true,
            },
          },
          participations: {
            include: {
              activity: {
                select: {
                  id: true,
                  title: true,
                  date: true,
                },
              },
            },
          },
        },
        orderBy: { createdAt: "desc" },
      });

      const usersWithStats: UserAnalyticsDto[] = users.map((user) => ({
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        phone: user.phone,
        role: user.role,
        isActive: user.isActive,
        createdAt: user.createdAt.toISOString(),
        updatedAt: user.updatedAt.toISOString(),
        volunteerProfile: user.volunteerProfile
          ? {
              profilePictureUrl:
                user.volunteerProfile.profilePictureUrl ?? undefined,
              city: user.volunteerProfile.city ?? undefined,
              dateOfBirth: user.volunteerProfile.dateOfBirth?.toISOString(),
              gender: user.volunteerProfile.gender ?? undefined,
            }
          : undefined,
        stats: {
          totalActivities: user.participations.length,
          pendingRequests: user.participations.filter(
            (p) => p.status === "PENDING"
          ).length,
          approvedActivities: user.participations.filter(
            (p) => p.status === "APPROVED"
          ).length,
          rejectedRequests: user.participations.filter(
            (p) => p.status === "REJECTED"
          ).length,
        },
      }));

      return { success: true, users: usersWithStats };
    } catch (error) {
      return serviceError<GetAllUsersResponse>(
        UserService.SCOPE,
        "getAllWithAnalytics",
        error,
        "Failed to fetch users"
      );
    }
  }

  async getUserDetails(userId: string): Promise<GetUserDetailsResponse> {
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        include: {
          volunteerProfile: {
            select: {
              profilePictureUrl: true,
              city: true,
              dateOfBirth: true,
              gender: true,
            },
          },
          participations: {
            include: {
              activity: {
                select: {
                  id: true,
                  title: true,
                  date: true,
                },
              },
            },
          },
        },
      });

      if (!user) {
        return { success: false, error: "User not found" };
      }

      const userWithStats: UserAnalyticsDto = {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        phone: user.phone,
        role: user.role,
        isActive: user.isActive,
        createdAt: user.createdAt.toISOString(),
        updatedAt: user.updatedAt.toISOString(),
        volunteerProfile: user.volunteerProfile
          ? {
              profilePictureUrl:
                user.volunteerProfile.profilePictureUrl ?? undefined,
              city: user.volunteerProfile.city ?? undefined,
              dateOfBirth: user.volunteerProfile.dateOfBirth?.toISOString(),
              gender: user.volunteerProfile.gender ?? undefined,
            }
          : undefined,
        stats: {
          totalActivities: user.participations.length,
          pendingRequests: user.participations.filter(
            (p) => p.status === "PENDING"
          ).length,
          approvedActivities: user.participations.filter(
            (p) => p.status === "APPROVED"
          ).length,
          rejectedRequests: user.participations.filter(
            (p) => p.status === "REJECTED"
          ).length,
        },
      };

      return { success: true, user: userWithStats };
    } catch (error) {
      return serviceError<GetUserDetailsResponse>(
        UserService.SCOPE,
        "getUserDetails",
        error,
        "Failed to fetch user details"
      );
    }
  }

  async getUserActivities(userId: string): Promise<GetUserActivitiesResponse> {
    try {
      const participations = await prisma.activityParticipation.findMany({
        where: { volunteerId: userId },
        include: {
          activity: {
            select: {
              id: true,
              title: true,
              date: true,
            },
          },
        },
        orderBy: { requestedAt: "desc" },
      });

      const activities: UserActivityDto[] = participations.map((p) => ({
        id: p.id,
        activityId: p.activityId,
        activityTitle: p.activity.title,
        activityDate: p.activity.date.toISOString(),
        status: p.status,
        requestedAt: p.requestedAt.toISOString(),
        respondedAt: p.respondedAt ? p.respondedAt.toISOString() : null,
      }));

      return { success: true, activities };
    } catch (error) {
      return serviceError<GetUserActivitiesResponse>(
        UserService.SCOPE,
        "getUserActivities",
        error,
        "Failed to fetch user activities"
      );
    }
  }
  async updateBasicInfo(
    userId: string,
    data: UpdateUserRequest
  ): Promise<UpdateUserResponse> {
    try {
      const user = await this.userRepository.findById(userId);

      if (!user) {
        return { success: false, error: "المستخدم غير موجود" };
      }

      // Validate and update email
      if (data.email && data.email !== user.email) {
        const sanitizedEmail = InputSanitizer.sanitizeEmail(data.email);

        if (!SecurityValidator.isValidEmail(sanitizedEmail)) {
          return { success: false, error: "البريد الإلكتروني غير صحيح" };
        }

        // Check if email already exists
        const existingUser = await this.userRepository.findByEmail(
          sanitizedEmail
        );
        if (existingUser && existingUser.id !== userId) {
          return { success: false, error: "البريد الإلكتروني مستخدم مسبقاً" };
        }

        user.email = sanitizedEmail;
      }

      // Validate and update phone
      if (data.phone && data.phone !== user.phone) {
        const sanitizedPhone = InputSanitizer.sanitizePhone(data.phone);

        const phoneValidation = SecurityValidator.isValidPhone(sanitizedPhone);
        if (!phoneValidation.valid) {
          return { success: false, error: phoneValidation.message };
        }

        user.phone = sanitizedPhone;
      }

      // Validate and update fullName
      if (data.fullName && data.fullName !== user.fullName) {
        const sanitizedName = InputSanitizer.sanitizeString(data.fullName);

        const nameValidation = SecurityValidator.isValidName(sanitizedName);
        if (!nameValidation.valid) {
          return { success: false, error: nameValidation.message };
        }

        user.fullName = sanitizedName;
      }

      const updated = await this.userRepository.update(user);

      return {
        success: true,
        user: {
          id: updated.id,
          email: updated.email,
          fullName: updated.fullName,
          phone: updated.phone,
        },
      };
    } catch (error) {
      return serviceError<UpdateUserResponse>(
        UserService.SCOPE,
        "updateBasicInfo",
        error,
        "حدث خطأ أثناء تحديث البيانات"
      );
    }
  }
}

export default UserService;
