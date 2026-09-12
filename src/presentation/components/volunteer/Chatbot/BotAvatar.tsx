"use client";

import { CHAT_BOT_POSES, CHAT_BOT_POSE_KEYS, type BotPose } from "@/presentation/constants";
import styles from "./Chatbot.module.scss";

interface Props {
  pose: BotPose;
  asleep: boolean;
}

const BotAvatar = ({ pose, asleep }: Props) => (
  <>
    {CHAT_BOT_POSE_KEYS.map((key) => (
      <img
        key={key}
        className={`${styles.botFace} ${pose === key ? styles.botFaceOn : ""}`}
        src={CHAT_BOT_POSES[key]}
        alt=""
        width={96}
        height={96}
        draggable={false}
      />
    ))}
    {asleep && <span className={styles.zzz}>z</span>}
  </>
);

export default BotAvatar;
