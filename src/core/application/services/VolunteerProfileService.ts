import { VolunteerProfileRepository } from "@/infrastructure/persistence/repositories";
import { serviceError, logger } from "@/core/application/helpers";
import { R2StorageService } from "@/infrastructure/external";
import type {
  GetVolunteerProfileRequest,
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
    private storageService: R2StorageService
  ) {}

  async getProfile(dto: GetVolunteerProfileRequest): Promise<GetVolunteerProfileResponse> {
    try {
      const profile = await this.volunteerProfileRepository.findByUserId(dto.userId);

      if (!profile) {
        return { success: false, error: "الملف الشخصي غير موجود" };
      }

      return {
        success: true,
        profile: {
          id: profile.id,
          userId: profile.userId,
          city: profile.city,
          dateOfBirth: profile.dateOfBirth.toISOString(),
          profilePictureUrl: profile.profilePictureUrl,
          gender: profile.gender,
          bio: profile.bio,
          skills: profile.skills,
          interests: profile.interests,
          hasVolunteerExperience: profile.hasVolunteerExperience,
        },
      };
    } catch (error) {
      return serviceError<GetVolunteerProfileResponse>(
        VolunteerProfileService.SCOPE,
        "getProfile",
        error,
        "حدث خطأ أثناء جلب الملف الشخصي"
      );
    }
  }

  async updateProfile(dto: UpdateVolunteerProfileRequest): Promise<UpdateVolunteerProfileResponse> {
    try {
      const profile = await this.volunteerProfileRepository.findByUserId(dto.userId);

      if (!profile) {
        return { success: false, error: "الملف الشخصي غير موجود" };
      }

      // Update fields if provided
      if (dto.city) profile.updateCity(dto.city);
      if (dto.dateOfBirth) profile.updateDateOfBirth(dto.dateOfBirth);
      if (dto.gender) profile.updateGender(dto.gender);
      if (dto.bio !== undefined) profile.updateBio(dto.bio);
      if (dto.skills) profile.updateSkills(dto.skills);
      if (dto.interests) profile.updateInterests(dto.interests);
      if (dto.hasVolunteerExperience !== undefined) {
        profile.updateVolunteerExperience(dto.hasVolunteerExperience);
      }

      const updatedProfile = await this.volunteerProfileRepository.update(profile);

      logger.info(VolunteerProfileService.SCOPE, "updateProfile", {
        userId: dto.userId,
        updatedFields: Object.keys(dto).filter(key => key !== 'userId'),
      });

      return {
        success: true,
        profile: {
          id: updatedProfile.id,
          userId: updatedProfile.userId,
          city: updatedProfile.city,
          dateOfBirth: updatedProfile.dateOfBirth.toISOString(),
          profilePictureUrl: updatedProfile.profilePictureUrl,
          gender: updatedProfile.gender,
          bio: updatedProfile.bio,
          skills: updatedProfile.skills,
          interests: updatedProfile.interests,
          hasVolunteerExperience: updatedProfile.hasVolunteerExperience,
        },
      };
    } catch (error) {
      return serviceError<UpdateVolunteerProfileResponse>(
        VolunteerProfileService.SCOPE,
        "updateProfile",
        error,
        "حدث خطأ أثناء تحديث الملف الشخصي"
      );
    }
  }

  async uploadProfilePicture(dto: UploadProfilePictureRequest): Promise<UploadProfilePictureResponse> {
    try {
      const profile = await this.volunteerProfileRepository.findByUserId(dto.userId);

      if (!profile) {
        return { success: false, error: "الملف الشخصي غير موجود" };
      }

      // Convert File to Buffer
      const arrayBuffer = await dto.file.arrayBuffer();
      const fileBuffer = Buffer.from(arrayBuffer);

      // Upload image to R2 Storage
      const uploadResult = await this.storageService.upload(
        fileBuffer,
        "profiles",
        dto.file.name
      );

      if (!uploadResult.success || !uploadResult.url) {
        return { success: false, error: uploadResult.error || "فشل رفع الصورة" };
      }

      // Delete old profile picture if exists
      if (profile.profilePictureUrl) {
        await this.storageService.delete(profile.profilePictureUrl);
      }

      // Update profile with new picture URL
      profile.updateProfilePicture(uploadResult.url);
      await this.volunteerProfileRepository.update(profile);

      logger.info(VolunteerProfileService.SCOPE, "uploadProfilePicture", {
        userId: dto.userId,
        imageUrl: uploadResult.url,
      });

      return {
        success: true,
        imageUrl: uploadResult.url,
      };
    } catch (error) {
      return serviceError<UploadProfilePictureResponse>(
        VolunteerProfileService.SCOPE,
        "uploadProfilePicture",
        error,
        "حدث خطأ أثناء رفع الصورة"
      );
    }
  }
}

export default VolunteerProfileService;