import { NextResponse, NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/infrastructure/persistence/prisma";
import UserService from "@/core/application/services/UserService"; 
import { UserRepository } from "@/infrastructure/persistence/repositories"; 

export const runtime = "nodejs";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: {
        volunteerProfile: true,
        participations: {
          select: {
            id: true,
            status: true,
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, error: "User not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        phone: user.phone,
        role: user.role,
        isActive: user.isActive,
        createdAt: user.createdAt.toISOString(),
        volunteerProfile: user.volunteerProfile ? {
          id: user.volunteerProfile.id,
          city: user.volunteerProfile.city,
          dateOfBirth: user.volunteerProfile.dateOfBirth.toISOString(),
          gender: user.volunteerProfile.gender,
          bio: user.volunteerProfile.bio,
          skills: user.volunteerProfile.skills,
          interests: user.volunteerProfile.interests,
          profilePictureUrl: user.volunteerProfile.profilePictureUrl,
        } : undefined,
        participations: user.participations,
      },
    });
  } catch (error) {
    console.error("Get profile error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch profile" },
      { status: 500 }
    );
  }
}
export async function PATCH(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: "غير مصرح" },
        { status: 401 }
      );
    }

    const body = await request.json();

    const userRepository = new UserRepository();
    const userService = new UserService(userRepository);

    const result = await userService.updateBasicInfo(session.user.id, body);

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 400 }
      );
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error in PATCH /api/users/me:", error);
    return NextResponse.json(
      { success: false, error: "حدث خطأ في الخادم" },
      { status: 500 }
    );
  }
}