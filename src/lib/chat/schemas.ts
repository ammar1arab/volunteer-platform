import { z } from "zod";
import type {
  ChatConversationDto,
  ChatMessageDto,
  ChatMetaDto,
  ChatPromoKind,
  ChatPromoPolishDto,
  ChatPromoPolishRequest,
  ChatProviderId,
  ChatStoreDto,
  StoredChatMessageDto,
} from "@/core/application/dtos";

export const chatProviderIdSchema = z.enum(["auto", "nebula", "quasar", "andromeda", "polaris"]);

const LEGACY_PROVIDER_IDS: Record<string, z.infer<typeof chatProviderIdSchema>> = {
  neptune: "nebula",
  olive: "nebula",
  mars: "quasar",
  jasmine: "quasar",
  venus: "andromeda",
  sage: "andromeda",
  pluto: "polaris",
  cedar: "polaris",
};

export const CHAT_STORED_CONTENT_MAX = 2500;
export const CHAT_MODEL_CONTENT_MAX = 900;
export const CHAT_REQUEST_MESSAGES_MAX = 6;
export const CHAT_REQUEST_BODY_MAX = 24_576;

export const preferredModelSchema = z.preprocess(
  (value) => (typeof value === "string" ? LEGACY_PROVIDER_IDS[value] ?? value : "auto"),
  chatProviderIdSchema.catch("auto")
);

export const chatMessageSchema = z.object({
  role: z.enum(["user", "assistant"]),
  content: z.string(),
});

const chatRequestMessageSchema = z.object({
  role: z.enum(["user", "assistant"]),
  content: z.string().max(CHAT_STORED_CONTENT_MAX),
});

export const chatRequestSchema = z.object({
  messages: z.array(chatRequestMessageSchema).max(CHAT_REQUEST_MESSAGES_MAX).optional(),
  preferredModel: preferredModelSchema.optional(),
});

export const storedChatMessageSchema = chatMessageSchema.extend({
  id: z.string(),
  error: z.boolean().optional(),
});

export const conversationsSchema = z.array(
  z.object({
    id: z.string(),
    title: z.string(),
    messages: z.array(storedChatMessageSchema),
  })
);

export const chatMetaSchema = z.object({
  remaining: z.number().int().nonnegative(),
  limit: z.number().int().positive(),
  defaultModel: z.literal("auto"),
  models: z.array(
    z.object({
      id: chatProviderIdSchema,
      label: z.string(),
      available: z.boolean(),
    })
  ),
});

export const chatStoreSchema = z.object({
  activeId: z.string(),
  preferredModel: preferredModelSchema,
  chats: conversationsSchema,
});

const geminiPartSchema = z.object({
  text: z.string().optional(),
  thought: z.boolean().optional(),
});

export const geminiResponseSchema = z.object({
  candidates: z
    .array(z.object({ content: z.object({ parts: z.array(geminiPartSchema).optional() }).optional() }))
    .optional(),
});

export const openRouterResponseSchema = z.object({
  choices: z
    .array(z.object({ message: z.object({ content: z.string().nullable().optional() }).optional() }))
    .optional(),
});

export const redisPipelineSchema = z.array(
  z.object({ result: z.union([z.number(), z.string()]).optional() })
);

export const chatPromoKindSchema = z.enum(["activity", "post", "magazine", "spotlight"]);

export const chatPromoPolishRequestSchema = z.object({
  kind: chatPromoKindSchema,
  id: z.string().min(1).max(80),
  title: z.string().min(1).max(160),
});

export const chatPromoPolishSchema = z.object({
  text: z.string().min(1).max(180),
});

type Matches<TSchema extends z.ZodType, TDto> = z.infer<TSchema> extends TDto ? true : false;

type SchemasMatchDtos = [
  Matches<typeof chatProviderIdSchema, ChatProviderId>,
  Matches<typeof chatMessageSchema, ChatMessageDto>,
  Matches<typeof storedChatMessageSchema, StoredChatMessageDto>,
  Matches<typeof conversationsSchema, ChatConversationDto[]>,
  Matches<typeof chatMetaSchema, ChatMetaDto>,
  Matches<typeof chatStoreSchema, ChatStoreDto>,
  Matches<typeof chatPromoKindSchema, ChatPromoKind>,
  Matches<typeof chatPromoPolishRequestSchema, ChatPromoPolishRequest>,
  Matches<typeof chatPromoPolishSchema, ChatPromoPolishDto>,
] extends true[]
  ? true
  : never;

export const schemasMatchDtos: SchemasMatchDtos = true;
