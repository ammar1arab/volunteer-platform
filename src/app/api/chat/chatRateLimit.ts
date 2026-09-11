import { createHash } from "crypto";
import { redisPipelineSchema } from "@/lib/chat/schemas";

export const CHAT_DAILY_LIMIT = 50;
export const CHAT_BURST_LIMIT = 10;

type LimitResult = {
  allowed: boolean;
  retryAfter: number;
  remaining: number;
  limit: number;
};

type Window = { limit: number; durationMs: number; name: string };

const limits: Window[] = [
  { name: "burst", limit: CHAT_BURST_LIMIT, durationMs: 5 * 60_000 },
  { name: "daily", limit: CHAT_DAILY_LIMIT, durationMs: 24 * 60 * 60_000 },
];

const dailyWindow = limits.find((window) => window.name === "daily")!;
const memory = new Map<string, number[]>();

/** Clears in-memory counters (local/dev). Redis keys still need a salt change or manual delete. */
export function resetChatRateLimitMemory() {
  memory.clear();
}

resetChatRateLimitMemory();

function clientId(request: Request) {
  const forwardedFor = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  const address = forwardedFor || request.headers.get("x-real-ip") || "missing-ip";
  return createHash("sha256")
    .update(`${process.env.CHAT_RATE_LIMIT_SALT ?? "basmat-chat-v3"}:${address}`)
    .digest("hex")
    .slice(0, 32);
}

function memoryUsage(key: string, window: Window) {
  const now = Date.now();
  const timestamps = (memory.get(key) ?? []).filter((time) => time > now - window.durationMs);
  memory.set(key, timestamps);
  return timestamps;
}

function checkMemory(key: string, window: Window): LimitResult {
  const now = Date.now();
  const timestamps = memoryUsage(key, window);
  if (timestamps.length >= window.limit) {
    return {
      allowed: false,
      retryAfter: Math.max(1, Math.ceil((timestamps[0] + window.durationMs - now) / 1000)),
      remaining: 0,
      limit: window.limit,
    };
  }
  timestamps.push(now);
  memory.set(key, timestamps);
  return {
    allowed: true,
    retryAfter: 0,
    remaining: Math.max(0, window.limit - timestamps.length),
    limit: window.limit,
  };
}

async function redisGet(key: string): Promise<number | null> {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) return null;
  try {
    const response = await fetch(`${url}/get/${encodeURIComponent(key)}`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    });
    if (!response.ok) return null;
    const data = (await response.json()) as { result?: string | number | null };
    const count = Number(data.result ?? 0);
    return Number.isFinite(count) ? count : 0;
  } catch {
    return null;
  }
}

async function incrementRedis(key: string, window: Window): Promise<LimitResult | null> {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) return null;

  try {
    const response = await fetch(`${url}/pipeline`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify([
        ["INCR", key],
        ["PEXPIRE", key, window.durationMs],
      ]),
      cache: "no-store",
    });
    if (!response.ok) return null;

    const parsed = redisPipelineSchema.safeParse(await response.json());
    if (!parsed.success) return null;

    const count = Number(parsed.data[0]?.result);
    if (!Number.isFinite(count)) return null;

    return count > window.limit
      ? { allowed: false, retryAfter: Math.ceil(window.durationMs / 1000), remaining: 0, limit: window.limit }
      : { allowed: true, retryAfter: 0, remaining: Math.max(0, window.limit - count), limit: window.limit };
  } catch {
    return null;
  }
}

export async function getChatQuota(request: Request): Promise<{ remaining: number; limit: number }> {
  const id = clientId(request);
  const key = `basmat:chat:${dailyWindow.name}:${id}`;
  const redisCount = await redisGet(key);
  const used = redisCount ?? memoryUsage(key, dailyWindow).length;
  return {
    remaining: Math.max(0, dailyWindow.limit - used),
    limit: dailyWindow.limit,
  };
}

export async function checkChatRateLimit(request: Request): Promise<LimitResult> {
  const id = clientId(request);
  let dailyRemaining = dailyWindow.limit;

  for (const window of limits) {
    const key = `basmat:chat:${window.name}:${id}`;
    const result = (await incrementRedis(key, window)) ?? checkMemory(key, window);
    if (window.name === "daily") dailyRemaining = result.remaining;
    if (!result.allowed) {
      if (window.name !== "daily") {
        const quota = await getChatQuota(request);
        dailyRemaining = quota.remaining;
      }
      return {
        allowed: false,
        retryAfter: result.retryAfter,
        remaining: window.name === "daily" ? 0 : dailyRemaining,
        limit: dailyWindow.limit,
      };
    }
  }

  return {
    allowed: true,
    retryAfter: 0,
    remaining: dailyRemaining,
    limit: dailyWindow.limit,
  };
}
