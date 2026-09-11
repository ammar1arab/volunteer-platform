import type { Result } from "./base.dto";

export type ChatRole = "user" | "assistant";

export type ChatProviderId = "auto" | "nebula" | "quasar" | "andromeda" | "polaris";

export type ChatMessageDto = {
  role: ChatRole;
  content: string;
};

export type StoredChatMessageDto = ChatMessageDto & {
  id: string;
  error?: boolean;
};

export type ChatConversationDto = {
  id: string;
  title: string;
  messages: StoredChatMessageDto[];
};

export type ChatModelOptionDto = {
  id: ChatProviderId;
  label: string;
  available: boolean;
};

export type ChatQuotaDto = {
  remaining: number;
  limit: number;
};

export type ChatMetaDto = ChatQuotaDto & {
  defaultModel: "auto";
  models: ChatModelOptionDto[];
};

export type ChatStoreDto = {
  activeId: string;
  preferredModel: ChatProviderId;
  chats: ChatConversationDto[];
};

export type SendChatMessageInput = {
  messages: ChatMessageDto[];
  preferredModel: ChatProviderId;
};

export type GetChatMetaResponse = Result<ChatMetaDto>;
