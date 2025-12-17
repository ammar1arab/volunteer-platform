'use client';

import { ReactNode } from 'react';
import { useAuth } from '@/presentation/hooks';
import styles from './layout.module.scss';

interface VolunteerLayoutProps {
  children: ReactNode;
}

const VolunteerLayout = ({ children }: VolunteerLayoutProps) => {
  const { isLoading } = useAuth({
    requireAuth: true,
    requireRole: 'VOLUNTEER',
  });

  if (isLoading) {
    return (
      <div className={styles.loading}>
        <p>جاري التحميل...</p>
      </div>
    );
  }

  return <>{children}</>;
};

export default VolunteerLayout;