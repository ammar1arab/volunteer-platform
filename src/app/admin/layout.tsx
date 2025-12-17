'use client';

import { ReactNode } from 'react';
import { useAuth } from '@/presentation/hooks';
import styles from './layout.module.scss';

interface AdminLayoutProps {
  children: ReactNode;
}

const AdminLayout = ({ children }: AdminLayoutProps) => {
  const { isLoading } = useAuth({
    requireAuth: true,
    requireRole: 'ADMIN',
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

export default AdminLayout;