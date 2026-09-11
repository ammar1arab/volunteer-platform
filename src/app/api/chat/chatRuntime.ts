import Groq from "groq-sdk";
import type { ChatMessageDto, ChatProviderId } from "@/core/application/dtos";
import { logger, toError } from "@/lib/utils";
import { SYSTEM_PROMPT } from "@/app/api/chat/systemPrompt";
import {
  CHAT_MODEL_CONTENT_MAX,
  CHAT_REQUEST_MESSAGES_MAX,
  chatMessageSchema,
  geminiResponseSchema,
  openRouterResponseSchema,
} from "@/lib/chat/schemas";
import { ResponseGuard } from "./responseGuard";

type Provider = {
  id: Exclude<ChatProviderId, "auto">;
  label: string;
  model: string;
  enabled: () => boolean;
  run: (messages: ChatMessageDto[]) => Promise<AsyncIterable<string>> | AsyncIterable<string>;
};

type GroqControls = {
  reasoning_format?: "hidden";
  reasoning_effort?: "none";
  include_reasoning?: false;
};

type Health = { failures: number; coolingUntil: number; latency: number };

class ProviderHttpError extends Error {
  readonly status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "ProviderHttpError";
    this.status = status;
  }
}

const health = new Map<string, Health>();
const MAX_TOKENS = 900;
const MAX_OUTPUT_CHARS = 4000;

export const FALLBACK_HELP =
  "تأخّر الرد هذه المرة. جرّب مرة أخرى بعد قليل وسنكمل من حيث توقفنا.";

const PLATFORM_ANSWERS: Record<string, string> = {
  "كيف أنضم لنشاط":
    "للانضمام لنشاط: افتح صفحة الأنشطة، اختر النشاط المناسب، راجع التفاصيل، ثم سجّل الدخول واضغط «انضم». سيظهر طلبك كقيد المراجعة إلى أن تعتمد الإدارة المشاركة.",
  "كيف أحصل على شهادة":
    "تُصدر الشهادة بعد اكتمال النشاط وتسجيل حضورك. ستجدها في قسم «شهاداتي» داخل ملفك الشخصي، وستصلك إشعارات عند إصدارها.",
  "كيف أسجل في المنصة":
    "أنشئ حساباً من صفحة التسجيل، ثم تحقّق من بريدك الإلكتروني بالرمز الذي يصلك. بعد التحقق تستطيع إكمال ملفك والتقديم على الأنشطة.",
};

const GREETINGS = /^(كيفك|كيف حالك|مرحبا|مرحباً|أهلا|اهلا|هلا|السلام عليكم)$/u;

function normaliseQuestion(question: string): string {
  return question.trim().replace(/[؟?!.,،ّ]/g, "");
}

function redactSensitive(text: string): string {
  return text
    .replace(/[\w.+-]+@[\w-]+\.[\w.-]+/g, "[email removed]")
    .replace(/(?:\+?962|0)?7\d{8}/g, "[phone removed]")
    .replace(
      /(?:password|otp|verification code|رمز التحقق|كلمة المرور)\s*[:=]?\s*\S+/gi,
      "[sensitive value removed]"
    );
}

export function normaliseMessages(messages: ChatMessageDto[]): ChatMessageDto[] {
  return messages
    .map((message) => chatMessageSchema.safeParse(message))
    .flatMap((parsed) => (parsed.success ? [parsed.data] : []))
    .map(({ role, content }) => ({
      role,
      content: redactSensitive(content.trim()).slice(0, CHAT_MODEL_CONTENT_MAX),
    }))
    .filter((message) => message.content.length > 0)
    .slice(-CHAT_REQUEST_MESSAGES_MAX);
}

export function localAnswer(question: string): string | null {
  const normalized = normaliseQuestion(question);
  if (GREETINGS.test(normalized)) return "أهلاً بك 💚 كيف أقدر أساعدك اليوم؟";
  return PLATFORM_ANSWERS[normalized] ?? null;
}

async function* groqStream(
  model: string,
  messages: ChatMessageDto[],
  controls: GroqControls
): AsyncIterable<string> {
  const groq = new Groq({ apiKey: process.env.GROQ_API_KEY, timeout: 10_000, maxRetries: 0 });
  const stream = await groq.chat.completions.create({
    model,
    messages: [{ role: "system", content: SYSTEM_PROMPT }, ...messages],
    max_tokens: MAX_TOKENS,
    temperature: 0.35,
    stream: true,
    ...controls,
  });
  for await (const chunk of stream) {
    const text = chunk.choices[0]?.delta?.content;
    if (text) yield text;
  }
}

async function* geminiResponse(
  messages: ChatMessageDto[],
  model = "gemini-3.1-flash-lite"
): AsyncIterable<string> {
  const key = process.env.GEMINI_API_KEY;
  if (!key) throw new Error("Gemini is not configured");

  const contents = messages.map((message) => ({
    role: message.role === "assistant" ? "model" : "user",
    parts: [{ text: message.content }],
  }));

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-goog-api-key": key },
      signal: AbortSignal.timeout(10_000),
      body: JSON.stringify({
        system_instruction: { parts: [{ text: SYSTEM_PROMPT }] },
        contents,
        generationConfig: { maxOutputTokens: MAX_TOKENS, temperature: 0.35 },
      }),
    }
  );

  if (!response.ok) throw new ProviderHttpError(`Gemini ${response.status}`, response.status);

  const parsed = geminiResponseSchema.safeParse(await response.json());
  if (!parsed.success) throw new Error("Gemini returned an unexpected payload");

  const text =
    parsed.data.candidates?.[0]?.content?.parts
      ?.filter((part) => !part.thought)
      .map((part) => part.text ?? "")
      .join("") ?? "";

  if (!text) throw new Error("Gemini returned no text");
  yield text;
}

const providers: Provider[] = [
  {
    id: "nebula",
    label: "Nebula",
    model: "qwen/qwen3.6-27b",
    enabled: () => Boolean(process.env.GROQ_API_KEY),
    run: async (messages) =>
      groqStream("qwen/qwen3.6-27b", messages, {
        reasoning_format: "hidden",
        reasoning_effort: "none",
      }),
  },
  {
    id: "quasar",
    label: "Quasar",
    model: "gemini-3.1-flash-lite",
    enabled: () => Boolean(process.env.GEMINI_API_KEY),
    run: async (messages) => geminiResponse(messages, "gemini-3.1-flash-lite"),
  },
  {
    id: "andromeda",
    label: "Andromeda",
    model: "openai/gpt-oss-20b",
    enabled: () => Boolean(process.env.GROQ_API_KEY),
    run: async (messages) => groqStream("openai/gpt-oss-20b", messages, { include_reasoning: false }),
  },
  {
    id: "polaris",
    label: "Polaris",
    model: "openrouter/free",
    enabled: () => Boolean(process.env.OPENROUTER_API_KEY),
    run: async function* (messages) {
      const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        signal: AbortSignal.timeout(10_000),
        headers: {
          Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "openrouter/free",
          messages: [{ role: "system", content: SYSTEM_PROMPT }, ...messages],
          max_tokens: MAX_TOKENS,
          reasoning: { exclude: true },
        }),
      });

      if (!response.ok) throw new ProviderHttpError("OpenRouter unavailable", response.status);

      const parsed = openRouterResponseSchema.safeParse(await response.json());
      if (!parsed.success) throw new Error("OpenRouter returned an unexpected payload");
      yield parsed.data.choices?.[0]?.message?.content || "";
    },
  },
];

export function listChatModels() {
  return providers.map((provider) => ({
    id: provider.id as ChatProviderId,
    label: provider.label,
    available: provider.enabled(),
  }));
}

function rankProviders(preferredModel: ChatProviderId = "auto"): Provider[] {
  const now = Date.now();
  const ready = providers.filter(
    (provider) => provider.enabled() && (health.get(provider.id)?.coolingUntil ?? 0) <= now
  );
  if (preferredModel === "auto") return ready;
  const preferred = ready.find((provider) => provider.id === preferredModel);
  if (!preferred) return ready;
  return [preferred, ...ready.filter((provider) => provider.id !== preferred.id)];
}

function recordHealth(id: string, latency: number | null) {
  const previous = health.get(id) ?? { failures: 0, coolingUntil: 0, latency: 0 };
  if (latency === null) {
    const failures = previous.failures + 1;
    health.set(id, {
      ...previous,
      failures,
      coolingUntil: Date.now() + Math.min(15 * 60_000, 30_000 * 2 ** failures),
    });
    return;
  }
  health.set(id, {
    failures: 0,
    coolingUntil: 0,
    latency: previous.latency ? Math.round((previous.latency + latency) / 2) : latency,
  });
}

export async function openReliableStream(
  messages: ChatMessageDto[],
  preferredModel: ChatProviderId = "auto",
  excluded = new Set<string>()
) {
  const failures: string[] = [];
  const candidateProviders = rankProviders(preferredModel).filter(
    (candidate) => !excluded.has(candidate.id)
  );

  for (const provider of candidateProviders) {
    const started = Date.now();
    try {
      const rawStream = await provider.run(messages);
      const iterator = rawStream[Symbol.asyncIterator]();
      const guard = new ResponseGuard();

      let initialChunk = "";
      let nextResult = await iterator.next();

      while (!nextResult.done) {
        const text = guard.push(nextResult.value);
        if (text) {
          initialChunk = text;
          break;
        }
        nextResult = await iterator.next();
      }

      if (!initialChunk && nextResult.done) {
        initialChunk = guard.finish().trim();
      }

      if (!initialChunk && nextResult.done) {
        throw new Error("Provider returned empty response");
      }

      if (/thinking process|<\/?think|<\/?analysis/i.test(initialChunk)) {
        throw new Error("Invalid provider answer with thinking tags");
      }

      recordHealth(provider.id, Date.now() - started);

      async function* streamOutput(): AsyncIterable<string> {
        let produced = 0;
        const emit = (text: string) => {
          const remaining = MAX_OUTPUT_CHARS - produced;
          if (remaining <= 0) return "";
          const slice = text.length > remaining ? text.slice(0, remaining) : text;
          produced += slice.length;
          return slice;
        };

        const first = emit(initialChunk);
        if (first) yield first;

        try {
          while (produced < MAX_OUTPUT_CHARS) {
            const result = await iterator.next();
            if (result.done) break;
            const text = guard.push(result.value);
            const slice = text ? emit(text) : "";
            if (slice) yield slice;
          }
          if (produced < MAX_OUTPUT_CHARS) {
            const final = emit(guard.finish());
            if (final) yield final;
          }
        } catch (streamErr) {
          logger.error("Chat", "streamPlayback", toError(streamErr));
        } finally {
          await iterator.return?.();
        }
      }

      return { id: provider.id, stream: streamOutput(), provider: provider.label };
    } catch (error) {
      const failure = toError(error);
      const status = failure instanceof ProviderHttpError ? failure.status : "error";
      recordHealth(provider.id, null);
      failures.push(`${provider.model}:${status}`);
      logger.warn("Chat", "providerUnavailable", `${provider.model} (${status}): ${failure.message}`);
    }
  }

  throw new Error(`No AI provider available (${failures.join(", ") || "none configured"})`);
}
