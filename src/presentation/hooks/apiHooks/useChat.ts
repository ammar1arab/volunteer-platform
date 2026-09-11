"use client";

import { useCallback, useMemo, useRef, useState } from "react";
import type { ChatMetaDto, ChatModelOptionDto, StoredChatMessageDto } from "@/core/application/dtos";
import { chatApi } from "@/presentation/services";
import { CHAT_MODEL_CONTENT_MAX, CHAT_STORED_CONTENT_MAX, chatMetaSchema } from "@/lib/chat/schemas";
import {
  CHAT_DEFAULT_LIMIT,
  CHAT_HISTORY_WINDOW,
  CHAT_TEXT,
  CHAT_WELCOME
} from "@/presentation/constants";
import {
  EMPTY_ARRAY,
  getErrorMessage,
  queryKeys,
  unwrapResult,
  useCacheUpdater,
  useFetchData
} from "@/presentation/query";
import { createChatId, useChatStore } from "../uiHooks/useChatStore";

const META_KEY = queryKeys.chat.meta();

const AUTO_MODEL: ChatModelOptionDto = { id: "auto", label: "Auto", available: true };

const FALLBACK_META: ChatMetaDto = {
  remaining: CHAT_DEFAULT_LIMIT,
  limit: CHAT_DEFAULT_LIMIT,
  defaultModel: "auto",
  models: [AUTO_MODEL]
};

export const useChat = (enabled: boolean) => {
  const store = useChatStore();
  const { updateData } = useCacheUpdater<ChatMetaDto>(META_KEY);
  const [pendingId, setPendingId] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const streamFrameRef = useRef(0);
  const messagesRef = useRef(store.messages);
  messagesRef.current = store.messages;

  const query = useFetchData<ChatMetaDto>({
    queryKey: META_KEY,
    request: async () => {
      try {
        const parsed = chatMetaSchema.safeParse(unwrapResult(await chatApi.getMeta()));
        return parsed.success ? parsed.data : FALLBACK_META;
      } catch {
        return FALLBACK_META;
      }
    },
    options: { enabled, staleTime: 30_000 }
  });

  const remaining = query.data?.remaining ?? null;
  const limit = query.data?.limit ?? CHAT_DEFAULT_LIMIT;
  const outOfQuota = remaining !== null && remaining <= 0;

  const models = useMemo(() => {
    const available = (query.data?.models ?? EMPTY_ARRAY).filter((model) => model.available);
    return available.length ? available : [AUTO_MODEL];
  }, [query.data?.models]);

  const preferredModel = models.some((model) => model.id === store.preferredModel)
    ? store.preferredModel
    : "auto";

  const stop = useCallback(() => {
    abortRef.current?.abort();
    abortRef.current = null;
    if (streamFrameRef.current) {
      cancelAnimationFrame(streamFrameRef.current);
      streamFrameRef.current = 0;
    }
    setPendingId(null);
  }, []);

  const { setMessages } = store;

  const run = useCallback(
    async (text: string, replaceId?: string) => {
      const content = text.trim();
      if (!content || abortRef.current) return;

      const assistantId = replaceId ?? createChatId();
      const history: StoredChatMessageDto[] = replaceId
        ? messagesRef.current.filter((message) => message.id !== replaceId)
        : [...messagesRef.current, { id: createChatId(), role: "user", content }];

      setMessages([...history, { id: assistantId, role: "assistant", content: "" }]);
      setPendingId(assistantId);

      const controller = new AbortController();
      abortRef.current = controller;
      let answer = "";

      const writeAnswer = (next: string) => {
        setMessages((current) =>
          current.map((message) =>
            message.id === assistantId ? { ...message, content: next } : message
          )
        );
      };

      try {
        const response = await chatApi.sendMessage(
          {
            messages: history
              .filter((item) => item.id !== CHAT_WELCOME.id && !item.error && item.content)
              .slice(-CHAT_HISTORY_WINDOW)
              .map(({ role, content: value }) => ({
                role,
                content: value.slice(0, CHAT_MODEL_CONTENT_MAX)
              })),
            preferredModel
          },
          controller.signal
        );

        const quotaRemaining = Number(response.headers.get("X-Chat-Remaining"));
        const quotaLimit = Number(response.headers.get("X-Chat-Limit"));
        if (Number.isFinite(quotaRemaining) && quotaLimit > 0) {
          updateData((current) => ({
            ...(current ?? FALLBACK_META),
            remaining: quotaRemaining,
            limit: quotaLimit
          }));
        }

        if (!response.ok || !response.body) {
          const body = await response.json().catch(() => null);
          const message =
            body && typeof body === "object" && "error" in body
              ? (body as { error?: { message?: string } }).error?.message
              : null;
          throw new Error(message || CHAT_TEXT.sendFailed);
        }

        const reader = response.body.getReader();
        const decoder = new TextDecoder();

        for (;;) {
          const { done, value } = await reader.read();
          if (done) break;
          answer = (answer + decoder.decode(value, { stream: true })).slice(
            0,
            CHAT_STORED_CONTENT_MAX
          );
          if (answer.length >= CHAT_STORED_CONTENT_MAX) break;
          if (streamFrameRef.current) continue;
          const snapshot = answer;
          streamFrameRef.current = requestAnimationFrame(() => {
            streamFrameRef.current = 0;
            writeAnswer(snapshot);
          });
        }

        if (streamFrameRef.current) {
          cancelAnimationFrame(streamFrameRef.current);
          streamFrameRef.current = 0;
        }
        writeAnswer((answer + decoder.decode()).slice(0, CHAT_STORED_CONTENT_MAX));
      } catch (error) {
        if (controller.signal.aborted) {
          setMessages((current) =>
            answer.trim()
              ? current.map((message) =>
                  message.id === assistantId ? { ...message, content: answer } : message
                )
              : current.filter((message) => message.id !== assistantId)
          );
          return;
        }
        const failure = getErrorMessage(error, CHAT_TEXT.sendFailed);
        setMessages((current) =>
          current.map((message) =>
            message.id === assistantId ? { ...message, content: failure, error: true } : message
          )
        );
      } finally {
        if (streamFrameRef.current) {
          cancelAnimationFrame(streamFrameRef.current);
          streamFrameRef.current = 0;
        }
        if (abortRef.current === controller) {
          abortRef.current = null;
          setPendingId(null);
        }
      }
    },
    [preferredModel, setMessages, updateData]
  );

  const send = useCallback(
    (text: string) => {
      if (!outOfQuota) void run(text);
    },
    [outOfQuota, run]
  );

  const regenerate = useCallback(() => {
    const current = messagesRef.current;
    const assistant = [...current]
      .reverse()
      .find((message) => message.role === "assistant" && message.id !== CHAT_WELCOME.id);
    const user = [...current].reverse().find((message) => message.role === "user");
    if (assistant && user && !outOfQuota) void run(user.content, assistant.id);
  }, [outOfQuota, run]);

  const canRegenerate =
    pendingId === null &&
    store.messages.some((message) => message.role === "user") &&
    store.messages.some(
      (message) => message.role === "assistant" && message.id !== CHAT_WELCOME.id
    );

  return {
    ...store,
    preferredModel,
    models,
    remaining,
    limit,
    outOfQuota,
    metaLoading: query.isLoading,
    sending: pendingId !== null,
    pendingId,
    canRegenerate,
    send,
    stop,
    regenerate
  };
};
