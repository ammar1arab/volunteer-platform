import { getServerSession } from "next-auth";
import { z } from "zod";
import { cookies } from "next/headers";
import { authOptions } from "@/infrastructure/auth/config";
import { badRequest, csrfCheck, toResponse } from "@/lib/api-utils";
import { ok } from "@/core/application/dtos";
import { providers } from "@/lib/providers";
import type { TrafficDevice, TrafficSource } from "@/infrastructure/persistence/repositories";
import { UserRole } from "@/core/domain/enums";
import { VISITOR_COOKIE, newVisitorId, readVisitor, signVisitor, visitorKey } from "@/infrastructure/security/visitorIdentity";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const BOT = /bot|crawler|spider|preview|facebookexternalhit|slurp|bingpreview|lighthouse/i;
const bodySchema = z.object({
  visitorId: z.uuid(),
  referrer: z.string().max(800).optional()
});

function deviceOf(ua: string): TrafficDevice {
  if (/iPad|Tablet|PlayBook|Silk/i.test(ua)) return "tablet";
  if (/Mobi|Android|iPhone|iPod/i.test(ua)) return "mobile";
  return "desktop";
}

function sourceOf(ref: string): TrafficSource {
  if (!URL.canParse(ref)) return "other";
  const host = new URL(ref).hostname.toLowerCase();
  if (/(^|\.)google\.(com|[a-z]{2}|co\.[a-z]{2}|com\.[a-z]{2})$/.test(host)) return "google";
  if (host === "instagram.com" || host.endsWith(".instagram.com")) return "instagram";
  if (["facebook.com", "fb.com", "fb.me"].some((domain) => host === domain || host.endsWith(`.${domain}`))) return "facebook";
  return "other";
}

function browserOf(ua: string) {
  if (/Edg\//i.test(ua)) return "Edge";
  if (/OPR\//i.test(ua)) return "Opera";
  if (/Chrome\//i.test(ua)) return "Chrome";
  if (/Firefox\//i.test(ua)) return "Firefox";
  if (/Safari\//i.test(ua)) return "Safari";
  return "أخرى";
}

function operatingSystemOf(ua: string) {
  if (/Android/i.test(ua)) return "Android";
  if (/iPhone|iPad|iPod/i.test(ua)) return "iOS";
  if (/Windows/i.test(ua)) return "Windows";
  if (/Mac OS X|Macintosh/i.test(ua)) return "macOS";
  if (/Linux/i.test(ua)) return "Linux";
  return "أخرى";
}

function locationHeader(req: Request, name: string, maxLength: number) {
  const raw = req.headers.get(name);
  if (!raw) return undefined;
  try {
    return decodeURIComponent(raw).trim().slice(0, maxLength) || undefined;
  } catch {
    return raw.trim().slice(0, maxLength) || undefined;
  }
}

export async function POST(req: Request) {
  const csrf = csrfCheck(req);
  if (csrf) return csrf;

  const ua = req.headers.get("user-agent") ?? "";
  if (process.env.NODE_ENV !== "production" || BOT.test(ua)) return toResponse(ok({ recorded: false }));

  const parsed = bodySchema.safeParse(await req.json().catch(() => ({})));
  if (!parsed.success) return badRequest("Invalid visitor data");
  const referrer = parsed.data.referrer ?? req.headers.get("referer") ?? "";
  const session = await getServerSession(authOptions);
  if (session?.user?.role === UserRole.ADMIN) return toResponse(ok({ recorded: false }));

  try {
    const cookieStore = await cookies();
    let id = readVisitor(cookieStore.get(VISITOR_COOKIE)?.value) ?? parsed.data.visitorId;
    const input = {
      visitorKey: visitorKey(`browser:${id}`),
      volunteerKey: session?.user?.id && session.user.role === UserRole.VOLUNTEER
        ? visitorKey(`volunteer:${session.user.id}`) : null,
      device: deviceOf(ua),
      source: sourceOf(referrer),
      browser: browserOf(ua),
      operatingSystem: operatingSystemOf(ua),
      country: locationHeader(req, "x-vercel-ip-country", 2)?.toUpperCase(),
      city: locationHeader(req, "x-vercel-ip-city", 80)
    };
    const reports = providers.reports();
    let result = await reports.recordTraffic(input);
    if (result.success && !result.data.recorded) {
      id = newVisitorId();
      result = await reports.recordTraffic({ ...input, visitorKey: visitorKey(`browser:${id}`) });
    }
    const response = toResponse(result);
    response.headers.set("Cache-Control", "no-store");
    if (result.success && result.data.recorded) {
      response.cookies.set(VISITOR_COOKIE, signVisitor(id), {
        httpOnly: true, secure: new URL(req.url).protocol === "https:",
        sameSite: "lax", path: "/", maxAge: 60 * 60 * 24 * 365
      });
    }
    return response;
  } catch {
    return toResponse(ok({ recorded: false }), 503);
  }
}
