import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { jwtVerify } from "jose";
import { authOptions } from "@/lib/auth";
import { UserRole } from "@/core/domain/enums";
import { logger } from "@/core/application/helpers";
import type { Result } from "@/core/application/dtos";

interface AuthSession {
  user: { id: string; role: string; email: string };
}

const STATUS_MAP: Record<string, number> = {
  NOT_FOUND: 404,
  CONFLICT: 409,
  FORBIDDEN: 403,
  INVALID_STATE: 409,
  INVALID_CREDENTIALS: 401,
  VALIDATION_ERROR: 400,
  STORAGE_ERROR: 500,
  INTERNAL_ERROR: 500,
};

const secret = new TextEncoder().encode(process.env.NEXTAUTH_SECRET!);

export function toResponse(result: Result<unknown>, successStatus = 200) {
  const status = result.success
    ? successStatus
    : STATUS_MAP[result.error?.code] ?? 400;
  return NextResponse.json(result, { status });
}

export async function requireAuth(req: Request, role?: UserRole) {
  // 1️⃣ Try NextAuth session (for web browsers)
  const session = (await getServerSession(authOptions)) as AuthSession | null;

  if (session?.user?.id) {
    if (role && session.user.role !== role) {
      logger.warn("Auth", "requireAuth", `Role mismatch: expected=${role} got=${session.user.role}`);
      return {
        error: NextResponse.json(
          { success: false, error: { code: "FORBIDDEN", message: "Forbidden" } },
          { status: 403 },
        ),
      } as const;
    }
    return { session } as const;
  }

  // 2️⃣ Try Bearer token (for Postman/API clients)
  const authHeader = req.headers.get("authorization");
  
  if (authHeader?.startsWith("Bearer ")) {
    const token = authHeader.substring(7);
    
    try {
      const { payload } = await jwtVerify(token, secret);
      
      const tokenSession: AuthSession = {
        user: {
          id: payload.sub as string,
          role: payload.role as string,
          email: "",
        },
      };

      if (role && tokenSession.user.role !== role) {
        logger.warn("Auth", "requireAuth", `Role mismatch: expected=${role} got=${tokenSession.user.role}`);
        return {
          error: NextResponse.json(
            { success: false, error: { code: "FORBIDDEN", message: "Forbidden" } },
            { status: 403 },
          ),
        } as const;
      }

      return { session: tokenSession } as const;
    } catch (error) {
      logger.warn("Auth", "requireAuth", "Invalid token");
    }
  }

  // 3️⃣ No valid auth found
  logger.warn("Auth", "requireAuth", "No session or token found");
  return {
    error: NextResponse.json(
      { success: false, error: { code: "UNAUTHORIZED", message: "Unauthorized" } },
      { status: 401 },
    ),
  } as const;
}

export async function parseJson<T>(req: Request): Promise<T | null> {
  try {
    return (await req.json()) as T;
  } catch {
    return null;
  }
}

export function badRequest(message = "Invalid request") {
  return NextResponse.json(
    { success: false, error: { code: "BAD_REQUEST", message } },
    { status: 400 },
  );
}

export function forbidden(message = "Forbidden") {
  return NextResponse.json(
    { success: false, error: { code: "FORBIDDEN", message } },
    { status: 403 },
  );
}

export function apiError(scope: string, action: string, error: unknown) {
  const msg = error instanceof Error ? error.message : String(error);
  logger.error(scope, action, msg);
  return NextResponse.json(
    { success: false, error: { code: "INTERNAL_ERROR", message: "Internal server error" } },
    { status: 500 },
  );
}

export function validateFile(file: File | null, maxMB = 10) {
  if (!file) return "No file provided";
  const allowed = ["image/jpeg", "image/jpg", "image/png", "image/webp", "image/gif"];
  if (!allowed.includes(file.type)) return "Invalid file type. Only JPEG, PNG, WEBP, GIF allowed";
  if (file.size > maxMB * 1024 * 1024) return `File too large. Maximum ${maxMB}MB`;
  return null;
}