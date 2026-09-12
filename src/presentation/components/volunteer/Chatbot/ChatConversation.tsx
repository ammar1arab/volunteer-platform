"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Award, Copy, HelpCircle, MapPin, Sparkles, UserPlus, Zap } from "lucide-react";
import type { StoredChatMessageDto } from "@/core/application/dtos";
import { DomainFeaturedPostCategory } from "@/core/domain/enums";
import Tooltip from "@/presentation/components/base/Tooltip/Tooltip";
import { useActivities } from "@/presentation/hooks";
import {
  CATEGORY_LABELS,
  CHAT_BOT_POSES,
  CHAT_PAGE_PROMPTS,
  CHAT_PAGE_PROMPT_FALLBACK,
  CHAT_SUGGESTIONS,
  CHAT_TEXT,
  CHAT_TIPS,
  CHAT_WELCOME,
  ROUTES
} from "@/presentation/constants";
import styles from "./Chatbot.module.scss";

type Props = {
  messages: StoredChatMessageDto[];
  pendingId: string | null;
  sending: boolean;
  outOfQuota: boolean;
  onSend: (text: string) => void;
  bottomRef: React.RefObject<HTMLDivElement | null>;
};

const INTERESTS = [
  DomainFeaturedPostCategory.EDUCATION,
  DomainFeaturedPostCategory.TECHNOLOGY,
  DomainFeaturedPostCategory.ENVIRONMENT,
  DomainFeaturedPostCategory.HEALTH
] as const;

const SUGGESTION_ICONS = [Zap, Award, UserPlus, HelpCircle] as const;

const ChatConversation = ({
  messages,
  pendingId,
  sending,
  outOfQuota,
  onSend,
  bottomRef
}: Props) => {
  const pathname = usePathname();
  const [discoverOpen, setDiscoverOpen] = useState(false);
  const [interest, setInterest] = useState<DomainFeaturedPostCategory | null>(null);
  const [notice, setNotice] = useState("");
  const { list: activities } = useActivities({ filter: "published", enabled: discoverOpen });

  const recommended = activities
    .filter((activity) => !activity.isFull && (!interest || activity.categories.includes(interest)))
    .slice(0, 3);
  const isFresh = messages.length === 1;
  const showNextSteps = !sending && !isFresh && messages.some((message) => message.role === "user");

  return (
    <div className={styles.messages} aria-live="polite">
      {messages.map((message) => (
        <div
          className={`${styles.message} ${message.role === "user" ? styles.user : styles.assistant}`}
          key={message.id}
        >
          {message.role === "assistant" && (
            <Image
              className={styles.messageAvatar}
              src={
                pendingId === message.id
                  ? CHAT_BOT_POSES.thinking
                  : CHAT_BOT_POSES.success
              }
              alt=""
              width={32}
              height={32}
            />
          )}
          <div className={`${styles.bubble} ${message.error ? styles.error : ""}`}>
            {!message.content && pendingId === message.id ? (
              <span className={styles.typing}>
                <i />
                <i />
                <i />
              </span>
            ) : (
              message.content
                .split(/(\*\*[^*]+\*\*)/g)
                .map((part, index) =>
                  part.startsWith("**") ? (
                    <strong key={index}>{part.slice(2, -2)}</strong>
                  ) : (
                    <span key={index}>{part}</span>
                  )
                )
            )}
          </div>
          {message.role === "assistant" && message.content && !message.error && (
            <Tooltip content={CHAT_TIPS.copy}>
              <button
                className={styles.copy}
                type="button"
                aria-label={CHAT_TIPS.copy}
                onClick={() =>
                  navigator.clipboard
                    .writeText(message.content)
                    .then(() => setNotice(CHAT_TEXT.copied))
                    .catch(() => setNotice(CHAT_TEXT.copyFailed))
                }
              >
                <Copy size={13} />
              </button>
            </Tooltip>
          )}
        </div>
      ))}

      {showNextSteps && (
        <div className={styles.chips}>
          <Link href={ROUTES.ACTIVITIES} className={styles.chip}>
            تصفّح الأنشطة
          </Link>
          <Link href={ROUTES.SIGNUP} className={styles.chip}>
            التسجيل في المنصة
          </Link>
          <button
            type="button"
            className={styles.chip}
            disabled={sending}
            onClick={() => setDiscoverOpen((value) => !value)}
          >
            ما الأنسب لي؟
          </button>
        </div>
      )}

      {isFresh && (
        <div className={styles.suggestions}>
          {CHAT_SUGGESTIONS.map((label, index) => {
            const Icon = SUGGESTION_ICONS[index];
            return (
              <button
                type="button"
                key={label}
                onClick={() => onSend(label)}
                disabled={sending || outOfQuota}
              >
                <Icon size={14} />
                {label}
              </button>
            );
          })}
          <button type="button" onClick={() => setDiscoverOpen((value) => !value)}>
            <Sparkles size={14} />
            ما الأنسب لي؟
          </button>
          <button
            type="button"
            disabled={sending || outOfQuota}
            onClick={() =>
              onSend(
                CHAT_PAGE_PROMPTS.find(([prefix]) => pathname.startsWith(prefix))?.[1] ??
                  CHAT_PAGE_PROMPT_FALLBACK
              )
            }
          >
            <HelpCircle size={14} />
            ساعدني في هذه الصفحة
          </button>
        </div>
      )}

      {discoverOpen && (
        <section className={styles.discovery}>
          <p>{CHAT_TEXT.discoveryTitle}</p>
          <div className={styles.chips}>
            {INTERESTS.map((value) => (
              <button
                className={`${styles.chip} ${interest === value ? styles.chipOn : ""}`}
                type="button"
                key={value}
                onClick={() => setInterest(value)}
              >
                {CATEGORY_LABELS[value]}
              </button>
            ))}
          </div>
          {recommended.length ? (
            <div className={styles.activityList}>
              {recommended.map((activity) => (
                <Link
                  href={ROUTES.ACTIVITY_DETAILS(activity.id)}
                  className={styles.activityCard}
                  key={activity.id}
                >
                  <strong>{activity.title}</strong>
                  <span>
                    <MapPin size={12} />
                    {activity.placeName || CHAT_TEXT.onlineActivity} · {activity.durationHours} ساعة
                  </span>
                </Link>
              ))}
            </div>
          ) : (
            <small>{CHAT_TEXT.discoveryEmpty}</small>
          )}
        </section>
      )}

      {notice && (
        <small className={styles.notice} role="status">
          {notice}
        </small>
      )}
      <div ref={bottomRef} />
    </div>
  );
};

export default ChatConversation;
