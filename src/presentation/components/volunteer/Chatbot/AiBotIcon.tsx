import styles from "./Chatbot.module.scss";

/**
 * Custom animated AI robot icon for the chatbot FAB.
 * Animates: orbiting neural nodes, blinking eyes, scan line, antenna pulse,
 * frequency mouth bars, and a continuous glow — all pure CSS keyframes.
 */
export function AiBotIcon() {
  return (
    <svg
      className={styles.aiBotIcon}
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <defs>
        {/* Clip scan line to head boundaries */}
        <clipPath id="cbHeadClip">
          <rect x="8" y="12" width="24" height="18" rx="5.5" />
        </clipPath>
      </defs>

      {/* ── Orbiting neural nodes — each <g> rotates around SVG centre (20,20) ── */}
      <g className={styles.orbitG1}><circle cx="20" cy="2"   r="2.2" fill="rgba(74,222,128,0.9)"   /></g>
      <g className={styles.orbitG2}><circle cx="20" cy="2"   r="1.7" fill="rgba(74,222,128,0.55)"  /></g>
      <g className={styles.orbitG3}><circle cx="20" cy="2"   r="1.7" fill="rgba(255,255,255,0.45)" /></g>

      {/* ── Robot head ── */}
      <rect x="8" y="12" width="24" height="18" rx="5.5"
        fill="rgba(255,255,255,0.14)" stroke="rgba(255,255,255,0.33)" strokeWidth="1.2" />

      {/* ── Scanning line (clipped to head) ── */}
      <rect className={styles.scanLine}
        x="8" y="12.5" width="24" height="1.5" rx="0.75"
        fill="rgba(74,222,128,0.65)" clipPath="url(#cbHeadClip)" />

      {/* ── Eyes ── */}
      <ellipse className={styles.eyeLeft}  cx="15"  cy="20.5" rx="2.8" ry="3.2" fill="white" />
      <ellipse className={styles.eyeRight} cx="25"  cy="20.5" rx="2.8" ry="3.2" fill="white" />
      {/* Pupils */}
      <circle cx="15.8" cy="20.2" r="1.1" fill="#15803d" />
      <circle cx="25.8" cy="20.2" r="1.1" fill="#15803d" />
      {/* Eye shine */}
      <circle cx="14.5" cy="19.1" r="0.7" fill="rgba(255,255,255,0.82)" />
      <circle cx="24.5" cy="19.1" r="0.7" fill="rgba(255,255,255,0.82)" />

      {/* ── Frequency mouth bars (sound-equaliser style) ── */}
      <rect className={styles.mBar1} x="11.5" y="27.5" width="1.8" height="2"   rx="0.9" fill="rgba(255,255,255,0.38)" />
      <rect className={styles.mBar2} x="14.5" y="26"   width="1.8" height="3.5" rx="0.9" fill="rgba(255,255,255,0.60)" />
      <rect className={styles.mBar3} x="17.5" y="24.5" width="1.8" height="5"   rx="0.9" fill="rgba(255,255,255,0.90)" />
      <rect className={styles.mBar4} x="20.5" y="24.5" width="1.8" height="5"   rx="0.9" fill="rgba(255,255,255,0.90)" />
      <rect className={styles.mBar5} x="23.5" y="26"   width="1.8" height="3.5" rx="0.9" fill="rgba(255,255,255,0.60)" />
      <rect className={styles.mBar6} x="26.5" y="27.5" width="1.8" height="2"   rx="0.9" fill="rgba(255,255,255,0.38)" />

      {/* ── Antenna stem + pulsing tip ── */}
      <line x1="20" y1="7" x2="20" y2="12"
        stroke="rgba(255,255,255,0.38)" strokeWidth="1.5" strokeLinecap="round" />
      <circle className={styles.antennaDot} cx="20" cy="5.5" r="2.2" fill="#4ade80" />

      {/* ── Corner circuit accents ── */}
      <path d="M8 17 L5.5 17 L5.5 14.5"
        stroke="rgba(74,222,128,0.48)" strokeWidth="1" fill="none"
        strokeLinecap="round" strokeLinejoin="round" />
      <path d="M32 17 L34.5 17 L34.5 14.5"
        stroke="rgba(74,222,128,0.48)" strokeWidth="1" fill="none"
        strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
