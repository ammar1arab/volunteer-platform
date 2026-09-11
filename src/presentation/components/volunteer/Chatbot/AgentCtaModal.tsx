"use client";

import { ArrowUpLeft, Sparkles } from "lucide-react";
import Modal from "@/presentation/components/state/Modal/Modal";
import { CHAT_AGENT_CTA } from "@/presentation/constants";
import styles from "./Chatbot.module.scss";

type Props = {
  open: boolean;
  onClose: () => void;
};

const CtaRobot = () => (
  <div className={styles.robotStage} aria-hidden>
    <div className={styles.robotGlow} />
    <svg className={styles.robot} viewBox="0 0 120 140" fill="none">
      <ellipse className={styles.robotFloor} cx="60" cy="128" rx="28" ry="5" />
      <g className={styles.robotBody}>
        <line className={styles.robotAntenna} x1="60" y1="22" x2="60" y2="10" />
        <circle className={styles.robotSpark} cx="60" cy="8" r="3.5" />
        <rect className={styles.robotHead} x="32" y="22" width="56" height="40" rx="16" />
        <circle className={styles.robotEye} cx="48" cy="42" r="5" />
        <circle className={styles.robotEye} cx="72" cy="42" r="5" />
        <circle className={styles.robotEyeShine} cx="46.5" cy="40.5" r="1.6" />
        <circle className={styles.robotEyeShine} cx="70.5" cy="40.5" r="1.6" />
        <path className={styles.robotSmile} d="M50 52c3.2 3.2 16.8 3.2 20 0" />
        <rect className={styles.robotTorso} x="34" y="66" width="52" height="40" rx="14" />
        <circle className={styles.robotCore} cx="60" cy="86" r="7" />
        <circle className={styles.robotCorePulse} cx="60" cy="86" r="7" />
        <g className={styles.robotArmLeft}>
          <rect x="18" y="70" width="12" height="28" rx="6" />
        </g>
        <g className={styles.robotArmRight}>
          <rect x="90" y="70" width="12" height="28" rx="6" />
        </g>
        <rect className={styles.robotLeg} x="42" y="108" width="12" height="16" rx="5" />
        <rect className={styles.robotLeg} x="66" y="108" width="12" height="16" rx="5" />
      </g>
    </svg>
  </div>
);

const AgentCtaModal = ({ open, onClose }: Props) => (
  <Modal isOpen={open} onClose={onClose} title={null} size="sm">
    <div className={styles.agentCta}>
      <div className={styles.agentHero}>
        <span className={styles.agentBadge}>
          <Sparkles size={12} />
          {CHAT_AGENT_CTA.eyebrow}
        </span>
        <CtaRobot />
      </div>

      <div className={styles.agentCopy}>
        <h3>{CHAT_AGENT_CTA.title}</h3>
        <p>{CHAT_AGENT_CTA.lead}</p>
        <small>{CHAT_AGENT_CTA.proof}</small>
      </div>

      <a className={styles.agentCtaBtn} href={CHAT_AGENT_CTA.whatsapp} target="_blank" rel="noreferrer">
        {CHAT_AGENT_CTA.action}
        <ArrowUpLeft size={16} />
      </a>
    </div>
  </Modal>
);

export default AgentCtaModal;
