'use client';

import { useEffect, useState } from 'react';
import { CheckCircle2, XCircle } from 'lucide-react';
import styles from './StatusBubble.module.scss';

interface Props {
  type: 'success' | 'error';
  message: string;
  onDone?: () => void;
  duration?: number;
}

const StatusBubble = ({ type, message, onDone, duration = 2000 }: Props) => {
  const [out, setOut] = useState(false);

  useEffect(() => {
    const t1 = setTimeout(() => setOut(true), duration);
    const t2 = setTimeout(() => onDone?.(), duration + 300);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, [duration, onDone]);

  const Icon = type === 'success' ? CheckCircle2 : XCircle;

  return (
    <div className={`${styles.overlay} ${out ? styles.out : ''}`}>
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