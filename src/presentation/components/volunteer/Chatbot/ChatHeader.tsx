"use client";

import Image from "next/image";
import { ChevronDown, History, RotateCcw, Sparkles } from "lucide-react";
import type { ChatModelOptionDto, ChatProviderId } from "@/core/application/dtos";
import Tooltip from "@/presentation/components/base/Tooltip/Tooltip";
import {
  CHAT_ASSISTANT_NAME,
  CHAT_ASSISTANT_ROLE,
  CHAT_LOW_QUOTA,
  CHAT_TEXT,
  CHAT_TIPS
} from "@/presentation/constants";
import ChatModelSelect from "./ChatModelSelect";
import styles from "./Chatbot.module.scss";

type Props = {
  remaining: number | null;
  limit: number;
  models: ChatModelOptionDto[];
  preferredModel: ChatProviderId;
  historyOpen: boolean;
  onModelChange: (model: ChatProviderId) => void;
  onOpenAgent: () => void;
  onToggleHistory: () => void;
  onNewChat: () => void;
  onMinimize: () => void;
};

const ChatHeader = ({
  remaining,
  limit,
  models,
  preferredModel,
  historyOpen,
  onModelChange,
  onOpenAgent,
  onToggleHistory,
  onNewChat,
  onMinimize
}: Props) => {
  const quotaTone =
    remaining === null || remaining > CHAT_LOW_QUOTA
      ? ""
      : remaining <= 0
        ? styles.quotaEmpty
        : styles.quotaLow;

  const selectedModel = models.some((model) => model.id === preferredModel)
    ? preferredModel
    : "auto";

  return (
    <header className={styles.header}>
      <div className={styles.identity}>
        <Image
          className={styles.avatar}
          src="/images/basmat-agent-greeting.png"
          alt=""
          width={60}
          height={60}
          priority
        />
        <div>
          <strong>{CHAT_ASSISTANT_NAME}</strong>
          <span>
            <i />
            {CHAT_ASSISTANT_ROLE}
          </span>
        </div>

        <div className={styles.actions}>
          <Tooltip content={CHAT_TIPS.history} side="bottom">
            <button
              type="button"
              className={`${styles.iconBtn} ${historyOpen ? styles.iconBtnOn : ""}`}
              onClick={onToggleHistory}
              aria-expanded={historyOpen}
              aria-label={CHAT_TIPS.history}
            >
              <History size={16} />
            </button>
          </Tooltip>

          <Tooltip content={CHAT_TIPS.newChat} side="bottom">
            <button
              type="button"
              className={styles.iconBtn}
              onClick={onNewChat}
              aria-label={CHAT_TIPS.newChat}
            >
              <RotateCcw size={16} />
            </button>
          </Tooltip>

          <Tooltip content={CHAT_TIPS.minimize} side="bottom">
            <button
              type="button"
              className={styles.iconBtn}
              onClick={onMinimize}
              aria-label={CHAT_TIPS.minimize}
            >
              <ChevronDown size={19} />
            </button>
          </Tooltip>
        </div>
      </div>

      <div className={styles.toolbar}>
        <div className={styles.modelPicker}>
          <ChatModelSelect
            models={models}
            value={selectedModel}
            onChange={onModelChange}
          />
        </div>

        <div className={styles.toolbarEnd}>
          <Tooltip content={CHAT_TIPS.quota} side="bottom">
            <span className={`${styles.quota} ${quotaTone}`} aria-label={CHAT_TEXT.quotaLabel}>
              <span className={styles.quotaValue}>{remaining ?? "…"}</span>
              <span className={styles.quotaSep}>/</span>
              <span className={styles.quotaLimit}>{limit}</span>
            </span>
          </Tooltip>

          <Tooltip content={CHAT_TIPS.cta} side="bottom">
            <button
              type="button"
              className={styles.ctaIcon}
              onClick={onOpenAgent}
              aria-label={CHAT_TIPS.cta}
            >
              <Sparkles size={14} />
            </button>
          </Tooltip>
        </div>
      </div>
    </header>
  );
};

export default ChatHeader;
