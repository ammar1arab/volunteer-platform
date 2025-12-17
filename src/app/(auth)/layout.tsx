import type { ReactNode } from 'react';
import styles from './layout.module.scss';

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className={styles.shell}>
      <div className={styles.container}>{children}</div>
    </div>
  );
}
