import { apiClient } from "./client.service";
import { API_ENDPOINTS } from "@/lib/config";
import type { GetChatMetaResponse, SendChatMessageInput } from "@/core/application/dtos";

export const chatApi = {
  getMeta: () => apiClient.get<GetChatMetaResponse>(API_ENDPOINTS.CHAT.BASE),

  sendMessage: (input: SendChatMessageInput, signal: AbortSignal) =>
    fetch(API_ENDPOINTS.CHAT.BASE, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
      signal
    })
};
