"use client";

import { botPresenceModeSchema } from "@/lib/chat/schemas";
import { BOT_PRESENCE_KEY, type BotPresenceMode } from "@/presentation/constants";
import { useLocalStorageState } from "../useLocalStorageState";

export function useBotPresence() {
  const [stored, setStored] = useLocalStorageState<BotPresenceMode>(BOT_PRESENCE_KEY, "full");
  const parsed = botPresenceModeSchema.safeParse(stored);
  const mode = parsed.success ? parsed.data : "full";

  return {
    mode,
    setMode: (next: BotPresenceMode) => {
      const value = botPresenceModeSchema.safeParse(next);
      if (value.success) setStored(value.data);
    },
    showBot: mode !== "hidden",
    showTips: mode === "full"
  };
}
