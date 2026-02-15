import { VolunteerProfileRepository } from "@/infrastructure/persistence/repositories";
import { R2StorageService } from "@/infrastructure/external";
import {
  ok,
  fail,
  serviceError,
  logger,
  guard,
} from "@/core/application/helpers";
import { toVolunteerProfileDto } from "@/core/application/mappers";
import type {
  GetVolunteerProfileResponse,
  UpdateVolunteerProfileRequest,
  UpdateVolunteerProfileResponse,
  UploadProfilePictureRequest,
  UploadProfilePictureResponse,
} from "@/core/application/dtos";

class VolunteerProfileService {
  private static readonly SCOPE = "VolunteerProfileService";

  constructor(
    private volunteerProfileRepository: VolunteerProfileRepository,
    private storageService: R2StorageService,
  ) {}

  private async findOrFail(userId: string) {
    guard(userId, "معرّف المستخدم مطلوب");
    const profile = await this.volunteerProfileRepository.findByUserId(userId);
    if (!profile)
      throw Object.assign(new Error(), {
        result: fail("NOT_FOUND", "الملف الشخصي غير موجود"),
      });
    return profile;
  }

  private async tryDeleteImage(imageUrl: string): Promise<void> {
    try {
      await this.storageService.delete(imageUrl);
      logger.info(
        VolunteerProfileService.SCOPE,
        "tryDeleteImage",
        `Deleted: ${imageUrl}`,
      );
    } catch {
      logger.warn(
        VolunteerProfileService.SCOPE,
        "tryDeleteImage",
        `Failed to delete: ${imageUrl}`,
      );
    }
  }

  async getProfile(userId: string): Promise<GetVolunteerProfileResponse> {
    try {
      const profile = await this.findOrFail(userId);
      return ok({ profile: toVolunteerProfileDto(profile) });
    } catch (error) {
      return serviceError(
        VolunteerProfileService.SCOPE,
        "getProfile",
        error,
        "حدث خطأ أثناء جلب الملف الشخصي",
      );
    }
  }

  async updateProfile(
    dto: UpdateVolunteerProfileRequest,
  ): Promise<UpdateVolunteerProfileResponse> {
    try {
      const profile = await this.findOrFail(dto.userId);

      if (dto.city) profile.updateCity(dto.city);
      if (dto.dateOfBirth) profile.updateDateOfBirth(dto.dateOfBirth);
      if (dto.gender) profile.updateGender(dto.gender);
      if (dto.bio !== undefined) profile.updateBio(dto.bio);
      if (dto.skills) profile.updateSkills(dto.skills);
      if (dto.interests) profile.updateInterests(dto.interests);
      if (dto.hasVolunteerExperience !== undefined) {
        profile.updateVolunteerExperience(dto.hasVolunteerExperience);
      }

      const updated = await this.volunteerProfileRepository.update(profile);

      logger.info(VolunteerProfileService.SCOPE, "updateProfile", {
        userId: dto.userId,
        fields: Object.keys(dto).filter((k) => k !== "userId"),
      });

      return ok({ profile: toVolunteerProfileDto(updated) });
    } catch (error) {
      return serviceError(
        VolunteerProfileService.SCOPE,
        "updateProfile",
        error,
        "حدث خطأ أثناء تحديث الملف الشخصي",
      );
    }
  }

  async uploadProfilePicture(
    dto: UploadProfilePictureRequest,
  ): Promise<UploadProfilePictureResponse> {
    try {
      const profile = await this.findOrFail(dto.userId);

      const buffer = Buffer.from(await dto.file.arrayBuffer());
      const uploadResult = await this.storageService.upload(
        buffer,
        "profiles",
        dto.file.name,
      );

      if (!uploadResult.success || !uploadResult.url) {
        return fail("STORAGE_ERROR", uploadResult.error || "فشل رفع الصورة");
      }

      if (profile.profilePictureUrl) {
        await this.tryDeleteImage(profile.profilePictureUrl);
      }

      profile.updateProfilePicture(uploadResult.url);
      await this.volunteerProfileRepository.update(profile);

      logger.info(VolunteerProfileService.SCOPE, "uploadProfilePicture", {
        userId: dto.userId,
        imageUrl: uploadResult.url,
      });

      return ok({ imageUrl: uploadResult.url });
    } catch (error) {
      return serviceError(
        VolunteerProfileService.SCOPE,
        "uploadProfilePicture",
        error,
        "حدث خطأ أثناء رفع الصورة",
      );
    }
  }
}

export default VolunteerProfileService;
