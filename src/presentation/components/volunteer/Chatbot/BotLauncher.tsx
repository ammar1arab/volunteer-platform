"use client";

import { motion, useTransform } from "framer-motion";
import type { PointerEvent } from "react";
import { useBotDirector, useBotPresence, useBotPromoTips } from "@/presentation/hooks";
import { CHAT_TIPS } from "@/presentation/constants";
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
  const promo = useBotPromoTips(showTips, {
    settled: bot.settled,
    asleep: bot.asleep,
    playing: bot.playing,
    docked: bot.docked,
    pose: bot.pose,
    thinking
  });
  const scaleX = useTransform([bot.facing, bot.stretchX, bot.grow], ([face, stretch, pulse]: number[]) =>
    bot.reduced ? 1 : face * stretch * pulse
  );
  const scaleY = useTransform([bot.stretchY, bot.grow], ([stretch, pulse]: number[]) =>
    bot.reduced ? 1 : stretch * pulse
  );
  const turn = useTransform([bot.tilt, bot.spin], ([lean, twirl]: number[]) =>
    bot.reduced ? 0 : lean + twirl
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
          onDoubleClick={() => bot.goHome()}
          onClick={(event) => {
            if (event.detail === 0) openChat();
          }}
        >
          <motion.span className={styles.botShadow} style={{ scale: shadow, opacity: shadow }} />
          <motion.span
            className={`${styles.botBody} ${bot.pose === "torch" ? styles.botGlow : ""}`}
            data-asleep={bot.asleep ? "true" : "false"}
            style={{
              rotate: turn,
              scaleX,
              scaleY
            }}
          >
            <BotAvatar pose={bot.pose} asleep={bot.asleep} />
          </motion.span>
        </motion.button>

        {promo.visible && <BotPromoChip tip={promo.tip} onOpenChat={openChat} />}
      </motion.div>
    </div>
  );
};

export default BotLauncher;
