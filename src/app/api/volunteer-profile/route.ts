import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import VolunteerProfileService from "@/core/application/services/VolunteerProfileService";
import { VolunteerProfileRepository } from "@/infrastructure/persistence/repositories";
import { R2StorageService } from "@/infrastructure/external";
import type { UpdateVolunteerProfileRequest } from "@/core/application/dtos";

export const runtime = "nodejs";

export async function PATCH(request: NextRequest) {
  try {
    // 1. Check authentication
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: "غير مصرح" },
        { status: 401 }
      );
    }

    // 2. Parse request body
    const body = await request.json();

    // 3. Prepare DTO for service
    const updateDto: UpdateVolunteerProfileRequest = {
      userId: session.user.id,
      city: body.city,
      dateOfBirth: body.dateOfBirth ? new Date(body.dateOfBirth) : undefined,
      gender: body.gender,
      bio: body.bio,
      skills: body.skills,
      interests: body.interests,
      hasVolunteerExperience: body.hasVolunteerExperience,
    };

    // 4. Initialize service with dependencies
    const volunteerProfileRepository = new VolunteerProfileRepository();
    const storageService = new R2StorageService();
    const volunteerProfileService = new VolunteerProfileService(
      volunteerProfileRepository,
      storageService
    );

    // 5. Call service method
    const result = await volunteerProfileService.updateProfile(updateDto);

    // 6. Return response
    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 400 }
      );
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error in PATCH /api/volunteer-profiles:", error);
    return NextResponse.json(
      { success: false, error: "حدث خطأ في الخادم" },
      { status: 500 }
    );
  }
}