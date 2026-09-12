"use client";

import { useMemo, useRef } from "react";
import type { ChatPromoKind } from "@/core/application/dtos";
import { chatPromoPolishSchema } from "@/lib/chat/schemas";
import {
  CHAT_PROMO_CYCLE_MS,
  CHAT_PROMO_FIRST_MS,
  CHAT_PROMO_SHOW_MS,
  CHAT_PROMO_TIPS,
  type ChatPromoIcon,
  type ChatPromoTip
} from "@/presentation/constants";
import { useActivities } from "@/presentation/hooks/apiHooks/useActivities";
import { useFeaturedPosts } from "@/presentation/hooks/apiHooks/useFeaturedPosts";
import { useMonthlyMagazines } from "@/presentation/hooks/apiHooks/useMonthlyMagazine";
import { useVolunteerSpotlight } from "@/presentation/hooks/apiHooks/useVolunteerSpotlight";
import { chatApi } from "@/presentation/services";
import { queryKeys, unwrapResult, useFetchData, useNow } from "@/presentation/query";

export type BotPromoTip = ChatPromoTip & {
  kind?: ChatPromoKind;
  sourceId?: string;
  title?: string;
};

function stamp(value: string | Date | undefined) {
  if (!value) return 0;
  const time = typeof value === "string" ? Date.parse(value) : value.getTime();
  return Number.isFinite(time) ? time : 0;
}

function clip(value: string, max = 28) {
  const text = value.trim();
  return text.length > max ? `${text.slice(0, max - 1)}…` : text;
}

function newest<T>(rows: T[], when: (row: T) => number) {
  return rows.reduce<T | undefined>((best, row) => {
    if (!best) return row;
    return when(row) > when(best) ? row : best;
  }, undefined);
}

function eventTip(
  kind: ChatPromoKind,
  id: string,
  title: string,
  text: string,
  icon: ChatPromoIcon,
  href: string
): BotPromoTip {
  return {
    id: `${kind}:${id}`,
    text,
    icon,
    action: { type: "href", href },
    kind,
    sourceId: id,
    title
  };
}

function eventTipsFromLists(
  activities: { id: string; title: string; date?: string; createdAt?: string }[],
  posts: { id: string; title: string; publishedAt?: string; createdAt?: string }[],
  magazines: { id: string; title: string; monthYear?: string; createdAt?: string }[],
  spotlights: { id: string; name: string; spotlightDate?: string | Date; createdAt?: string | Date }[]
): BotPromoTip[] {
  const tips: BotPromoTip[] = [];
  const activity = newest(activities, (row) => stamp(row.date) || stamp(row.createdAt));
  if (activity) {
    const title = clip(activity.title);
    tips.push(
      eventTip(
        "activity",
        activity.id,
        title,
        `فرصة جديدة: «${title}». انضم إلينا.`,
        "HeartHandshake",
        `/activities/${activity.id}`
      )
    );
  }
  const post = newest(posts, (row) => stamp(row.publishedAt) || stamp(row.createdAt));
  if (post) {
    const title = clip(post.title);
    tips.push(
      eventTip(
        "post",
        post.id,
        title,
        `منشور جديد: «${title}».`,
        "Newspaper",
        `/posts/${post.id}`
      )
    );
  }
  const magazine = newest(magazines, (row) => stamp(row.monthYear) || stamp(row.createdAt));
  if (magazine) {
    const title = clip(magazine.title);
    tips.push(
      eventTip(
        "magazine",
        magazine.id,
        title,
        `مجلتنا: «${title}». لا تفوّتها.`,
        "BookOpen",
        "/magazines"
      )
    );
  }
  const spotlight = newest(spotlights, (row) => stamp(row.spotlightDate) || stamp(row.createdAt));
  if (spotlight) {
    const name = clip(spotlight.name, 22);
    tips.push(
      eventTip(
        "spotlight",
        spotlight.id,
        name,
        `تسليط الضوء على ${name}.`,
        "Sparkles",
        `/spotlight/${spotlight.id}`
      )
    );
  }
  return tips;
}

function pickTip(fixed: readonly ChatPromoTip[], events: BotPromoTip[], tick: number): BotPromoTip {
  if (events.length && tick % 2 === 0) return events[Math.floor(tick / 2) % events.length];
  return fixed[Math.floor(tick / 2) % fixed.length];
}

export function useBotPromoTips(enabled: boolean) {
  const live = enabled;
  const activities = useActivities({ filter: "published", enabled: live });
  const posts = useFeaturedPosts({ activeOnly: true, enabled: live });
  const magazines = useMonthlyMagazines({ activeOnly: true, enabled: live });
  const spotlights = useVolunteerSpotlight({ activeOnly: true, enabled: live });
  const now = useNow(live);
  const born = useRef(0);
  if (live && now > 0 && !born.current) born.current = now;
  const age = born.current ? now - born.current : 0;
  const due = age >= CHAT_PROMO_FIRST_MS;
  const elapsed = due ? age - CHAT_PROMO_FIRST_MS : 0;
  const tick = Math.max(0, Math.floor(elapsed / CHAT_PROMO_CYCLE_MS));
  const visible = due && elapsed % CHAT_PROMO_CYCLE_MS < CHAT_PROMO_SHOW_MS;

  const events = useMemo(
    () => (live ? eventTipsFromLists(activities.list, posts.list, magazines.list, spotlights.list) : []),
    [live, activities.list, posts.list, magazines.list, spotlights.list]
  );

  const template = pickTip(CHAT_PROMO_TIPS, events, tick);
  const polish = useFetchData<string>({
    queryKey: queryKeys.chat.promo(template.kind ?? "fixed", template.sourceId ?? template.id),
    request: async () => {
      if (!template.kind || !template.sourceId || !template.title) return template.text;
      try {
        const parsed = chatPromoPolishSchema.safeParse(
          unwrapResult(
            await chatApi.polishPromo({
              kind: template.kind,
              id: template.sourceId,
              title: template.title
            })
          )
        );
        return parsed.success && parsed.data.text ? parsed.data.text : template.text;
      } catch {
        return template.text;
      }
    },
    options: {
      enabled: live && Boolean(template.kind && template.sourceId),
      staleTime: 6 * 60 * 60 * 1000,
      retry: false
    }
  });

  return {
    tip: {
      ...template,
      text: polish.data || template.text
    },
    visible
  };
}
