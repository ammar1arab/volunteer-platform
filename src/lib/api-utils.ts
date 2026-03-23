import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { jwtVerify } from "jose";
import type { AdminPermission } from "@/core/domain/enums";
import type { Result } from "@/core/application/dtos";
import { UserRole } from "@/core/domain/enums";
import { authOptions } from "@/infrastructure/auth/config";
import { prisma } from "@/infrastructure/persistence/prisma";
import { logger } from "@/lib/utils";

interface AuthUser {
  id: string;
  role: string;
  email: string;
  isSuperAdmin: boolean;
  permissions: string[];
}
interface AuthSession {
  user: AuthUser;
}
type AuthSuccess = { session: AuthSession };
type AuthFailure = { error: NextResponse };
type AuthResult = AuthSuccess | AuthFailure;

const STATUS_MAP: Record<string, number> = {
  NOT_FOUND: 404,
  CONFLICT: 409,
  FORBIDDEN: 403,
  INVALID_STATE: 409,
  INVALID_CREDENTIALS: 401,
  VALIDATION_ERROR: 400,
  STORAGE_ERROR: 500,
  INTERNAL_ERROR: 500
};

const secret = new TextEncoder().encode(process.env.NEXTAUTH_SECRET!);

// ─── Rate limit (per-instance, sufficient for Vercel Free serverless) ────────
const _rlStore = new Map<string, { count: number; resetAt: number }>();

export function checkRateLimit(key: string, limit: number, windowMs: number): boolean {
  const now = Date.now();
  const entry = _rlStore.get(key);
  if (!entry || entry.resetAt < now) {
    _rlStore.set(key, { count: 1, resetAt: now + windowMs });
    return true;
  }
  if (entry.count >= limit) return false;
  entry.count++;
  return true;
}

// ─── CSRF origin check ────────────────────────────────────────────────────────
export function csrfCheck(req: Request): NextResponse | null {
  const origin = req.headers.get("origin");
  if (!origin) return null; // server-to-server — allow

  const allowed = (process.env.NEXTAUTH_URL ?? "").replace(/\/$/, "");
  if (allowed && origin.replace(/\/$/, "") !== allowed) {
    logger.warn("CSRF", "csrfCheck", `Blocked origin: ${origin}`);
    return forbidden("Invalid origin");
  }
  return null;
}

// ─── Standard responses ───────────────────────────────────────────────────────
export function toResponse(result: Result<unknown>, successStatus = 200) {
  const status = result.success ? successStatus : (STATUS_MAP[result.error?.code] ?? 400);
  return NextResponse.json(result, { status });
}

export function unauthorized(message = "Unauthorized") {
  return NextResponse.json({ success: false, error: { code: "UNAUTHORIZED", message } }, { status: 401 });
}

export function forbidden(message = "Forbidden") {
  return NextResponse.json({ success: false, error: { code: "FORBIDDEN", message } }, { status: 403 });
}

export function badRequest(message = "Invalid request") {
  return NextResponse.json({ success: false, error: { code: "BAD_REQUEST", message } }, { status: 400 });
}

export function apiError(scope: string, action: string, error: unknown) {
  const msg = error instanceof Error ? error.message : String(error);
  logger.error(scope, action, msg);
  return NextResponse.json(
    { success: false, error: { code: "INTERNAL_ERROR", message: "Internal server error" } },
    { status: 500 }
  );
}

export async function requireAuth(req: Request, role?: UserRole): Promise<AuthResult> {
  const session = (await getServerSession(authOptions)) as AuthSession | null;

  if (session?.user?.id) {
    if (role && session.user.role !== role) {
      logger.warn("Auth", "requireAuth", `Role mismatch: expected=${role} got=${session.user.role}`);
      return { error: forbidden() } as const;
    }
    return { session } as const;
  }

  const authHeader = req.headers.get("authorization");
  if (authHeader?.startsWith("Bearer ")) {
    const token = authHeader.substring(7);
    try {
      const { payload } = await jwtVerify(token, secret);
      const userId = payload.sub as string;
      const userRole = payload.role as string;

      if (role && userRole !== role) {
        logger.warn("Auth", "requireAuth", `Role mismatch: expected=${role} got=${userRole}`);
        return { error: forbidden() } as const;
      }

      const dbUser = await prisma.user.findUnique({
        where: { id: userId },
        select: { isSuperAdmin: true, permissions: true }
      });

      return {
        session: {
          user: {
            id: userId,
            role: userRole,
            email: "",
            isSuperAdmin: dbUser?.isSuperAdmin ?? false,
            permissions: dbUser?.permissions ?? []
          }
        }
      } as const;
    } catch {
      logger.warn("Auth", "requireAuth", "Invalid or expired Bearer token");
    }
  }

  logger.warn("Auth", "requireAuth", "No session or token found");
  return { error: unauthorized() } as const;
}

export async function requirePermission(req: Request, permission: AdminPermission): Promise<AuthResult> {
  const authResult = await requireAuth(req, UserRole.ADMIN);
  if ("error" in authResult) return authResult;
  const { session } = authResult;
  if (session.user.isSuperAdmin) return { session } as const;
  if (session.user.permissions.includes(permission)) return { session } as const;
  logger.warn("Auth", "requirePermission", `Permission denied: userId=${session.user.id} required=${permission}`);
  return { error: forbidden("ليس لديك صلاحية للوصول إلى هذا المورد") } as const;
}

export async function parseJson<T>(req: Request): Promise<T | null> {
  try {
    return (await req.json()) as T;
  } catch {
    return null;
  }
}

export function validateFile(file: File | null, maxMB = 10, type: "image" | "pdf" = "image"): string | null {
  if (!file) return "No file provided";
  if (type === "pdf") {
    if (file.type !== "application/pdf") return "Invalid file type. Only PDF allowed";
    if (file.size > maxMB * 1024 * 1024) return `File too large. Maximum ${maxMB}MB`;
    return null;
  }
  const allowed = ["image/jpeg", "image/jpg", "image/png", "image/webp", "image/gif"];
  if (!allowed.includes(file.type)) return "Invalid file type. Only JPEG, PNG, WEBP, GIF allowed";
  if (file.size > maxMB * 1024 * 1024) return `File too large. Maximum ${maxMB}MB`;
  return null;
}
