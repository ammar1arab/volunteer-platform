"use client";

import { useRive, useStateMachineInput } from "@rive-app/react-canvas";
import { useRef, useState } from "react";
import { BOT_RIVE } from "@/presentation/constants";
import type { BotPose } from "@/presentation/hooks/uiHooks/useBotDirector";
import { useFetchData } from "@/presentation/query";
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

function RiveFace({ pose, poking }: { pose: BotPose; poking: boolean }) {
  const [failed, setFailed] = useState(false);
  const poked = useRef(false);
  const { rive, RiveComponent } = useRive({
    src: BOT_RIVE.src,
    stateMachine: BOT_RIVE.stateMachine,
    autoplay: true,
    onLoadError: () => setFailed(true)
  });
  const poseInput = useStateMachineInput(rive, BOT_RIVE.stateMachine, BOT_RIVE.poseInput);
  const pokeInput = useStateMachineInput(rive, BOT_RIVE.stateMachine, BOT_RIVE.pokeTrigger);

  if (poseInput) poseInput.value = BOT_RIVE.poses[pose];
  if (poking && pokeInput && !poked.current) {
    poked.current = true;
    pokeInput.fire();
  }
  if (!poking) poked.current = false;

  if (failed) return <PngFaces pose={pose} />;
  return <RiveComponent className={`${styles.botFace} ${styles.botFaceOn}`} />;
}

const BotAvatar = ({ pose, poking, reduced, asleep }: Props) => {
  const riveReady = useFetchData<boolean>({
    queryKey: ["rive", BOT_RIVE.src],
    request: async () => {
      try {
        const response = await fetch(BOT_RIVE.src, { method: "HEAD" });
        return response.ok;
      } catch {
        return false;
      }
    },
    options: { staleTime: 60 * 60_000, retry: false, refetchOnWindowFocus: false }
  });

  const useRiveFace = Boolean(riveReady.data) && !reduced;

  return (
    <>
      {useRiveFace ? <RiveFace pose={pose} poking={poking} /> : <PngFaces pose={pose} />}
      {asleep && <span className={styles.zzz}>z</span>}
    </>
  );
};

export default BotAvatar;
