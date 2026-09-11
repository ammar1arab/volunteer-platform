"use client";

import { motion, useTransform } from "framer-motion";
import { useBotDirector, type BotPose } from "@/presentation/hooks/uiHooks/useBotDirector";
import { CHAT_TEXT, CHAT_TIPS } from "@/presentation/constants";
import styles from "./Chatbot.module.scss";

const POSES: Record<BotPose, string> = {
  idle: "/images/basmat-agent-idle.png",
  run: "/images/basmat-agent-run.png",
  invite: "/images/basmat-agent-invite.png",
  cheer: "/images/basmat-agent-cheer.png",
  think: "/images/basmat-agent-think.png",
  thinking: "/images/basmat-agent-thinking.png",
  search: "/images/basmat-agent-search.png",
  rest: "/images/basmat-agent-rest.png",
  torch: "/images/basmat-agent-torch.png",
  wave: "/images/basmat-agent-wave.png",
  greeting: "/images/basmat-agent-greeting.png",
  success: "/images/basmat-agent-success.png"
};

const POSE_KEYS = Object.keys(POSES) as BotPose[];

type Props = {
  thinking: boolean;
  onOpen: () => void;
};

const BotLauncher = ({ thinking, onOpen }: Props) => {
  const bot = useBotDirector(true, thinking);
  const scaleX = useTransform([bot.facing, bot.stretchX], ([face, stretch]: number[]) => face * stretch);
  const rotate = useTransform([bot.tilt, bot.spin], ([tilt, spin]: number[]) =>
    bot.reduced ? 0 : tilt + spin
  );
  const shadow = useTransform(bot.y, (value) => (value < -90 ? 0 : Math.max(0.22, 1 + value / 90)));
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
      <motion.button
        type="button"
        className={styles.launcher}
        aria-label={CHAT_TIPS.open}
        aria-expanded={false}
        onClick={openChat}
        style={{ x: bot.x, y: bot.y, opacity: bot.fade }}
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
          {POSE_KEYS.map((key) => (
            <img
              key={key}
              className={`${styles.botFace} ${bot.pose === key ? styles.botFaceOn : ""}`}
              src={POSES[key]}
              alt=""
              width={96}
              height={96}
              draggable={false}
            />
          ))}
          {bot.asleep && <span className={styles.zzz}>z</span>}
        </motion.span>
      </motion.button>

      {bot.docked && !bot.asleep && (
        <button className={styles.promo} type="button" onClick={onOpen}>
          {CHAT_TEXT.promo}
        </button>
      )}
    </div>
  );
};

export default BotLauncher;
