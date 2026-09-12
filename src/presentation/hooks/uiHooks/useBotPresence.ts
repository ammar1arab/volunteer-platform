"use client";

import {
  BOT_PRESENCE_KEY,
  type BotPresenceMode
} from "@/presentation/constants";
import { useLocalStorageState } from "@/presentation/hooks/useLocalStorageState";

function parseMode(value: BotPresenceMode | string): BotPresenceMode {
  return value === "bot" || value === "hidden" || value === "full" ? value : "full";
}

export function useBotPresence() {
  const [stored, setStored] = useLocalStorageState<BotPresenceMode>(BOT_PRESENCE_KEY, "full");
  const mode = parseMode(stored);

  return {
    mode,
    setMode: (next: BotPresenceMode) => setStored(parseMode(next)),
    showBot: mode !== "hidden",
    showTips: mode === "full"
  };
}
