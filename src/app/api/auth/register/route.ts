import { NextRequest, NextResponse } from "next/server";
import AuthService from "@/core/application/services/AuthService";
import { UserRepository } from "@/infrastructure/persistence/repositories";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const authService = new AuthService(new UserRepository());
    const result = await authService.signUp({
      email: body.email,
      password: body.password,
      fullName: body.fullName,
      phone: body.phone,
    });

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error || "Sign up failed" },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: true, user: result.user },
      { status: 201 }
    );
  } catch {
    return NextResponse.json(
      { success: false, error: "Invalid request" },
      { status: 400 }
    );
  }
}
