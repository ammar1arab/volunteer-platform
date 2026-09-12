"use client";

import { motion, useTransform } from "framer-motion";
import { useBotDirector } from "@/presentation/hooks/uiHooks/useBotDirector";
import { useBotPromoTips } from "@/presentation/hooks/uiHooks/useBotPromoTips";
import { CHAT_TIPS } from "@/presentation/constants";
import BotAvatar from "./BotAvatar";
import BotPromoChip from "./BotPromoChip";
import styles from "./Chatbot.module.scss";

type Props = {
  thinking: boolean;
  onOpen: () => void;
};

const BotLauncher = ({ thinking, onOpen }: Props) => {
  const bot = useBotDirector(true, thinking);
  const promo = useBotPromoTips(!bot.asleep);
  const scaleX = useTransform([bot.facing, bot.stretchX], ([face, stretch]: number[]) => face * stretch);
  const rotate = useTransform([bot.tilt, bot.spin], ([tilt, spin]: number[]) =>
    bot.reduced ? 0 : tilt + spin
  );
  const shadow = useTransform(bot.y, (value) => (value < -90 ? 0 : Math.max(0.22, 1 + value / 90)));
  const pointer = useTransform(bot.fade, (value) => (value < 0.35 ? "none" : "auto"));
  const torch = bot.pose === "torch";

  function openChat() {
    if (bot.reduced) {
      onOpen();
      return;
    }
    bot.poke(onOpen);
  }

  return (
    <div className={styles.stage}>
      <motion.div className={styles.actor} style={{ x: bot.x, y: bot.y, opacity: bot.fade, pointerEvents: pointer }}>
        <motion.button
          type="button"
          className={styles.launcher}
          aria-label={CHAT_TIPS.open}
          aria-expanded={false}
          onClick={openChat}
        >
          <motion.span className={styles.botShadow} style={{ scale: shadow, opacity: shadow }} />
          <motion.span
            className={`${styles.botBody} ${torch ? styles.botGlow : ""}`}
            data-asleep={bot.asleep ? "true" : "false"}
            style={{
              rotate: bot.reduced ? 0 : rotate,
              scaleX: bot.reduced ? 1 : scaleX,
              scaleY: bot.reduced ? 1 : bot.stretchY
            }}
          >
            <BotAvatar pose={bot.pose} poking={bot.poking} reduced={bot.reduced} asleep={bot.asleep} />
          </motion.span>
        </motion.button>

        {!bot.asleep && <BotPromoChip tip={promo.tip} onOpenChat={openChat} />}
      </motion.div>
    </div>
  );
};

export default BotLauncher;
