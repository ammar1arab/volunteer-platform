import { NextResponse } from "next/server";
import { ok } from "@/core/application/dtos";
import { badRequest, csrfCheck, toResponse } from "@/lib/api-utils";
import { logger, toError } from "@/lib/utils";
import { CHAT_REQUEST_BODY_MAX, chatRequestSchema } from "@/lib/chat/schemas";
import {
  FALLBACK_HELP,
  listChatModels,
  localAnswer,
  normaliseMessages,
  openReliableStream,
} from "./chatRuntime";
import { CHAT_DAILY_LIMIT, checkChatRateLimit, getChatQuota } from "./chatRateLimit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

const RATE_LIMIT_MESSAGE =
  "وصلت إلى حد الرسائل المتاح حالياً. جرّب لاحقاً، فهذا الحد يساعدنا على إدارة تكلفة الخدمة.";

function quotaHeaders(remaining: number, limit: number) {
  return { "X-Chat-Remaining": String(remaining), "X-Chat-Limit": String(limit) };
}

function metaBody(remaining: number, limit: number) {
  return {
    remaining,
    limit,
    defaultModel: "auto" as const,
    models: [{ id: "auto" as const, label: "Auto", available: true }, ...listChatModels()],
  };
}

function textResponse(body: string, remaining: number, limit: number, source: string) {
  return new Response(body, {
    status: 200,
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "no-cache, no-store",
      "X-AI-Source": source,
      ...quotaHeaders(remaining, limit),
    },
  });
}

export async function GET(req: Request): Promise<Response> {
  try {
    const { remaining, limit } = await getChatQuota(req);
    return toResponse(ok(metaBody(remaining, limit)));
  } catch (error) {
    logger.error("Chat", "metaUnavailable", toError(error));
    return toResponse(ok(metaBody(CHAT_DAILY_LIMIT, CHAT_DAILY_LIMIT)));
  }
}

export async function POST(req: Request): Promise<Response> {
  const csrf = csrfCheck(req);
  if (csrf) return csrf;

  const length = Number(req.headers.get("content-length"));
  if (Number.isFinite(length) && length > CHAT_REQUEST_BODY_MAX) {
    return badRequest("أرسل سؤالاً صالحاً من فضلك.");
  }

  const payload = await req.json().catch(() => null);
  const parsed = chatRequestSchema.safeParse(payload);
  const messages = normaliseMessages(parsed.success ? (parsed.data.messages ?? []) : []);
  if (!messages.length) return badRequest("أرسل سؤالاً صالحاً من فضلك.");

  const quota = await checkChatRateLimit(req);
  const headers = quotaHeaders(quota.remaining, quota.limit);

  if (!quota.allowed) {
    return NextResponse.json(
      { success: false, error: { code: "RATE_LIMITED", message: RATE_LIMIT_MESSAGE } },
      { status: 429, headers }
    );
  }

  const direct = localAnswer(messages.at(-1)?.content ?? "");
  if (direct) return textResponse(direct, quota.remaining, quota.limit, "platform-faq");

  try {
    const { id, stream } = await openReliableStream(
      messages,
      parsed.success ? (parsed.data.preferredModel ?? "auto") : "auto"
    );
    const encoder = new TextEncoder();

    const output = new ReadableStream({
      async start(controller) {
        let sent = false;
        try {
          for await (const chunk of stream) {
            if (!chunk) continue;
            sent = true;
            controller.enqueue(encoder.encode(chunk));
          }
        } catch (error) {
          logger.error("Chat", "streamIteration", toError(error));
        } finally {
          if (!sent) controller.enqueue(encoder.encode(FALLBACK_HELP));
          controller.close();
        }
      },
    });

    return new Response(output, {
      status: 200,
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "no-cache, no-store",
        "X-AI-Provider": id,
        ...headers,
      },
    });
  } catch (error) {
    logger.error("Chat", "providersOffline", toError(error));
    return NextResponse.json(
      { success: false, error: { code: "ASSISTANT_OFFLINE", message: FALLBACK_HELP } },
      { status: 503, headers }
    );
  }
}
