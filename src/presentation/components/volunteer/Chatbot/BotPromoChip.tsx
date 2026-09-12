"use client";

import {
  Award,
  BookOpen,
  CalendarDays,
  HeartHandshake,
  Newspaper,
  Smile,
  Sparkles,
  UserRound,
  type LucideIcon
} from "lucide-react";
import { useRouter } from "next/navigation";
import type { ChatPromoIcon } from "@/presentation/constants";
import type { BotPromoTip } from "@/presentation/hooks/uiHooks/useBotPromoTips";
import styles from "./Chatbot.module.scss";

const ICONS: Record<ChatPromoIcon, LucideIcon> = {
  Smile,
  HeartHandshake,
  Award,
  UserRound,
  CalendarDays,
  BookOpen,
  Sparkles,
  Newspaper
};

type Props = {
  tip: BotPromoTip;
  onOpenChat: () => void;
};

const BotPromoChip = ({ tip, onOpenChat }: Props) => {
  const router = useRouter();
  const Icon = ICONS[tip.icon];

  function activate() {
    if (tip.action.type === "chat") {
      onOpenChat();
      return;
    }
    router.push(tip.action.href);
  }

  return (
    <button className={styles.promo} type="button" onClick={activate}>
      <Icon size={15} aria-hidden />
      <span>{tip.text}</span>
    </button>
  );
};

export default BotPromoChip;
