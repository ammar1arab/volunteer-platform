"use client";

import { motion, useTransform } from "framer-motion";
import type { PointerEvent } from "react";
import { useRef } from "react";
import { CHAT_BOT_TIP_MOMENTS, CHAT_PROMO_SHOW_MS, CHAT_TIPS } from "@/presentation/constants";
import { useBotDirector, useBotPresence, useBotPromoTips, useNow } from "@/presentation/hooks";
import BotAvatar from "./BotAvatar";
import BotPromoChip from "./BotPromoChip";
import styles from "./Chatbot.module.scss";

interface Props {
  thinking: boolean;
  onOpen: () => void;
}

const BotLauncher = ({ thinking, onOpen }: Props) => {
  const { showTips } = useBotPresence();
  const bot = useBotDirector(true, thinking);
  const promo = useBotPromoTips(showTips);
  const moment = bot.docked && !bot.asleep && CHAT_BOT_TIP_MOMENTS.includes(bot.pose);
  const trigger = showTips && !bot.asleep && !bot.playing && (moment || (bot.settled && promo.visible));
  const clock = useNow(showTips);
  const shownAt = useRef(0);
  const armed = useRef(true);
  if (clock > 0) {
    if (shownAt.current && clock - shownAt.current >= CHAT_PROMO_SHOW_MS) {
      shownAt.current = 0;
      armed.current = false;
    }
    if (trigger && armed.current && !shownAt.current) shownAt.current = clock;
    if (!trigger) armed.current = true;
  }
  const showChip = showTips && !bot.asleep && !bot.playing && shownAt.current > 0;
  const scaleX = useTransform([bot.facing, bot.stretchX, bot.grow], ([face, stretch, pulse]: number[]) =>
    bot.reduced ? 1 : face * stretch * pulse
  );
  const scaleY = useTransform([bot.stretchY, bot.grow], ([stretch, pulse]: number[]) =>
    bot.reduced ? 1 : stretch * pulse
  );
  const shadow = useTransform(bot.y, (value) => (value < -90 ? 0 : Math.max(0.22, 1 + value / 90)));
  const pointer = useTransform(bot.fade, (value) => (value < 0.35 ? "none" : "auto"));

  function openChat() {
    if (bot.reduced) {
      onOpen();
      return;
    }
    bot.poke(onOpen);
  }

  function down(event: PointerEvent<HTMLButtonElement>) {
    if (event.button !== 0 || bot.reduced) return;
    event.currentTarget.setPointerCapture(event.pointerId);
    bot.grab(event.clientX, event.clientY);
  }

  function drag(event: PointerEvent<HTMLButtonElement>) {
    if (!event.currentTarget.hasPointerCapture(event.pointerId)) return;
    bot.move(event.clientX, event.clientY);
  }

  function up(event: PointerEvent<HTMLButtonElement>, open = true) {
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
    if (bot.reduced) return;
    if (!bot.release() && open) openChat();
  }

  return (
    <div className={styles.stage}>
      <motion.div
        className={styles.actor}
        style={{ x: bot.x, y: bot.y, opacity: bot.fade, pointerEvents: pointer }}
      >
        <motion.button
          type="button"
          className={styles.launcher}
          aria-label={CHAT_TIPS.open}
          aria-expanded={false}
          data-playing={bot.playing ? "true" : "false"}
          onPointerDown={down}
          onPointerMove={drag}
          onPointerUp={up}
          onPointerCancel={(event) => up(event, false)}
          onClick={(event) => {
            if (event.detail === 0) openChat();
          }}
        >
          <motion.span className={styles.botShadow} style={{ scale: shadow, opacity: shadow }} />
          <motion.span
            className={`${styles.botBody} ${bot.pose === "torch" ? styles.botGlow : ""}`}
            data-asleep={bot.asleep ? "true" : "false"}
            style={{
              rotate: bot.reduced ? 0 : bot.tilt,
              scaleX,
              scaleY
            }}
          >
            <BotAvatar pose={bot.pose} asleep={bot.asleep} />
          </motion.span>
        </motion.button>

        {showChip && <BotPromoChip tip={promo.tip} onOpenChat={openChat} />}
      </motion.div>
    </div>
  );
};

export default BotLauncher;
