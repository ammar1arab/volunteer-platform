import { ok } from "@/core/application/dtos";
import { badRequest, checkRateLimit, csrfCheck, toResponse } from "@/lib/api-utils";
import { chatPromoPolishRequestSchema, chatPromoPolishSchema } from "@/lib/chat/schemas";
import { logger, toError } from "@/lib/utils";
import { openReliableStream } from "../chatRuntime";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 20;

const CACHE_MS = 6 * 60 * 60 * 1000;
const KIND_HINT: Record<string, string> = {
  activity: "دعوة للمشاركة في فرصة تطوعية",
  post: "دعوة للاطلاع على منشور عن إنجازات المنصة",
  magazine: "تذكير بالعدد الجديد من المجلة",
  spotlight: "دعوة للتعرّف إلى متطوع مميّز"
};

const cache = new Map<string, { text: string; until: number }>();

function clientKey(req: Request) {
  return req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "promo";
}

function cleanLine(raw: string) {
  return raw
    .replace(/["«»]/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 140);
}

async function rewrite(kind: string, title: string) {
  const { stream } = await openReliableStream([
    {
      role: "user",
      content:
        `أعد صياغة جملة عربية فصيحة مهنية قصيرة جداً (${KIND_HINT[kind] ?? "دعوة لطيفة"}). ` +
        `العنوان: ${title}. جملة واحدة فقط، بلا لهجة عامية، وبلا شرح.`
    }
  ]);

  let text = "";
  for await (const chunk of stream) text += chunk;
  const parsed = chatPromoPolishSchema.safeParse({ text: cleanLine(text) });
  return parsed.success ? parsed.data.text : "";
}

export async function POST(req: Request) {
  const csrf = csrfCheck(req);
  if (csrf) return csrf;
  if (!checkRateLimit(`promo:${clientKey(req)}`, 30, 60_000)) {
    return badRequest("تعذّر تحديث الدعوة حالياً.");
  }

  const parsed = chatPromoPolishRequestSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return badRequest("أرسل بيانات صالحة من فضلك.");

  const key = `${parsed.data.kind}:${parsed.data.id}`;
  const hit = cache.get(key);
  if (hit && hit.until > Date.now()) return toResponse(ok({ text: hit.text }));

  try {
    const text = await rewrite(parsed.data.kind, parsed.data.title);
    if (!text) return toResponse(ok({ text: "" }));
    cache.set(key, { text, until: Date.now() + CACHE_MS });
    return toResponse(ok({ text }));
  } catch (error) {
    logger.warn("Chat", "promoPolish", toError(error).message);
    return toResponse(ok({ text: "" }));
  }
}
