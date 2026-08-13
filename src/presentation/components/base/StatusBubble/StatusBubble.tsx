'use client';

import { CheckCircle2, XCircle } from 'lucide-react';
import styles from './StatusBubble.module.scss';

interface Props {
  type: 'success' | 'error';
  message: string;
  onDone?: () => void;
  duration?: number;
}

const StatusBubble = ({ type, message, onDone, duration = 2000 }: Props) => {
  const Icon = type === 'success' ? CheckCircle2 : XCircle;

  return (
    <div
      className={styles.overlay}
      style={{ '--hold': `${duration}ms` } as React.CSSProperties}
      onAnimationEnd={(e) => {
        if (e.target !== e.currentTarget) return;
        if (e.animationName.includes('statusBubbleOut')) onDone?.();
      }}
    >
      <div className={styles.bubble}>
        <div className={`${styles.iconWrap} ${styles[type]}`}>
          <Icon size={34} strokeWidth={2} />
        </div>
        <p className={styles.message}>{message}</p>
      </div>
    </div>
  );
};

export default StatusBubble;
