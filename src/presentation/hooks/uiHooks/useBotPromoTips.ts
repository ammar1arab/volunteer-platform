"use client";

import { useMemo, useRef } from "react";
import { usePathname } from "next/navigation";
import type { ChatPromoKind } from "@/core/application/dtos";
import { chatPromoPolishSchema } from "@/lib/chat/schemas";
import {
  CHAT_BOT_TIP_MOMENTS,
  CHAT_PROMO_GAP_MS,
  CHAT_PROMO_PAGE_TIPS,
  CHAT_PROMO_SHOW_MS,
  CHAT_PROMO_TIPS,
  type BotPose,
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

export type BotPromoSense = {
  settled: boolean;
  asleep: boolean;
  playing: boolean;
  docked: boolean;
  pose: BotPose;
  thinking: boolean;
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

function pageTip(path: string, fixed: readonly ChatPromoTip[]): ChatPromoTip | undefined {
  const hit = CHAT_PROMO_PAGE_TIPS.find(
    ([prefix]) => path === prefix || path.startsWith(`${prefix}/`)
  );
  return hit ? fixed.find((tip) => tip.id === hit[1]) : undefined;
}

function pickTip(path: string, fixed: readonly ChatPromoTip[], events: BotPromoTip[], tick: number): BotPromoTip {
  const page = pageTip(path, fixed);
  if (page) return page;
  if (events.length && tick % 2 === 0) return events[Math.floor(tick / 2) % events.length];
  return fixed[Math.floor(tick / 2) % fixed.length];
}

export function useBotPromoTips(showTips: boolean, sense: BotPromoSense) {
  const pathname = usePathname();
  const activities = useActivities({ filter: "published", enabled: showTips });
  const posts = useFeaturedPosts({ activeOnly: true, enabled: showTips });
  const magazines = useMonthlyMagazines({ activeOnly: true, enabled: showTips });
  const spotlights = useVolunteerSpotlight({ activeOnly: true, enabled: showTips });
  const now = useNow(showTips);
  const born = useRef(0);
  const lastStart = useRef(0);
  const shown = useRef(false);
  const lastPath = useRef(pathname);
  const lastThink = useRef(sense.thinking);

  if (!showTips) {
    born.current = 0;
    lastStart.current = 0;
    shown.current = false;
  } else if (now > 0 && !born.current) {
    born.current = now;
    lastStart.current = now;
  }

  const pathChanged = pathname !== lastPath.current;
  if (pathChanged) lastPath.current = pathname;
  const replyDone = lastThink.current && !sense.thinking;
  lastThink.current = sense.thinking;

  const situation =
    sense.docked && !sense.asleep && CHAT_BOT_TIP_MOMENTS.includes(sense.pose);
  const canStart =
    showTips &&
    !sense.asleep &&
    !sense.playing &&
    (sense.settled || situation || pathChanged || replyDone);
  const since = lastStart.current ? now - lastStart.current : Number.POSITIVE_INFINITY;
  const gapOk = since >= CHAT_PROMO_GAP_MS;
  const heartbeat = sense.settled && gapOk && lastStart.current > 0;

  if (!shown.current && canStart && gapOk && (heartbeat || situation || pathChanged || replyDone)) {
    lastStart.current = now || Date.now();
    shown.current = true;
  }
  if (shown.current && now - lastStart.current >= CHAT_PROMO_SHOW_MS) {
    shown.current = false;
  }

  const visible = shown.current && showTips && !sense.playing && !sense.asleep;
  const tick = Math.max(0, Math.floor((born.current ? now - born.current : 0) / CHAT_PROMO_GAP_MS));

  const events = useMemo(
    () => (showTips ? eventTipsFromLists(activities.list, posts.list, magazines.list, spotlights.list) : []),
    [showTips, activities.list, posts.list, magazines.list, spotlights.list]
  );

  const template = pickTip(pathname, CHAT_PROMO_TIPS, events, tick);
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
      enabled: showTips && Boolean(template.kind && template.sourceId),
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
