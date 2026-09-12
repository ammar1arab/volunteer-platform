"use client";

import { motion, useTransform } from "framer-motion";
import { CHAT_TIPS } from "@/presentation/constants";
import { useBotDirector, useBotPresence, useBotPromoTips } from "@/presentation/hooks";
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
  const tipsLive = showTips && bot.settled && !bot.asleep;
  const promo = useBotPromoTips(tipsLive);
  const scaleX = useTransform([bot.facing, bot.stretchX], ([face, stretch]: number[]) =>
    bot.reduced ? 1 : face * stretch
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
          onClick={openChat}
        >
          <motion.span className={styles.botShadow} style={{ scale: shadow, opacity: shadow }} />
          <motion.span
            className={`${styles.botBody} ${bot.pose === "torch" ? styles.botGlow : ""}`}
            data-asleep={bot.asleep ? "true" : "false"}
            style={{
              rotate: bot.reduced ? 0 : bot.tilt,
              scaleX,
              scaleY: bot.reduced ? 1 : bot.stretchY
            }}
          >
            <BotAvatar pose={bot.pose} asleep={bot.asleep} />
          </motion.span>
        </motion.button>

        {tipsLive && <BotPromoChip tip={promo.tip} onOpenChat={openChat} />}
      </motion.div>
    </div>
  );
};

export default BotLauncher;
