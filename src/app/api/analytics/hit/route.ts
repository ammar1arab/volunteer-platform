import { getServerSession } from "next-auth";
import { z } from "zod";
import { authOptions } from "@/infrastructure/auth/config";
import { csrfCheck, toResponse } from "@/lib/api-utils";
import { ok } from "@/core/application/dtos";
import { providers } from "@/lib/providers";
import type { TrafficDevice, TrafficSource } from "@/infrastructure/persistence/repositories";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const BOT = /bot|crawler|spider|preview|facebookexternalhit|slurp|bingpreview|lighthouse/i;
const bodySchema = z.object({
  referrer: z.string().max(800).optional()
});

function deviceOf(ua: string): TrafficDevice {
  if (/iPad|Tablet|PlayBook|Silk/i.test(ua)) return "tablet";
  if (/Mobi|Android|iPhone|iPod/i.test(ua)) return "mobile";
  return "desktop";
}

function sourceOf(ref: string): TrafficSource {
  const value = ref.toLowerCase();
  if (value.includes("google.")) return "google";
  if (value.includes("instagram.")) return "instagram";
  if (value.includes("facebook.") || value.includes("fb.com") || value.includes("fb.me")) return "facebook";
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
  if (BOT.test(ua)) return toResponse(ok({ recorded: false }));

  const parsed = bodySchema.safeParse(await req.json().catch(() => ({})));
  const referrer = parsed.success ? parsed.data.referrer ?? req.headers.get("referer") ?? "" : "";
  const session = await getServerSession(authOptions);

  try {
    await providers.reports().recordTraffic({
      guest: !session?.user?.id,
      device: deviceOf(ua),
      source: sourceOf(referrer),
      browser: browserOf(ua),
      operatingSystem: operatingSystemOf(ua),
      country: locationHeader(req, "x-vercel-ip-country", 2)?.toUpperCase(),
      city: locationHeader(req, "x-vercel-ip-city", 80)
    });
  } catch {
    return toResponse(ok({ recorded: false }));
  }

  return toResponse(ok({ recorded: true }));
}
