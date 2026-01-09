import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import VolunteerProfileService from "@/core/application/services/VolunteerProfileService";
import { VolunteerProfileRepository } from "@/infrastructure/persistence/repositories";
import { R2StorageService } from "@/infrastructure/external";
import type { UploadProfilePictureRequest } from "@/core/application/dtos";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    // 1. Check authentication
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: "غير مصرح" },
        { status: 401 }
      );
    }

    // 2. Parse form data
    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json(
        { success: false, error: "لم يتم رفع أي صورة" },
        { status: 400 }
      );
    }

    // 3. Validate file type
    const validImageTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp", "image/gif"];
    if (!validImageTypes.includes(file.type)) {
      return NextResponse.json(
        { success: false, error: "نوع الملف غير مدعوم. يرجى رفع صورة (JPEG, PNG, WebP, GIF)" },
        { status: 400 }
      );
    }

    // 4. Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { success: false, error: "حجم الملف كبير جداً. الحد الأقصى 5 ميجابايت" },
        { status: 400 }
      );
    }

    // 5. Prepare DTO for service
    const uploadDto: UploadProfilePictureRequest = {
      userId: session.user.id,
      file: file,
    };

    // 6. Initialize service with dependencies
    const volunteerProfileRepository = new VolunteerProfileRepository();
    const storageService = new R2StorageService();
    const volunteerProfileService = new VolunteerProfileService(
      volunteerProfileRepository,
      storageService
    );

    // 7. Call service method
    const result = await volunteerProfileService.uploadProfilePicture(uploadDto);

    // 8. Return response
    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 400 }
      );
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error in POST /api/volunteer-profiles/picture:", error);
    return NextResponse.json(
      { success: false, error: "حدث خطأ في الخادم" },
      { status: 500 }
    );
  }
}