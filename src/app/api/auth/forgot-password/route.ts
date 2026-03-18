import { providers } from "@/lib/providers";
import { parseJson, badRequest, apiError } from "@/lib/api-utils";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const body = await parseJson<{ email: string }>(req);
    if (!body?.email) return badRequest("email is required");
    const result = await providers.auth().forgotPassword(body);
    return NextResponse.json(result);
  } catch (error) {
    return apiError("API", "POST /auth/forgot-password", error);
  }
}