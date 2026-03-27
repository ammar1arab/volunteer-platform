import Groq from "groq-sdk";
import { badRequest, checkRateLimit } from "@/lib/api-utils";
import { SYSTEM_PROMPT } from "./systemPrompt";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MODEL_PRIMARY  = "llama-3.3-70b-versatile";
const MODEL_FALLBACK = "llama-3.1-8b-instant";

const STREAM_HEADERS = {
  "Content-Type": "text/plain; charset=utf-8",
  "Cache-Control": "no-cache, no-store",
} as const;

const MSG_RATE_LIMIT = "⏳ المساعد مشغول قليلاً، يرجى الانتظار لحظة والمحاولة مجدداً.";
const MSG_ERROR      = "عذراً، حدث خطأ تقني. يرجى إعادة المحاولة. 🔄";

interface ChatMessage {
  role:    "user" | "assistant";
  content: string;
}

function isRateLimitError(err: unknown): boolean {
  if (typeof err !== "object" || err === null) return false;
  const e = err as { status?: number; message?: string; error?: { type?: string } };
  return (
    e.status === 429 ||
    e.error?.type === "rate_limit_exceeded" ||
    (typeof e.message === "string" &&
      (e.message.includes("429") || e.message.includes("rate_limit")))
  );
}

async function callGroq(
  groq:     Groq,
  model:    string,
  messages: Groq.Chat.ChatCompletionMessageParam[]
) {
  return groq.chat.completions.create({
    model,
    messages,
    max_tokens:  1024,
    temperature: 0.7,
    stream:      true,
  });
}

function textStream(text: string): Response {
  return new Response(text, { status: 200, headers: STREAM_HEADERS });
}

export async function POST(req: Request): Promise<Response> {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    console.error("[chat] GROQ_API_KEY is not set");
    return textStream(MSG_ERROR);
  }

  // Per-IP rate limit: 20 requests / minute
  const ip = req.headers.get("x-forwarded-for") ?? "unknown";
  if (!checkRateLimit(`chat:${ip}`, 20, 60_000)) {
    return textStream(MSG_RATE_LIMIT);
  }

  const body = await req.json().catch(() => null) as { messages?: ChatMessage[] } | null;
  if (!body) return badRequest("Invalid JSON body");

  const messages = body.messages;
  if (!Array.isArray(messages) || messages.length === 0) {
    return badRequest("No messages provided");
  }

  const validMessages = messages.filter(
    (m) => m && typeof m.role === "string" && typeof m.content === "string" && m.content.trim()
  );
  if (validMessages.length === 0) return badRequest("No valid content");

  const groq = new Groq({ apiKey });

  const groqMessages: Groq.Chat.ChatCompletionMessageParam[] = [
    { role: "system", content: SYSTEM_PROMPT },
    ...validMessages.map((m) => ({ role: m.role as "user" | "assistant", content: m.content })),
  ];

  // Try primary model, auto-fallback to fast model on rate limit
  let streamResponse: Awaited<ReturnType<typeof callGroq>>;
  let modelUsed = MODEL_PRIMARY;

  try {
    streamResponse = await callGroq(groq, MODEL_PRIMARY, groqMessages);
  } catch (primaryErr) {
    if (!isRateLimitError(primaryErr)) {
      console.error("[chat] Groq error:", primaryErr);
      return textStream(MSG_ERROR);
    }
    console.warn("[chat] Primary model rate limited, switching to fallback...");
    try {
      streamResponse = await callGroq(groq, MODEL_FALLBACK, groqMessages);
      modelUsed      = MODEL_FALLBACK;
    } catch (fallbackErr) {
      console.error("[chat] Fallback model also failed:", fallbackErr);
      return textStream(isRateLimitError(fallbackErr) ? MSG_RATE_LIMIT : MSG_ERROR);
    }
  }

  console.info(`[chat] model=${modelUsed} ip=${ip}`);

  const stream = new ReadableStream({
    async start(controller) {
      const encoder = new TextEncoder();
      try {
        for await (const chunk of streamResponse) {
          const text = chunk.choices[0]?.delta?.content;
          if (text) controller.enqueue(encoder.encode(text));
        }
      } catch (err) {
        console.error("[chat] Stream error:", err);
        controller.enqueue(encoder.encode("\n\n" + (isRateLimitError(err) ? MSG_RATE_LIMIT : MSG_ERROR)));
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, { status: 200, headers: STREAM_HEADERS });
}
