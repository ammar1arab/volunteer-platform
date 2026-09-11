"use client";

import { useCallback, useMemo } from "react";
import type { ChatProviderId, ChatStoreDto, StoredChatMessageDto } from "@/core/application/dtos";
import { CHAT_STORED_CONTENT_MAX, chatStoreSchema, conversationsSchema } from "@/lib/chat/schemas";
import { CHAT_WELCOME } from "@/presentation/constants";
import { useLocalStorageState } from "../useLocalStorageState";

const STORE_KEY = "basmat-chat-store";
const LEGACY_KEY = "basmat-chats";
const MAX_CHATS = 12;
const MAX_MESSAGES = 40;
const MAX_TITLE = 42;

export type ChatMessagesUpdate =
  | StoredChatMessageDto[]
  | ((current: StoredChatMessageDto[]) => StoredChatMessageDto[]);

export const createChatId = () => `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;

function trimConversation(messages: StoredChatMessageDto[]) {
  return messages.slice(-MAX_MESSAGES).map((message) => ({
    ...message,
    content: message.content.slice(0, CHAT_STORED_CONTENT_MAX),
  }));
}

function compactStore(value: ChatStoreDto): ChatStoreDto {
  return {
    ...value,
    chats: value.chats.slice(0, MAX_CHATS).map((chat) => ({
      ...chat,
      title: chat.title.slice(0, MAX_TITLE),
      messages: trimConversation(chat.messages),
    })),
  };
}

function readStore(): ChatStoreDto {
  const empty: ChatStoreDto = { activeId: createChatId(), preferredModel: "auto", chats: [] };
  if (typeof window === "undefined") return empty;

  try {
    const raw = localStorage.getItem(STORE_KEY);
    const parsed = raw ? chatStoreSchema.safeParse(JSON.parse(raw)) : null;
    if (parsed?.success) return compactStore(parsed.data);

    const legacyRaw = localStorage.getItem(LEGACY_KEY) ?? sessionStorage.getItem(LEGACY_KEY);
    const legacy = legacyRaw ? conversationsSchema.safeParse(JSON.parse(legacyRaw)) : null;
    if (!legacy?.success) return empty;

    const migrated = compactStore({ ...empty, chats: legacy.data });
    try {
      localStorage.setItem(STORE_KEY, JSON.stringify(migrated));
      localStorage.removeItem(LEGACY_KEY);
      sessionStorage.removeItem(LEGACY_KEY);
    } catch {
      /* ignore */
    }
    return migrated;
  } catch {
    return empty;
  }
}

export const useChatStore = () => {
  const [store, setStore] = useLocalStorageState<ChatStoreDto>(STORE_KEY, readStore);

  const messages = useMemo(
    () => store.chats.find((chat) => chat.id === store.activeId)?.messages ?? [CHAT_WELCOME],
    [store.activeId, store.chats]
  );

  const setMessages = useCallback(
    (update: ChatMessagesUpdate) => {
      setStore((current) => {
        const existing =
          current.chats.find((chat) => chat.id === current.activeId)?.messages ?? [CHAT_WELCOME];
        const next = trimConversation(typeof update === "function" ? update(existing) : update);
        const chat = {
          id: current.activeId,
          title:
            next.find((message) => message.role === "user")?.content.slice(0, MAX_TITLE) ||
            "محادثة جديدة",
          messages: next,
        };
        const rest = current.chats.filter((item) => item.id !== current.activeId);
        return compactStore({ ...current, chats: [chat, ...rest] });
      });
    },
    [setStore]
  );

  const newChat = useCallback(
    () => setStore((current) => ({ ...current, activeId: createChatId() })),
    [setStore]
  );

  const selectChat = useCallback(
    (id: string) => setStore((current) => ({ ...current, activeId: id })),
    [setStore]
  );

  const deleteChat = useCallback(
    (id: string) =>
      setStore((current) => ({
        ...current,
        chats: current.chats.filter((chat) => chat.id !== id),
        activeId: current.activeId === id ? createChatId() : current.activeId,
      })),
    [setStore]
  );

  const setPreferredModel = useCallback(
    (preferredModel: ChatProviderId) => setStore((current) => ({ ...current, preferredModel })),
    [setStore]
  );

  return {
    chats: store.chats,
    activeId: store.activeId,
    preferredModel: store.preferredModel,
    messages,
    setMessages,
    newChat,
    selectChat,
    deleteChat,
    setPreferredModel,
  };
};
