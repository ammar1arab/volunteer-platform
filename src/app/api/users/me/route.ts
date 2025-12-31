import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { UserRepository } from "@/infrastructure/persistence/repositories";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json(
      { success: false, error: "Unauthorized" },
      { status: 401 }
    );
  }

  try {
    const userRepository = new UserRepository();
    const user = await userRepository.findById(session.user.id);

    if (!user) {
      return NextResponse.json(
        { success: false, error: "User not found" },
        { status: 404 }
      );
    }

    const userProps = user.toObject();

    return NextResponse.json({
      success: true,
      user: {
        id: userProps.id,
        email: userProps.email,
        fullName: userProps.fullName,
        phone: userProps.phone,
        role: userProps.role,
        isActive: userProps.isActive,
        createdAt: userProps.createdAt.toISOString(),
      },
    });
  } catch (error) {
    console.error("Error fetching user profile:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch user profile" },
      { status: 500 }
    );
  }
}