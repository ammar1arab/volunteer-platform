import { VolunteerProfileRepository } from "@/infrastructure/persistence/repositories";
import { R2StorageService } from "@/infrastructure/external";
import { serviceError, guard } from "@/core/application/common";
import { InputSanitizer } from "@/infrastructure/security";
import { toVolunteerProfileDto } from "@/core/application/mappers";
import {
  ok,
  fail,
  GetVolunteerProfileResponse,
  UpdateVolunteerProfileRequest,
  UpdateVolunteerProfileResponse,
  UploadProfilePictureRequest,
  UploadProfilePictureResponse
} from "@/core/application/dtos";
import { logger } from "@/lib/utils";

class VolunteerProfileUseCase {
  private static readonly SCOPE = "VolunteerProfileUseCase";

  constructor(
    private volunteerProfileRepository: VolunteerProfileRepository,
    private storageService: R2StorageService
  ) {}

  private async findOrFail(userId: string) {
    guard(userId, "معرّف المستخدم مطلوب");
    const profile = await this.volunteerProfileRepository.findByUserId(userId);
    if (!profile)
      throw Object.assign(new Error(), {
        result: fail("NOT_FOUND", "الملف الشخصي غير موجود")
      });
    return profile;
  }

  private async tryDeleteImage(imageUrl: string): Promise<void> {
    try {
      await this.storageService.delete(imageUrl);
      logger.info(VolunteerProfileUseCase.SCOPE, "tryDeleteImage", `Deleted: ${imageUrl}`);
    } catch {
      logger.warn(VolunteerProfileUseCase.SCOPE, "tryDeleteImage", `Failed to delete: ${imageUrl}`);
    }
  }

  async getProfile(userId: string): Promise<GetVolunteerProfileResponse> {
    try {
      const profile = await this.findOrFail(userId);
      return ok({ profile: toVolunteerProfileDto(profile) });
    } catch (error) {
      return serviceError(VolunteerProfileUseCase.SCOPE, "getProfile", error, "حدث خطأ أثناء جلب الملف الشخصي");
    }
  }

  async updateProfile(dto: UpdateVolunteerProfileRequest): Promise<UpdateVolunteerProfileResponse> {
    try {
      const profile = await this.findOrFail(dto.userId);

      profile.update({
        ...(dto.city && { city: dto.city }),
        ...(dto.dateOfBirth && { dateOfBirth: new Date(dto.dateOfBirth) }),
        ...(dto.gender && { gender: dto.gender }),
        ...(dto.bio !== undefined && { bio: dto.bio }),
        ...(dto.membershipNumber !== undefined && {
          membershipNumber: dto.membershipNumber
            ? InputSanitizer.sanitizeString(dto.membershipNumber) || null
            : null
        }),
        ...(dto.educationLevel !== undefined && { educationLevel: dto.educationLevel }),
        ...(dto.occupation !== undefined && {
          occupation: dto.occupation
            ? InputSanitizer.sanitizeString(dto.occupation) || null
            : null
        }),
        ...(dto.skills && { skills: dto.skills }),
        ...(dto.interests && { interests: dto.interests }),
        ...(dto.languages && { languages: dto.languages }),
        ...(dto.preferredVolunteerTypes && { preferredVolunteerTypes: dto.preferredVolunteerTypes }),
        ...(dto.hasVolunteerExperience !== undefined && {
          hasVolunteerExperience: dto.hasVolunteerExperience
        })
      });

      const updated = await this.volunteerProfileRepository.update(profile);

      logger.info(VolunteerProfileUseCase.SCOPE, "updateProfile", {
        userId: dto.userId,
        fields: Object.keys(dto).filter((k) => k !== "userId")
      });

      return ok({ profile: toVolunteerProfileDto(updated) });
    } catch (error) {
      return serviceError(VolunteerProfileUseCase.SCOPE, "updateProfile", error, "حدث خطأ أثناء تحديث الملف الشخصي");
    }
  }

  async uploadProfilePicture(dto: UploadProfilePictureRequest): Promise<UploadProfilePictureResponse> {
    try {
      const profile = await this.findOrFail(dto.userId);

      const buffer = Buffer.from(await dto.file.arrayBuffer());
      const uploadResult = await this.storageService.upload(buffer, "profiles", dto.file.name);

      if (!uploadResult.success || !uploadResult.url) {
        return fail("STORAGE_ERROR", uploadResult.error || "فشل رفع الصورة");
      }

      if (profile.profilePictureUrl) {
        await this.tryDeleteImage(profile.profilePictureUrl);
      }

      profile.update({ profilePictureUrl: uploadResult.url });
      await this.volunteerProfileRepository.update(profile);

      logger.info(VolunteerProfileUseCase.SCOPE, "uploadProfilePicture", {
        userId: dto.userId,
        imageUrl: uploadResult.url
      });

      return ok({ imageUrl: uploadResult.url });
    } catch (error) {
      return serviceError(VolunteerProfileUseCase.SCOPE, "uploadProfilePicture", error, "حدث خطأ أثناء رفع الصورة");
    }
  }
}

export default VolunteerProfileUseCase;
