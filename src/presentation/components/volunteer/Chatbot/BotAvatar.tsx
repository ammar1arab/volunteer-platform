"use client";

import { useRive } from "@rive-app/react-canvas";
import { useRef, useState } from "react";
import { BOT_RIVE } from "@/presentation/constants";
import type { BotPose } from "@/presentation/hooks/uiHooks/useBotDirector";
import styles from "./Chatbot.module.scss";

export const BOT_POSES: Record<BotPose, string> = {
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

const POSE_KEYS = Object.keys(BOT_POSES) as BotPose[];

type Props = {
  pose: BotPose;
  poking: boolean;
  reduced: boolean;
  asleep: boolean;
};

function clipName(pose: BotPose, poking: boolean, asleep: boolean) {
  if (poking) return "poke";
  if (asleep) return "rest";
  return pose;
}

function PngFaces({ pose }: { pose: BotPose }) {
  return (
    <>
      {POSE_KEYS.map((key) => (
        <img
          key={key}
          className={`${styles.botFace} ${pose === key ? styles.botFaceOn : ""}`}
          src={BOT_POSES[key]}
          alt=""
          width={96}
          height={96}
          draggable={false}
        />
      ))}
    </>
  );
}

function RiveFace({ pose, poking, asleep }: { pose: BotPose; poking: boolean; asleep: boolean }) {
  const [failed, setFailed] = useState(false);
  const last = useRef("");
  const clip = clipName(pose, poking, asleep);
  const { rive, RiveComponent } = useRive({
    src: BOT_RIVE.src,
    artboard: BOT_RIVE.artboard,
    autoplay: true,
    animations: clip,
    onLoadError: () => setFailed(true)
  });

  if (rive && last.current !== clip) {
    last.current = clip;
    rive.stop();
    rive.play(clip);
  }

  if (failed) return <PngFaces pose={pose} />;
  return <RiveComponent className={`${styles.botFace} ${styles.botFaceOn}`} />;
}

const BotAvatar = ({ pose, poking, reduced, asleep }: Props) => {
  return (
    <>
      {reduced ? (
        <PngFaces pose={pose} />
      ) : (
        <RiveFace pose={pose} poking={poking} asleep={asleep} />
      )}
      {asleep && <span className={styles.zzz}>z</span>}
    </>
  );
};

export default BotAvatar;
