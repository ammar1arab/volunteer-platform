import { NextRequest, NextResponse } from "next/server";
import { AuthService } from "@/core/application/services";
import {
  UserRepository,
  VolunteerProfileRepository,
} from "@/infrastructure/persistence/repositories";
import { JordanianCity } from "@/core/domain/enums";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const authService = new AuthService(
      new UserRepository(),
      new VolunteerProfileRepository(),
    );

    const result = await authService.signUp({
      email: body.email,
      password: body.password,
      fullName: body.fullName,
      phone: body.phone,
      city: body.city as JordanianCity,
      dateOfBirth: new Date(body.dateOfBirth),
    });

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error || "Sign up failed" },
        { status: 400 },
      );
    }

    return NextResponse.json(
      { success: true, user: result.user },
      { status: 201 },
    );
  } catch (error) {
    console.error("Signup error:", error);
    return NextResponse.json(
      { success: false, error: "Invalid request" },
      { status: 400 },
    );
  }
}
